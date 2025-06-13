import HTTPClient from './HTTPClient.js'

const BASE_API_PATH = '/api';

const handleAuthError = (error) => {
    if (error.status === 401) {
        document.location = './login';
    }
    throw error;
};

const logIn = (username, password) => {
    const data = {
        username: username,
        password: password
    };
    //return httpRequest(`${BASE_API_PATH}/users/login`, "post, data);
    return HTTPClient.post(`${BASE_API_PATH}/login`, data);
};

const logOut = () => {
    //return httpRequest(`${BASE_API_PATH}/users/logout`, post, {});
    return HTTPClient.post(`${BASE_API_PATH}/logout`);
};

const getCurrentUser = () => {
    return HTTPClient.get(`${BASE_API_PATH}/users/current`);
};

const register = (data) => {
    return HTTPClient.post(`${BASE_API_PATH}/register`, data);
}

const deleteAccount = () => {
    return HTTPClient.delete(`${BASE_API_PATH}/account`);
}

const createTask = (data) => {
    return HTTPClient.post(`${BASE_API_PATH}/tasks`, data);
}

const getAllTasksCurrent = () => {
    return HTTPClient.get(`${BASE_API_PATH}/tasks/current`);
}

const getUserById = (userId) => {
    return HTTPClient.get(`${BASE_API_PATH}/users/${userId}`);
}

const getLateTaskCount = (userId) => {
    return HTTPClient.get(`${BASE_API_PATH}/users/${userId}/tasks/late/count`);
}

const getLateTasks = (userId) => {
    return HTTPClient.get(`${BASE_API_PATH}/users/${userId}/tasks/late`);
}

const updateTask = (taskId, data) => {
    return HTTPClient.put(`${BASE_API_PATH}/tasks/${taskId}`, data);
}

const completeTask = (taskId, data) => {
    return HTTPClient.put(`${BASE_API_PATH}/tasks/complete/${taskId}`, data);
}


const getIncompleteTaskCount = (userId) => {
    return HTTPClient.get(`${BASE_API_PATH}/users/${userId}/tasks/incomplete`);
}

const getSharedTaskStats = (userId) => {
    return HTTPClient.get(`${BASE_API_PATH}/users/${userId}/tasks/rate`);
}


const getHousehold = () => {
    return HTTPClient.get(`${BASE_API_PATH}/household`);
}

const joinHousehold = (joinCode) => {
    const data = {
        join_code : joinCode
    };
    return HTTPClient.post(`${BASE_API_PATH}/household/join`, data);
}

const leaveHousehold = () => {
    return HTTPClient.delete(`${BASE_API_PATH}/household/leave`);
}

const removeHouseholdMember = (userId) => {
    return HTTPClient.delete(`${BASE_API_PATH}/household/users/${userId}`);
}

const getJoinCode = () => {
    return HTTPClient.get(`${BASE_API_PATH}/household/join`);
}

const updateJoinCode = () => {
    return HTTPClient.put(`${BASE_API_PATH}/household/join`);
}

const createHousehold = (householdName) => {
    const data = {
        name : householdName
    }
    return HTTPClient.post(`${BASE_API_PATH}/household`, data);
}

const deleteHousehold = () => {
    return HTTPClient.delete(`${BASE_API_PATH}/household`);
}

const makeAdmin = (userId) => {
    return HTTPClient.put(`${BASE_API_PATH}/household/admin/${userId}`);
}

const deleteTask = (taskId) => {
    return HTTPClient.delete(`${BASE_API_PATH}/tasks/${taskId}`);
}

const updateUserInfo = (username, password) => {
    const data = {
        username: username,
        password: password
    }
    return HTTPClient.put(`${BASE_API_PATH}/account`, data);
}

export default {
    getCurrentUser,
    logIn,
    logOut,
    register,
    deleteAccount,
    createTask,
    getAllTasksCurrent,
    getUserById,
    getLateTaskCount,
    getIncompleteTaskCount,
    updateTask,
    completeTask,
    getSharedTaskStats,
    getHousehold,
    joinHousehold,
    leaveHousehold,
    removeHouseholdMember,
    getJoinCode,
    updateJoinCode,
    createHousehold,
    deleteHousehold,
    makeAdmin,
    getLateTasks,
    deleteTask,
    updateUserInfo
};