const express = require('express');
const router = express.Router();
const path = require('path');
const app = express();

const APIRoutes = require('./routes/APIRoutes.js');
router.use('/api', APIRoutes);
/*
const frontendPath = path.resolve(__dirname, './routes/FrontendRoutes.js');
console.log("In route.js");
console.log("dirname is: ", __dirname);
console.log("Frontend routes path should be: ", frontendPath);
const FrontendRoutes = require(frontendPath);
router.use(FrontendRoutes);*/

module.exports = router;