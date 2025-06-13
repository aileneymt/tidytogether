const db = require('./DBConnection.js');
const UserDAO = require('./UserDAO.js');
const Task = require('./models/Task');
module.exports = {

    getAllTasksCurrent: () => {
        return new Promise((resolve, reject) => {
            // first, create and insert the new task
            db.query(`
                INSERT INTO task (name, description, deadline, priority, notify)
                VALUES (?, ?, ?, ?, ?)
            `, [taskData.name, taskData.description, taskData.deadline, taskData.priority || 2, taskData.notify || 0])
            .then(insertResult => { // grab the added task and it's id
                const taskId = insertResult.insertId;
                return db.query(`SELECT * FROM task WHERE id=?`, [taskId]);
            })
            .then((taskResult) => { // perform inserts into user_task using all the user ids from taskData.users and the new tasks id
                fullTask = taskResult[0];
                taskData.users.forEach(userId => {
                    return db.query(`
                        INSERT INTO user_task (user_id, task_id)
                        VALUES (?, ?)`, [userId, fullTask.id]);
                });
            }).then(() => { // create the new task object to return
                let task = new Task(fullTask);
                resolve(task);
            }).catch(err => { // catch any errors
                reject({ code: 500, message: err.message });
            });

        })
    },

    createTask: (taskData) => { // pass in req.body
        return new Promise((resolve, reject) => {
            // make sure taskData is not null
            //name, description, priority, created_at, deadline, notify
            if (!taskData.name || !taskData.deadline || !taskData.users || taskData.users.length < 1) {
                reject({code: 400, message: "Invalid task data. Name, description, and users cannot be null"});
                console.log("Invalid task data. Name, description, and users cannot be null");
                return;
            }

            // turn task priority into matching integer
            if (taskData.priority == "default") {
                taskData.priority = 1;
            } else if (taskData.priority == "low") {
                taskData.priority = 3;
            } else {
                taskData.priority = 2;
            }

            let currentTime = new Date();
            if (taskData.deadline < currentTime.toISOString()) {
                reject({code: 400, message: "Deadline has already passed."});
                return;
            }

            taskData.deadline = taskData.deadline.slice(0, 19).replace('T', " ");
            let fullTask = null;

            // first, create and insert the new task
            db.query(`
                INSERT INTO task (name, description, deadline, priority, notify)
                VALUES (?, ?, ?, ?, ?)
            `, [taskData.name, taskData.description, taskData.deadline, taskData.priority || 2, taskData.notify || 0])
            .then(insertResult => { // grab the added task and it's id
                const taskId = insertResult.insertId;
                return db.query(`SELECT * FROM task WHERE id=?`, [taskId]);
            })
            .then((taskResult) => { // perform inserts into user_task using all the user ids from taskData.users and the new tasks id
                fullTask = taskResult[0];
                const promises = taskData.users.map(userId => {
                    return db.query(`
                        INSERT INTO user_task (user_id, task_id)
                        VALUES (?, ?)`, [userId, fullTask.id]);
                });

                // return promise.all so this only returns once queries for all taskData.users have completed
                return Promise.all(promises);
            })
            .then(() => {
                return db.query(`
                    SELECT 
                        task.*,
                        GROUP_CONCAT(
                            JSON_OBJECT(
                                "user_id", user.id
                            )
                        ) AS users
                    FROM task
                    LEFT JOIN user_task ON user_task.task_id = task.id
                    LEFT JOIN user on user_task.user_id = user.id
                    WHERE task.id = ? AND user.id IS NOT NULL
                    GROUP BY task.id
                    `, [fullTask.id]).then(rows => { // return the updated task
                        if (rows.length !== 1) {
                            reject({code: 500, message: `Something went wrong, no task exists with id ${fullTask.id}`});
                            return;
                        }
                        const users = rows[0].users ? JSON.parse(`[${rows[0].users}]`) : [];
                        let task = new Task({ ...rows[0], users});
                        resolve(task);
                    });
            }).catch(err => { // catch any errors
                reject({ code: 500, message: err.message });
            });
        });
        

        
        
    },

    getTask: (taskId) => {

    },

    deleteTask: (userId, taskId) => {
        if (userId === null || taskId === null) {
            throw new Error(`User and task id cannot be null.`);
        }

        return db.query(`SELECT id FROM user WHERE id=?`, [userId]).then(rows => {
            if (rows.length === 0) {
                throw new Error(`The user with id ${userId} does not exist.`);
            }

            return db.query(`SELECT * FROM user_task WHERE user_id=? AND task_id=?`, [userId, taskId]);

            // check to make sure a user_task exists between this user and that task
        }).then(rows => {
            if (rows.length === 0) {
                throw new Error('This task does not exist for the current user.');
            }

            return db.query(`DELETE FROM task WHERE id=?`, [taskId]);
        }).then(() => {
            return {success: true};
        }).catch (err => {
            throw err;
        })
    },

    updateTask: (taskId, taskData) => { // pass in req.body as taskData
        return new Promise((resolve, reject) => {
            if (!taskId || !taskData) {
                reject({code: 400, message: "Missing task information."});
            }
            
            if (!taskId || !taskData.name || !taskData.deadline || !taskData.users || taskData.users.length < 1) {
                reject({code: 400, message: "Invalid task data. Id, name, description, and users cannot be null"});
                return;
                
            }

            // turn task priority into matching integer
            if (taskData.priority == "default") {
                taskData.priority = 1;
            } else if (taskData.priority == "low") {
                taskData.priority = 3;
            } else {
                taskData.priority = 2;
            }
            
            let currentTime = new Date();
            if (taskData.deadline < currentTime.toISOString()) {
                reject({code: 400, message: "Deadline has already passed."});
                return;
            }

            taskData.deadline = taskData.deadline.slice(0, 19).replace('T', " ");
            let fullTask = null;
            // STEPS:
            // 1: Grab the task with the associated ID
            // modify the task qualities, including the completed_by_userId and completed_at attribute!!!!
            // remove all user_task entries associated with the taskId
            // reiterate through taskData.users and insert into user_task

            db.query(`SELECT id FROM task WHERE id=?`, [taskId]) // get the specific task
            .then(rows => {
                if (rows.length !== 1) {
                    reject({code: 400, message: `No task exists with id ${taskId}`});
                    return;
                }
                const query = ` 
                    UPDATE task
                    SET 
                        name=?, 
                        description=?, 
                        priority=?, 
                        deadline=?, 
                        notify=?
                    WHERE id=? 
                `;

                return db.query(query, [taskData.name, taskData.description, taskData.priority || 2, taskData.deadline, taskData.notify || 0, taskId]); // update the task
            }).then(() => { // delete all of entries in user_task associated that have the taskID
                return db.query(`
                    DELETE FROM user_task
                    WHERE task_id = ?
                    `, [taskId]);
            })
            .then(() => { // re add with everything in taskData.users
                const promises = taskData.users.map(userId => {
                    return db.query(`
                        INSERT INTO user_task (user_id, task_id)
                        VALUES (?, ?)
                    `, [userId, taskId])
                    .catch(err => {
                        if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED') {
                            console.error(`Foreign key constraint failed for user_id: ${userId}`);
                            // skip this
                        } else {
                            reject({code: 500, message: `Something went wrong.`});
                        }
                    });
                });

                // return promise.all so this only returns once queries for all taskData.users have completed
                return Promise.all(promises);
            })
            .then(() => {
                return db.query(`
                    SELECT 
                        task.*,
                        GROUP_CONCAT(
                            JSON_OBJECT(
                                "user_id", user.id
                            )
                        ) AS users
                    FROM task
                    LEFT JOIN user_task ON user_task.task_id = task.id
                    LEFT JOIN user on user_task.user_id = user.id
                    WHERE task.id = ? AND user.id IS NOT NULL
                    GROUP BY task.id
                    `, [taskId]).then(rows => { // return the updated task
                        if (rows.length !== 1) {
                            reject({code: 500, message: `Something went wrong, no task exists with id ${taskId}`});
                            return;
                        }
                        const users = rows[0].users ? JSON.parse(`[${rows[0].users}]`) : [];
                        let task = new Task({ ...rows[0], users});
                        resolve(task);
                    });
            })
            

        })
        
    },

    completeTask: (taskId, userId) => { // pass in req.body as taskData
        return new Promise((resolve, reject) => {
            if (!taskId || !userId) {
                reject({code: 400, message: "Missing task information."});
                return;
            }
            
           

            // STEPS:
            // 1: Grab the task with the associated ID
            // modify the task qualities, including the completed_by_userId and completed_at attribute!!!!
            // remove all user_task entries associated with the taskId
            // reiterate through taskData.users and insert into user_task

            let currentTime = new Date();
            currentTime = currentTime.toISOString().slice(0, 19).replace('T', " ");

            db.query(`
                SELECT * FROM user_task
                JOIN task ON task.id=user_task.task_id
                WHERE task_id=? AND user_id=?`, [taskId, userId]) // get the specific task
            .then(rows => {
                if (rows.length !== 1) {
                    //reject({code: 400, message: `No task exists with id ${taskId} that is assigned to user ${userId}.`});
                    throw new Error(`No task exists with id ${taskId} that is assigned to user ${userId}.`);
                }
                if (rows[0].completed_by_userId !== null) {
                    //reject({code: 400, message: `The task with id ${taskId} has already been completed.`});
                    throw new Error(`The task with id ${taskId} has already been completed.`);
                }
                const query = ` 
                    UPDATE task
                    SET 
                        completed_at=?, 
                        completed_by_userId=?
                    WHERE id=? 
                `;

                return db.query(query, [currentTime, userId, taskId]); // update the task
            // }).then(() => { // delete all of entries in user_task associated that have the taskID
            //     return db.query(`
            //         DELETE FROM user_task
            //         WHERE task_id = ?
            //         `, [taskId]);
            }).then(() => { // increment user
                return db.query(`
                    UPDATE user
                    SET numCompleted = numCompleted + 1
                    WHERE id = ?;
                    `, [userId]);

            }).then (() => {
                
                resolve({success: true});
            }).catch(err => {
                reject({code: 400, message: err.message});
            });
            
        })
        
    },

    getLateTaskCount: (userId) => {
        // return the total number of tasks the user has been assigned that is past its deadline
        let currentTime = new Date();
        currentTime = currentTime.toISOString().slice(0, 19).replace('T', " ");
        console.log("Current time: " + currentTime);
        return db.query('SELECT * FROM user WHERE id=?', [userId]).then(rows => {
            if (rows.length == 0) {
                throw new Error(`User not found with id ${userId}`);
            }
            const query = `
                SELECT COUNT(*) AS lateCt 
                FROM user_task
                INNER JOIN task ON user_task.task_id = task.id
                WHERE user_task.user_id=? AND task.completed_by_userId IS NULL AND task.deadline < ?
            `
            return db.query(query, [userId, currentTime]);
        }).then(rows => {
            return Number(rows[0].lateCt);
        }).catch(err => {
            throw err;
        })
    },

    getIncompleteTaskCount: (userId) => {

        // return the total number of tasks the user has been assigned and is not marked complete
        return db.query('SELECT * FROM user WHERE id=?', [userId]).then(rows => {
            if (rows.length == 0) {
                throw new Error(`User not found with id ${userId}`);
            }
            const query = `
                SELECT COUNT(*) AS incompleteCt 
                FROM user_task
                INNER JOIN task ON user_task.task_id = task.id
                WHERE user_task.user_id=? AND task.completed_by_userId IS NULL
            `
            return db.query(query, [userId]);
        }).then(rows => {
            return Number(rows[0].incompleteCt);
        }).catch(err => {
            throw err;
        })
    },


    getSharedTaskStats: (userId) => {
        return db.query('SELECT * FROM user WHERE id=?', [userId]).then(rows => {
            if (rows.length == 0) {
                throw new Error(`User not found with id ${userId}`);
            }
            const query = `
                WITH shared_tasks AS (
                    SELECT task_id
                    FROM user_task
                    GROUP BY task_id
                    HAVING COUNT(DISTINCT user_id) > 1
                ),
                user_shared_tasks AS (
                    SELECT user_task.task_id
                    FROM user_task
                    JOIN shared_tasks ON user_task.task_id = shared_tasks.task_id
                    JOIN task ON task.id = user_task.task_id
                    WHERE user_task.user_id = ? AND task.completed_by_userId IS NOT NULL
                ),
                user_completed_shared_tasks AS (
                    SELECT user_shared_tasks.task_id
                    FROM user_shared_tasks
                    JOIN task ON task.id = user_shared_tasks.task_id
                    WHERE task.completed_by_userId = ?
                )
                SELECT
                    (SELECT COUNT(*) FROM user_shared_tasks) AS total_shared_completed_tasks_user_has,
                    (SELECT COUNT(*) FROM user_completed_shared_tasks) AS total_shared_completed_tasks_user_completed;
            `;

            return db.query(query, [userId, userId]);

        }).then(rows => {
            const result = {
                completed_by_user: Number(rows[0].total_shared_completed_tasks_user_completed),
                all_completed_shared: Number(rows[0].total_shared_completed_tasks_user_has)
            }
            return result;
        }).catch(err => {
            throw err;
        })
    },



    getLateTasks: (userId) => {
        let currentTime = new Date();
        currentTime = currentTime.toISOString().slice(0, 19).replace('T', " ");
        return db.query('SELECT * FROM user WHERE id=?', [userId]).then(rows => {
            if (rows.length == 0) {
                throw new Error(`User not found with id ${userId}`);
            }
            const query = `
                SELECT * 
                FROM user_task
                INNER JOIN task ON user_task.task_id = task.id
                WHERE user_task.user_id=? AND task.completed_by_userId IS NULL AND task.deadline < ?
            `
            return db.query(query, [userId, currentTime]);
        }).then(rows => {
            return rows;
        }).catch(err => {
            throw err;
        })
    }




    // Tasks in progress: Total number of incomplete tasks currently assigned to them.
    // Total tasks completed: numCompleted
    // Late tasks: Total number of tasks currently assigned to them where the deadline has passed

    // Shared tasks completed percent: all shared tasks they have been assigned where the completed_By_userId is them / all shared tasks they have ever been assigned
    // Late rate: all incomplete tasks assigned to them that are LATE / all incomplete tasks assigned to them

    



}