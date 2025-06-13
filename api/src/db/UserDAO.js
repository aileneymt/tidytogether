const db = require('./DBConnection.js');
const User = require('./models/User');
const crypto = require('crypto');

function getHashedPassword(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
          if (err) {
            reject("Error: " + err); // Handle any errors
            return;
          }
          const digest = derivedKey.toString('hex');
          resolve(digest); // Return the derived key as a promise
        });
    });
}

module.exports = {


    // probably don't actually need this one
    getAllUsers: () => {
        return db.query('SELECT * FROM user').then(rows => {
            let users = [];
            rows.forEach(row => {
                const user = new User(row);
                users.push(user.toJSON());
                
            });
            return users;
        })
    },

    getUserById: (userId) => {
        const query = ` 
           SELECT
                user.*,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        "id", task.id,
                        "name", task.name,
                        "description", task.description,
                        "priority", task.priority,
                        "created_at", task.created_at,
                        "deadline", task.deadline,
                        "completed_at", task.completed_at,
                        "notify", task.notify,
                        "completed_by_userId", task.completed_by_userId,
                        "assigned_users", (SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                "user_id", assigned_user.id,
                                "first_name", assigned_user.first_name,
                                "last_name", assigned_user.last_name
                            )
                        ) FROM user AS assigned_user
                        JOIN user_task AS ut ON assigned_user.id = ut.user_id
                        WHERE ut.task_id = task.id)

                    )
                ) AS tasks
            FROM user
            left JOIN user_task ON user.id = user_task.user_id
            left JOIN task ON user_task.task_id = task.id AND task.completed_at IS NULL
            WHERE user.id = ? 
            GROUP BY user.id;`;


        return db.query(query, [userId])
            .then(rows => {

                if (rows.length === 0) {
                    throw new Error(`User not found with id ${userId}`);
                }
                const tasks = rows[0].tasks ? JSON.parse(`[${rows[0].tasks}]`).filter(task => task.id !== null) : [];
                let user = new User({ ...rows[0], tasks});
                
                return user;
            })
    },


    getUserByCredentials: (username, password) => {
        return db.query('SELECT * FROM user WHERE username=?', [username]).then(rows => {
          if (rows.length === 1) { // we found our user
            const user = new User(rows[0]);
            return user.validatePassword(password);
          }
          // if no user with provided username
          throw new Error("No such user");
        });
    
    },

    registerUser: (userData) => {
        const salt = crypto.randomBytes(32).toString('hex');
        userData.salt = salt;
        if (!userData) {
            throw new Error ("User data cannot be null.");
        }
        if (!userData.username || !userData.password || !userData.first_name || !userData.last_name) {
            throw new Error ("Username, password, first name, and last name must be provided.");
        }
        return db.query(`SELECT * FROM user WHERE username=?`, [userData.username]).then(rows => {
            if (rows.length !== 0) {
                throw new Error("This username is already taken.");
            }
            
            return getHashedPassword(userData.password, salt);

        }).then(hashedPw => {
            return db.query(`
                INSERT INTO user (username, salt, hashedPassword, first_name, last_name)
                VALUES (?, ?, ?, ?, ?)
                `, [userData.username, salt, hashedPw, userData.first_name, userData.last_name]);
        }).then(() => {
            const user = new User(userData);
            return user;
        });
    },


    


    
    deleteUser: (userId) => {
        return db.query(`SELECT * FROM user WHERE id=?`, [userId]).then(rows => {
            if (rows.length === 0) {
                throw new Error(`User not found with id ${userId}`);

            }

            return db.query(`DELETE FROM user WHERE id=?`, [userId]);
        }).then(() => {
            return db.query(`DELETE FROM user_task WHERE user_id=?`, [userId]);
        }).then(() => {
            return db.query(`
                DELETE task
                FROM task
                LEFT JOIN user_task
                ON task.id = user_task.task_id
                WHERE user_task.task_id IS NULL`);
        }).then(() => {
            return {message: `The account of the user with id ${userId} has been deleted.`};
        }).catch(err => {
            throw err;
        })
    },
    

    searchForUser: (username) => {
        return db.query('SELECT * FROM user WHERE username=?', [username]).then(rows => {
            if (rows.length === 0) {
                throw new Error(`User not found with username ${username}`);
            }
            let user = new User(rows[0]);

            return user;
        })
    },
    // returns with not completed tasks
    // attributes we want for tasks:
    // name, description, priority, deadline, notify
    getUserByUsername: (username) => {
        //return db.query('SELECT * FROM user JOIN user_task ON user_id=user.id JOIN task ON task_id=task.id WHERE user.username=?', [username])
        console.log("Before query");
       
        const query = ` 
           SELECT
                user.*,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        "id", task.id,
                        "name", task.name,
                        "description", task.description,
                        "priority", task.priority,
                        "created_at", task.created_at,
                        "deadline", task.deadline,
                        "completed_at", task.completed_at,
                        "notify", task.notify,
                        "completed_by_userId", task.completed_by_userId
                    )
                ) AS tasks
            FROM user
            left JOIN user_task ON user.id = user_task.user_id
            left JOIN task ON user_task.task_id = task.id
            WHERE user.username = ? AND task.completed_at IS NULL
            GROUP BY user.id;`;


        return db.query(query, [username])
            .then(rows => {

                if (rows.length === 0) {
                    throw new Error(`User not found with username ${username}`);
                }
                const tasks = rows[0].tasks ? JSON.parse(`[${rows[0].tasks}]`).filter(task => task.id !== null) : [];
                let user = new User({ ...rows[0], tasks});
                
                return user;
            })

            
    },


    changeUserInfo: async (userId, data) => {
        if (data == null || (data.password == null && data.username == null)) {
            throw new Error(`New user info must be provided.`)
        }

        const rows = await db.query(`SELECT * FROM user WHERE id=?`, [userId]);
        if (rows.length === 0) {
            throw new Error(`The user with id ${userId} does not exist.`);
        }
        const currentUser = new User(rows[0]);
        const updates = {};
        let salt, hashedPw;

        if (data.username) {
            if (data.username === currentUser.username) {
                throw new Error("The new username cannot be the same as your current username.");
            }

            const rows = await db.query(`SELECT * FROM user WHERE username=?`, [data.username]);
            if (rows.length !== 0) {
                throw new Error(`This username is already taken.`)
            }

            updates.username = data.username;
        }


        if (data.password) {
            console.log("ERE")
            let isSamePassword = false;
            try {
                await currentUser.validatePassword(data.password);
                isSamePassword = true;
            } catch {
                isSamePassword = false;
            }
            
            console.log("validated password");
            if (isSamePassword) {
                throw new Error("The new password cannot be the same as your current password.");
            }
            salt = crypto.randomBytes(32).toString('hex');
            hashedPw = await getHashedPassword(data.password, salt);
            updates.hashedPassword = hashedPw;
            updates.salt = salt;
        }
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        if (fields.length === 0) {
            throw new Error("No valid changes to apply.");
        }

        const setQuery = fields.map(field => `${field} = ?`).join(", ");
        values.push(userId);

        await db.query(`UPDATE user SET ${setQuery} WHERE id=?`, values);

        return db.query(`SELECT * FROM user WHERE id=?`,[userId]);


    }
    



    
}