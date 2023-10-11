const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = require('./app');

//configuring the config file

dotenv.config({
    path: './config.env',
});

const DB = process.env.MONGODB_CODE;

//connecting the database

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('DataBase is connected successfully💥💥');
    })
    .catch();

//connecting the port
const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
    console.log('App is running on port ' + port);
});
