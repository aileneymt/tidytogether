const db = require('./DBConnection.js');
const User = require('./models/Household');

function generateJoinCode() {
    let joinCode = "";
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        joinCode += charset[randomIndex];
    }
    return joinCode;
}

function generateUniqueJoinCode() {
    const joinCode = generateJoinCode();

    return db.query(`SELECT COUNT(*) AS count FROM household WHERE join_code=?`, [joinCode])
        .then(rows => {
            const count = rows[0].count;
            if (count > 0) {
                return generateUniqueJoinCode(); // generate it again bc this is a duplicate code
            }
            else {
                return joinCode; // code is unique return it now
            }
        }).catch(err => {
            throw new Error(err.message);
        });
}


module.exports = {

    getJoinCode: (hhid) => {
        return db.query('SELECT join_code FROM household WHERE id=?', [hhid])
        .then(rows => {
            if (rows.length === 0) {
                throw new Error(`The household with id ${hhid} does not exist.`);
            }
            if (rows[0].join_code) {
                return rows[0].join_code;
            }
            // need to generate a join code
            return generateUniqueJoinCode().then(joinCode => {
                return db.query(`
                    UPDATE household
                    SET join_code=?
                    WHERE id=?`, [joinCode, hhid]).then(() => {
                        
                        console.log("Generated Join code: " + joinCode);
                        return joinCode;
                    })
            })

        }).catch(err => {
            throw new Error(err.message);
        })
    },

    updateJoinCode: (hhid) => {
        return db.query('SELECT join_code FROM household WHERE id=?', [hhid])
        .then(rows => {
            if (rows.length === 0) {
                throw new Error(`The household with id ${hhid} does not exist.`);
            }
            return generateUniqueJoinCode().then(joinCode => {
                return db.query(`
                    UPDATE household
                    SET join_code=?
                    WHERE id=?`, [joinCode, hhid]).then(() => {
                        
                        console.log("Generated Join code: " + joinCode);
                        return joinCode;
                    })
            })

        }).catch(err => {
            throw new Error(err.message);
        })
    },

    createHousehold: (userId, name) => {
        let hhid;
        if (name == null || name.length == 0) {
            name = "My Household";
        }
        return db.query('SELECT hh_id FROM user where id=?', [userId])
        .then (rows => {
            if (rows.length === 0) {
                throw new Error(`The user with id ${userId} does not exist.`);

            }
            if (rows[0].hh_id !== null) {
                throw new Error(`Cannot create a new household when you are already part of one.`);
            }
            // insert into household, get the newly added household and update that users hhid

            return db.query(`
                INSERT INTO household (name) VALUES (?)`, [name || "My Household"])
            .then(insertResult => {
                console.log("About the update the user");
                hhid = insertResult.insertId;
                console.log("THe new households id: " + hhid);
                return db.query(`
                    UPDATE user
                    SET hh_id=?, role="admin"
                    WHERE id=?`, [hhid, userId])
            }).then(() => {
                return db.query(
                    `SELECT * FROM household WHERE id=?`, [hhid]).then(rows => {
                        if (rows === 0) {
                            throw new Error(`Something went wrong, the newly created household cannot be retrieved.`);
                        }
                        return rows[0];
                    })
            });
        }).catch(err => {
            throw err;
        })
    },

    joinHousehold: (userId, joinCode) => {
    
        return db.query('SELECT hh_id FROM user where id=?', [userId])
        .then (rows => {
            if (rows.length === 0) {
                throw new Error(`The user with id ${userId} does not exist.`);

            }
            if (rows[0].hh_id !== null) {
                throw new Error(`Cannot join a household when you are already part of one.`);
            }

            // get the household
            return db.query(`
                SELECT id FROM household where join_code=?`, [joinCode]);

        }).then (rows => {
            if (rows.length === 0) {
                throw new Error("The join code is invalid.");
            }
            
            return db.query(`
                UPDATE user
                SET hh_id=?
                WHERE id=?
                `, [rows[0].id, userId]).then(() => {
                    return "User successfully joined household."; 
                });
        }).catch(err => {
            throw err;
        })
    },

    getHHIdFromUserId: (userId) => {
        return db.query(`SELECT hh_id from user WHERE id=?`, [userId])
        .then(rows => {
            if (rows.length === 0) {
                throw new Error(`The user with id ${userId} does not exist.`);
            }
            return rows[0].hh_id;

        }).catch(err => {
            throw err;
        })
    },

    getHousehold: (userId) => {
        let household = {};
        return db.query(`SELECT hh_id FROM user WHERE id = ?`, [userId]).then(rows => {
            if (rows.length === 0) {
                throw new Error(`The user with id ${userId} does not exist.`);
            }
            if (rows[0].hh_id == null) {
                throw new Error(`The user is not part of a household.`);
            }
            household.id = rows[0].hh_id;
            return db.query(`SELECT name FROM household WHERE id=?`, [household.id]);
        }).then(rows => {
            if (rows.length == 0) {
                throw new Error(`The household with id ${household.id} does not exist.`);
            }
            household.name = rows[0].name;
            return db.query(`
                SELECT id, username, first_name, last_name, role
                FROM user WHERE hh_id = ? AND id != ?`, [household.id, userId]);

        }).then(rows => {
            household.members = rows;
            return household;
        }).catch(err => {
            throw err;
        })
    },

    deleteHousehold: (userId) => {
        let hh_id;
        return db.query(`SELECT * FROM user WHERE id=?`, [userId]).then(rows => {
            if (rows.length === 0) {
                throw new Error(`The user with id ${userId} does not exist.`);
            }
            if (rows[0].role !== "admin") {
                throw new Error(`Only admin users are permitted to delete a household.`);
            }
            hh_id = rows[0].hh_id;

            // delete all user_task and task entries associated with users that have hh_id = null 
            
            // set hh_id field for all users in the household to null

            const query = `
                DELETE FROM user_task
                WHERE user_id IN (SELECT id FROM user WHERE hh_id = ?)      
            `
            return db.query(query, [hh_id]);
        }).then( () => {
            const query = `
                DELETE task FROM task
                LEFT JOIN user_task
                ON task.id = user_task.task_id
                WHERE user_task.task_id IS NULL
            `
            return db.query(query);
        }).then(() => {
            return db.query(`
                UPDATE user
                SET hh_id=NULL
                WHERE hh_id=?
                `, [hh_id]);
        }).then(() => {
            return db.query(`
                UPDATE user
                SET role="member"
                WHERE id=?`, [userId]);
        }).then(() => {
            return db.query(`
                DELETE household
                FROM household 
                WHERE id=?`, [hh_id]);
        }).then(() =>{
            return {success: true};
        }).catch(err => {
            throw err;
        })
    },

    removeUser: (hhid, userId) => {
        return db.query(` SELECT * FROM household WHERE id = ?`, [hhid])
        .then(rows => {
            if (rows.length === 0) {
                throw new Error (`The household with id ${hhid} does not exist.`);
            }
            return db.query(`SELECT * FROM user WHERE id=?`, [userId])
        }).then(rows => {
            if (rows.length === 0) {
                throw new Error (`The user with id ${userId} does not exist.`);
            }
            // check that the user is not an admin

            if (rows[0].role === "admin") {
                throw new Error("Admin cannot be removed from household.");
            }
            if (rows[0].hh_id === null) {
                throw new Error("The user is not part of a household.");
            }
            else if (rows[0].hh_id != hhid) { // can't remove a user from a different household
                throw new Error("The user does not exist in this household.");
            }
            
            // now remove the hhid field for that user
            return db.query(`
                UPDATE user
                SET hh_id=NULL
                WHERE id=?`, [userId]);
            
        }).then(() => {
            // now delete all entries in user_task that had userId as user_id
            return db.query(`
                DELETE FROM user_task
                WHERE user_id=?`, [userId]);

        }).then (() => {
            return db.query(`
                DELETE task
                FROM task
                LEFT JOIN user_task
                ON task.id = user_task.task_id
                WHERE user_task.task_id IS NULL;
                `);
        })
        .catch(err => {
            throw err;
        })
        
    },


    changeAdmin: (currentUserId, userId) => {
        let hhid;
        return db.query(`
            SELECT * FROM user WHERE id=?`, [currentUserId])
        .then((rows) => {
            if (rows.length == 0) {
                throw new Error(`User with id ${userId} does not exist.`);
            }
            if (rows[0].role !== 'admin') {
                throw new Error(`The current user is not an admin.`);
            }

            hhid = rows[0].hh_id;
            return db.query(`SELECT * FROM user WHERE id = ?`, [userId])
        }).then(rows => {
            
            if (rows.length == 0 || rows[0].hh_id !== hhid) {
                throw new Error(`The requested user does not exist in your household.`);
            }

            return db.query(`UPDATE user SET role="admin" WHERE id=?`, [userId]);
            
        }).then(() => {
            return db.query(`UPDATE user set role="member" WHERE id=?`, [currentUserId]);
        }).then(() => {
            return {success: true};
        }).catch(err => {
            throw err;
        })
    }


}