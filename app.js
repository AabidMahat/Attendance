const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const subjectRoute = require('./routes/subjectRoute');
const studentRoute = require('./routes/studentRoute');
const views = require('./routes/viewsRoute');

const AppError = require('./utils/appError');
const globalErrorHandling = require('./controller/errorController');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Body parser , reading data from body into req.body
app.use(cookieParser());
// Data Sanitization against No SQL query injection
// app.use(mongoSanitize());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Calling the middle ware function
app.use((req, res, next) => {
    console.log('Hello from the middleware🙌🙌');
    // console.log(req.headers);
    next();
});

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
});

// rendering the static files
app.use(express.static(`${__dirname}/public`));

//creating the routes
app.use('/', views);
app.use('/api/v2/subject', subjectRoute);
app.use('/api/v2/student', studentRoute);

//Handling all unhandled error
app.all('*', (req, res, next) => {
    next(new AppError(`Cant Find ${req.originalUrl} on this server 🤥🤥`, 404));
});

//handling Errors
app.use(globalErrorHandling);

module.exports = app;
