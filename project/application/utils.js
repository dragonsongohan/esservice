let bcrypt = require('bcrypt-nodejs');
let chars = "abcdefjhijklmnopqrstuvwxyzABCDEFJHIJKLMNOPQRSTUVWXYZ0123456789+=-_";
let numbers = "0123456789";
let random = Math.random;
let maxIndex = chars.length;
let isLog = true;

let phoneReg = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
let emailReg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function validatePhoneNumber(phone, isRequired = false) {
    return phone ? (phoneReg.test(phone) || phoneReg.test(Number(phone))): !isRequired;
}
function validateEmail(email, isRequired = false) {
    return email ? emailReg.test(email) : !isRequired;
}
function nextInt(max = 100, min = 0) {
    return min + Math.ceil((max - min) * random());
}
function randomStringNumber(maxLength) {
    let strs = [];
    for (let i = 0; i < maxLength; i++) {
        strs.push(numbers[nextInt(0, numbers.length)]);
    }
    return strs.join("");
}
function randomString(maxLength = 64) {
    let strs = [];
    for (let i = 0; i < maxLength; i++) {
        strs.push(chars[nextInt(0, maxIndex)]);
    }
    return strs.join("");
}
function hash(input, callback) {
    bcrypt.genSalt(5, function (err, salt) {
        if (err) return callback(err);
        bcrypt.hash(input, salt, null, function (err, hash) {
            if (err) return callback(err);
            return callback(null, hash);
        });
    });
}

function hashSync(input) {
    return bcrypt.hashSync(input);
}
function getObjectArray(jsonContent) {
    try {
        if (Array.isArray(jsonContent)) {
            return jsonContent;
        }
        return [...items] = JSON.parse(jsonContent);
    } catch (error) {
         return [jsonContent];
    }
}
function periodReducer(accumulator, currentValue, currentIndex, arrays) {
    if (currentIndex % 2) {
        accumulator.push({
            startTime : parseDate(arrays[currentIndex - 1]),
            endTime : parseDate(arrays[currentIndex]),
        });
    }
    return accumulator;
}
function getPeriodArray(jsonContent) {
    return getObjectArray(jsonContent).reduce(periodReducer, []);
}
function parseDate(dateString) {
    if (!dateString) {
        return null;
    }
    if (typeof(dateString) === 'number') {
        return new Date(dateString);
    }
    let _dateString = dateString.endsWith("Z") ? dateString : dateString + "Z";
    let date = new Date(_dateString);
    return isNaN(date.getDate()) ? null : date;
}
function exportDate(date) {
    let _date = date;
    if (typeof(date) === 'number') {
        _date = new Date(date);
    }
    return _date ? _date.toISOString() : null;
}
function getStringArray(jsonContent) {
    try {
        if (Array.isArray(jsonContent)) {
            return jsonContent;
        }
        return [...items] = JSON.parse(jsonContent);
    } catch (error) {
        return typeof(jsonContent) === 'string' ? [jsonContent] : null
    }
}
function getNumberArray(jsonContent) {
    let strings = getStringArray(jsonContent);
    return strings.map(id => Number(id)).filter(id => !isNaN(id));
}

function getNumbers(arrays) {
    if (!arrays) return [];
    return arrays.map(id => Number(id)).filter(id => !isNaN(id));
}
function isNumber(o) {
    if (isNaN(o)) {
        return false;
    }
    if (typeof(o) === 'number') {
        return true;
    }
    return !isNaN(Number(o));
}
exports.setLog = _isLog => {
    isLog = _isLog === true;
};
exports.log = content => {
    isLog ? console.log(content) : undefined;
};

function validateStringLength(obj, minLength = 1, maxLength = 100, isRequired = true) {
    if (typeof (obj) !== "string") {
        return !isRequired;
    }
    return obj.length >= minLength && obj.length <= maxLength;
}

function getShortContent(content) {
    if (!content) return "";
    if (content.length > 30) return content.substring(0, 30) + '...';
    return content;
}

function createError(err, httpstatus, logicCode = null, details = null, data = null) {
    let error = typeof(err) === 'string' ? new Error(err) : err;
    error.httpstatus = httpstatus;
    error.logicCode = logicCode ? logicCode : error.httpstatus;
    error.details = details;
    error.data = data;
    return error;
}
function createResponse(data = null, message = 'Success', logicCode = 200) {
    return {
        code: logicCode,
        message: message,
        data: data,
        error: null,
    };
}
exports.createError = createError;
exports.nextInt = nextInt;
exports.randomString = randomString;
exports.randomStringNumber = randomStringNumber;
exports.hash = hash;
exports.hashSync = hashSync;
exports.parseDate = parseDate;
exports.getObjectArray = getObjectArray;
exports.getStringArray = getStringArray;
exports.getNumberArray = getNumberArray;
exports.getPeriodArray = getPeriodArray;
exports.getNumbers = getNumbers;
exports.validateEmail = validateEmail;
exports.validatePhoneNumber = validatePhoneNumber;
exports.validateStringLength = validateStringLength;
exports.exportDate = exportDate;
exports.isNumber = isNumber;
exports.createResponse = createResponse;