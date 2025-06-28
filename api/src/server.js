const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();

const app = express();
const routes = require('./routes.js');
const PORT = process.env.PORT;

app.use(cors({
  origin: 'http://18.208.153.191', 
  credentials: true
}));

app.use(express.json());

// logger middleware
const logger = (req, res, next) => {
    const now = new Date().toLocaleString();
    console.log(`${now} - ${req.method} ${req.path} - ${res.statusCode}`);
    next();
};

app.use(logger);

app.use(routes);

// As our server to listen for incoming connections
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
