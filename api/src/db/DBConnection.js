const mariadb = require('mariadb');
let pool = null;

module.exports = {
    getDatabaseConnection: () => {
        if (pool == null) {
            try {
                pool = mariadb.createPool({
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    user: process.env.MYSQL_USER,
                    password: process.env.MYSQL_PASSWORD,
                    database: process.env.MYSQL_DATABASE,
                    charset: process.env.DB_CHARSET
                });
            }
            catch (error) {
                console.log("Could not connect to the database");
                throw error;
            }
            
        }
        return pool;
    },

    query: (query, params = []) => {
        const pool = module.exports.getDatabaseConnection();
        return pool.query(query, params).catch(err => {
            console.log(err);
            throw err;
        });


    },

    close: () => {
        if (pool) {
            pool.end();
            pool = null;
        }

    }


}