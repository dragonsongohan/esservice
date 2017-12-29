//Require package
let Application = require('./application/application');
let session = require('express-session');
let ejs = require('ejs');
let express = require('express');
let passport = require('passport');
let bodyParser = require('body-parser');
let app = express();

let flash = require('connect-flash');
let morgan = require('morgan');
let cookieParser = require('cookie-parser');
let userController = require('./controllers/user');

let oauth2Router = require('./routes/oauth2');
let apiRouter = require('./routes/api');
let fileRouter = require('./routes/file');
let groupRouter = require('./routes/group');
let userRouter = require('./routes/user');
let checkRouter = require('./routes/check');
let testRouter = require('./routes/test');
let taskRouter = require('./routes/task');
let postRouter = require('./routes/post');
let eventRouter = require('./routes/event');
let announcementRouter = require('./routes/announcement');

Application.manager.connectToDB();
Application.manager.start();
app.set('view engine', 'ejs');
app.all('/*', Application.corsConfig);
app.use(morgan('dev'));
// app.use(cookieParser());
app.use(Application.initialize);
app.use(bodyParser.urlencoded({
        extended: true
}));
app.use(bodyParser.json());
app.use(session({
        secret: 'PMscnql6C7TCigaV',
        saveUninitialized: true,
        resave: true,
        // cookie: { maxAge: 10000, }
}));
app.use(passport.initialize());
app.use(passport.session());

/*------------------ROUTER--------------------------*/
app.use('/oauth2', oauth2Router);
app.use('/files', fileRouter);
app.use('/users', userRouter);
app.use('/groups', groupRouter);
app.use('/checks', checkRouter);
app.use('/posts', postRouter);
app.use('/events', eventRouter);
app.use('/announcements', announcementRouter);

app.use('/apis', apiRouter);
// app.use('/tasks', taskRouter);
app.use('/test', testRouter);

app.use(Application.defaultHandler);
app.use(Application.errorHandler);



app.listen(Application.manager.portRunning);
console.log('Running at ' + Application.manager.portRunning);