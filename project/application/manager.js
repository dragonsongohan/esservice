let dotenv = require('dotenv');
let mongoose = require('mongoose');
dotenv.config();
//TODO: config mongoose: reconnect, readState...
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('connecting', () => {
    console.log("Connecting to db...");
});
db.on('error', error => {
    console.error('Error connect to db:' + error);
    // mongoose.disconnect();
});
db.on('connected', () => {
    console.log('Connected to db.');
});
// db.on('open', () => {
//     console.log('Connection to db opened');
// });
db.on('reconnected', () => {
    console.log('Reconected to db.');
});
db.on('disconnected', () => {
    console.log('Connection to db disconnected.');
});

let firstConnectSuccess = 0;
let interval = null;
function start() {
    interval = setInterval(() => {
        if (firstConnectSuccess > 0) {
            if (interval) {
                clearInterval(interval);
            }
        } else {
            console.log("Reconnecting to DB");
            connectToDB();
        }
    }, 5000);
}
async function connectToDB() {
    try {
        // console.log(exports.connectString);
        await mongoose.connect(exports.connectString, {//loi khi debug -> can fix.
            useMongoClient: true,
            // server: {auto_reconnect: true}//Default reconnect in 30s.
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 5000
        });
        firstConnectSuccess++;
    } catch(error) {
        firstConnectSuccess = 0;
    }
}

exports.portRunning = process.env.PORT || 3000;
exports.connectString = process.env.MONGODB_CONNECT_STRING || "mongodb://localhost:27017/education_social_network";
exports.connectToDB = connectToDB;
exports.start = start;