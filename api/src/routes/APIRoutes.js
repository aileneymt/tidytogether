const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(express.json());

const UserDAO = require("../db/UserDAO.js");
const TaskDAO = require("../db/TaskDAO.js");
const HouseholdDAO = require("../db/HouseholdDAO.js");

const { SqlError } = require('mariadb');
const { TokenMiddleware, generateToken, removeToken } = require('../middleware/TokenAuthMiddleware');
const Task = require('../db/models/Task.js');




function getCurrentFilteredUser(req) {
    return req.user;

}

function getCurrentUserId(req) {
    return req.user.id;

}

function getHouseholdId(req) {
    return req.user.hh_id;
}


// HOUSEHOLD ASSOCIATED ENDPOINTS -----------------------------------------------------------------------------------

router.get('/household', TokenMiddleware, (req, res) => {
    // retrieve the current users household
    // include household name and array of users (not including current user)
    HouseholdDAO.getHousehold(req.user.id).then(household => {
        res.json(household);
    })
    .catch(err => {
        res.status(400).json({ error: err.message });
    })

});

router.delete('/household/users/:userId', TokenMiddleware, (req, res) => {

    // this is for an admin user to remove a member from household
    if (!req.params.userId) {
        res.status(400).json({ error: "Username must be specified." });
    }
    const currentUserId = getCurrentUserId(req);

    // !!! must be admin OR must be deleting themselves
    // all their associated tasks in user_task must be deleted
    // hh_id removed
    UserDAO.getUserById(getCurrentUserId(req)).then(user => {
        if (user.role !== "admin") {
            return Promise.reject(new Error("Must be an admin to remove members from household."));
        }
        return HouseholdDAO.removeUser(user.hh_id, req.params.userId)

    }).then(() => {
        res.json({ message: `User ${req.params.userId} has been removed from the household` });
    }).catch((err) => {
        res.status(400).json({ error: err.message });
    })

});


router.delete("/household/leave", TokenMiddleware, (req, res) => {
    // this is for the user to leave the household
    HouseholdDAO.getHHIdFromUserId(getCurrentUserId(req)).then(hhid => {
        if (!hhid) {
            throw new Error("The user is not part of any household.");
        }
        return HouseholdDAO.removeUser(hhid, getCurrentUserId(req)).then(() => {
            res.json({ message: `User ${getCurrentUserId(req)} has been removed from the household` });
        })
    }).catch((err) => {
        res.status(400).json({ error: err.message });
    })

})




router.post('/household', TokenMiddleware, (req, res) => {
    // must not be currently in any household and member status
    // req.body CAN include a name property for the household name

    HouseholdDAO.createHousehold(getCurrentUserId(req), req.body.name).then(household => {
        res.json(household);
    }).catch(err => {
        res.status(403).json({ error: err.message });
    })

});

router.delete('/household', TokenMiddleware, (req, res) => {
        // deletes a household, removes all users and their tasks. the users will still exist but they won't be linked to any household
    // must be admin
    HouseholdDAO.deleteHousehold(req.user.id).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(400).json({ error: err.message });
    })
});

router.post('/household/join', TokenMiddleware, (req, res) => {
    // request body should include a join_code property
    if (!req.body.join_code) {
        res.status(400).json({ error: "Join code must be provided." });
    }
    HouseholdDAO.joinHousehold(getCurrentUserId(req), req.body.join_code).then((result) => {
        res.json({ message: result });

    }).catch(err => {
        res.status(400).json({ error: err.message });
    })
});

router.put('/household/join', TokenMiddleware, (req, res) => {
    // only admin should be able to use this command
    // creates a random hash code, updates the household table join code column
    UserDAO.getUserById(getCurrentUserId(req)).then(user => {
        if (user.role !== "admin") {
            return Promise.reject(new Error("Must be an admin to retrieve the join code."));
        }

        return HouseholdDAO.updateJoinCode(user.hh_id);
    }).then((code) => {
        res.json({join_code: code});
    }).catch(err => {
        res.status(400).json({ error: err.message });
    })
});

router.get('/household/join', TokenMiddleware, (req, res) => {
    // only admin should be able to use this command
    // gets the random join code from the database

    UserDAO.getUserById(getCurrentUserId(req)).then(user => {
        if (user.role !== "admin") {
            return Promise.reject(new Error("Must be an admin to retrieve the join code."));
        }

        return HouseholdDAO.getJoinCode(user.hh_id);
    }).then((code) => {
        res.json({join_code: code});
    }).catch(err => {
        res.status(400).json({ error: err.message });
    })



});

router.put('/household/admin/:userId', TokenMiddleware, (req, res) => {
    if (!req.params.userId) {
        res.status(400).json({ error: "User id must be specified in parameters" });
        return;
    }
    UserDAO.getUserById(getCurrentUserId(req)).then(user => {
        if (user.role !== "admin") {
            return Promise.reject(new Error("Must be an admin."));
        }
        return HouseholdDAO.changeAdmin(req.user.id, req.params.userId);
    }).then((result) => {
        res.json(result);
    }).catch(err => {
        res.status(400).json({ error: err.message });
    });
});

// USER ASSOCIATED ENDPOINTS ------------------------------------------------------------




router.post('/login', (req, res) => {
    // receive email and password and login
    if (!req.body || !req.body.username || !req.body.password) {
        res.status(400).json({ error: "Username and password must be provided." });
    }
    UserDAO.getUserByCredentials(req.body.username, req.body.password).then(user => {
        generateToken(req, res, user);
        res.json({ user: user });
    }).catch((err) => {
        res.status(err.code || 500).json({ error: "Unable to login" });
    })
});

router.post('/register', (req, res) => {
    // create a new account and return the new user object
    // need: username, password, first name, last name
    if (!req.body) {
        res.status(404).json({ error: "User info must be provided." });
    }
    UserDAO.registerUser(req.body).then(user => {
        res.json(user);
    }).catch(err => {
        res.status(err.code || 404).json({ error: err.message });
    })

});

router.post('/logout', (req, res) => {
    removeToken(req, res);
    res.json({ success: true });
});

router.get('/users/current', TokenMiddleware, (req, res) => {
    UserDAO.getUserById(req.user.id).then(user => {
        res.json(user);

    }).catch(err => {
        res.status(401).json({ error: "Not authenticated."});
    })
});

router.get('/users', TokenMiddleware, (req, res) => {
    // retrieve all users
    UserDAO.getAllUsers().then(users => {

        res.json(users);
        //return users;
    }).catch(error => {
        res.status(error.code || 500).json({ error: error.message });
    });
});

router.get('/users/:userId([0-9]+)', TokenMiddleware, (req, res) => {
    // retrieve user by id
    if (req.params.userId == null) {
        return res.status(400).json({ error: "User id must be provided" });
    }
    UserDAO.getUserById(req.params.userId).then(user => {
        res.json(user);
    }).catch(err => {
        res.status(400).json({ err: err.message });
    })

});

router.get('/users/:username', TokenMiddleware, (req, res) => {
    // get a user by their username, returns their incomplete tasks

    if (req.params.username == null) {
        return res.status(400).json({ error: "Username must be provided" });
    }
    UserDAO.getUserByUsername(req.params.username).then(user => {
    
        res.json(user);
    }).catch(err => {
        res.status(400).json({ err: err.message });
    })

});



router.put('/account', TokenMiddleware, (req, res) => {

    UserDAO.changeUserInfo(req.user.id, req.body).then(user => {
        console.log(user);
        res.json(user);
    }).catch(err => {
        res.status(400).json({err: err.message});
    })
});


// delete endpoints
router.delete('/account', TokenMiddleware, (req, res) => {
    // delete all data associated with a specific user.
    UserDAO.deleteUser(req.user.id).then((message) => {
        res.json(message);
    }).catch(err => {
        res.status(400).json({err: err.message});
    })
    
});

router.get('/search', TokenMiddleware, (req, res) => {
    // support search function (admin looks for users to add to household);
    // this does not return any tasks associated with the user, just the users most basic data

    const { username } = req.query;
    if (!username || username.trim() === "") {
        return res.status(400).json({ error: "Username query parameter is required" });
    }

    UserDAO.searchForUser(username).then((user) => {
        res.json(user);
    }).catch(err => {
        res.json({ message: err.message });
    })
});


// TASKDAO ENDPOINTS ------------------------------------------------------------

router.get('/tasks/current', TokenMiddleware, (req, res) => {
    // get's the user's tasks
    UserDAO.getUserById(req.user.id).then(user => {
        console.log("user.tasks result:");
        console.log(user.tasks);
        res.json(user.tasks);
    }).catch(err => {
        res.status(400).json({ err: err.message });
    })
    // retrieve all tasks as an array
});

router.post('/tasks', TokenMiddleware, (req, res) => {
    // create a new task, can be shared
    // what it expects in req.body: 
    // name, deadline, and users (array of user IDs)
    if (!req.body) {
        return res.status(400).json({ error: "Task data is required" });
    }
    console.log('request to make a new task received');
    TaskDAO.createTask(req.body).then(task => {
        console.log('request to make a new task succeeded');
        res.status(200).json(task);
    }).catch(err => {
        console.log('request to make a new task failed');
        res.status(err.code || 400).json({ error: err.message });
    })
});

router.get('/tasks/current', TokenMiddleware, (req, res) => {
    // get's the user's tasks
    UserDAO.getUserByUsername(req.user.username).then(user => {
        res.json(user).tasks;
    }).catch(err => {
        res.status(400).json({ err: err.message });
    })
    // retrieve all tasks as an array
});

router.get('/tasks/:taskId', (TokenMiddleware, req, res) => {
    // retrieve a specific task 
});



router.delete('/tasks/:taskId', TokenMiddleware, (req, res) => {
    // delete specific task
    if (!req.params.taskId) {
        res.status(400).json({ err: "Cannot have null taskId"});
    }

    TaskDAO.deleteTask(req.user.id, req.params.taskId).then(result => {
        res.json(result);
    }).catch(err => {
        res.status(400).json({ err: err.message });
    })

});


router.put('/tasks/:taskId', TokenMiddleware, (req, res) => {
    // edits a specific task
    // cannot use to mark it complete

    // request body should be the same as in create task, 
    if (!req.params.taskId || !req.body) {
        return res.status(400).json({ error: "Task id and info are required" });
    }
    TaskDAO.updateTask(req.params.taskId, req.body).then(task => {
        res.json(task);
    }).catch(err => {
        res.status(err.code || 400).json({ error: err.message });
    });

});

router.put('/tasks/complete/:taskId', TokenMiddleware, (req, res) => {
    // request body should be the same as in create task, 
    if (!req.params.taskId || !req.user.id) {
        return res.status(400).json({ error: "Task id and user id are required" });
    }

    TaskDAO.completeTask(req.params.taskId, req.user.id).then(result => {
        if (!result.success) {
            throw new Error;
        }
        res.status(200).json({success: true});
    }).catch(err => {
        res.status(err.code || 400).json({ error: err.message });
    });
    
});

router.get('/users/:userId/tasks/late/count', TokenMiddleware, (req, res) => {
    if (!req.params.userId) {
        return res.status(400).json({ error: "User id is required" });
    }

    TaskDAO.getLateTasks(req.params.userId).then(tasks => {
        res.json({lateCt: tasks.length});
    }).catch(err => {
        res.status(err.code || 400).json({error:err.message});
    });
})

router.get('/users/:userId/tasks/incomplete', TokenMiddleware, (req, res) => {
    if (!req.params.userId) {
        return res.status(400).json({ error: "User id is required" });
    }

    TaskDAO.getIncompleteTaskCount(req.params.userId).then(incompleteCt => {
        res.json({incompleteCt: incompleteCt});
    }).catch(err => {
        res.status(err.code || 400).json({error:err.message});
    })
})

router.get('/users/:userId/tasks/rate', TokenMiddleware, (req, res) => {
    if (!req.params.userId) {
        return res.status(400).json({ error: "User id is required" });
    }
    TaskDAO.getSharedTaskStats(req.params.userId).then(result => {
        res.json(result);

    }).catch(err => {
        res.status(err.code || 400).json({error: err.message});
    })
});

router.get('/users/:userId/tasks/late', TokenMiddleware, (req, res) => {
    if (!req.params.userId) {
        return res.status(400).json({ error: "User id is required" });
    }


    TaskDAO.getLateTasks(req.params.userId).then(tasks => {
        res.json(tasks);
    }).catch(err => {
        res.status(err.code || 400).json({error:err.message});
    });
});





module.exports = router;