let FileItem = require('../models/fileitem');
let multer = require('multer');
let fs = require('fs');
let path = require('path');
let UPLOAD_PATH = 'uploads/';
let Utils = require('../application/utils');
let userController = require('../controllers/user');
let groupController = require('../controllers/group');
// let MAX_FILE_SIZE = 1 << 26;// 64M
// let MAX_IMAGE_SIZE = 1 << 23; //8M
let file_upload = multer({// let storage = multer.memoryStorage();
    dest: UPLOAD_PATH,
    // storage: storage,
    // limits: {
    //     fileSize: 1 << 22, // 4M 
    // },
});
let image_upload = multer({
    dest: UPLOAD_PATH,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
});

function getLocalFilePath(file) {
    return file ? path.join(UPLOAD_PATH, file.id) : null;
}
async function checkFileExited(file) {
    return new Promise(resolve => fs.exists(getLocalFilePath(file), exists => resolve(exists)));
}
async function checkFilesExisted(files) {
    return new Promise(resolve => {
        let promises = files.map(file => {
            // return checkFileExited(file, error => reject(error)).then(exists => exists ? file : null);
            return checkFileExited(file, error => error).then(exists => exists ? file : null);
        });
        let datas = [];
        Promise.all(promises).then(files => {
            files.forEach(file => {
                if (file) {
                    datas.push(file);
                }
            });
            resolve(datas);
        });
    });
}
async function checkFileRequest(req, res, next) {
    let file = await findFile(req);
    if (file && !file.isDeleted) {
        req.fileitems.file_saved = file;
        req.fileitems.file_selected_id = file._id;
        return next();
    } else {
        req.fileitems.file_saved = null;
        req.fileitems.file_selected_id = null;
        return next(Utils.createError('File not exited or deleted', 400));
    }
}
async function checkFileRequestIfHave(req, res, next) {
    let file = await findFile(req);
    if (file && !file.isDeleted) {
        req.fileitems.file_saved = file;
    } else {
        req.fileitems.file_saved = null;
    }
    return next();
}
async function getAllFiles() {
    return (await FileItem.find({isDeleted: false })).map(file => {
        return file.getBasicInfo();
    });
}
async function findFile(req) {
    if (!req) { return null; }
    if (req.fileitems.file_saved) {
        return req.fileitems.file_saved;
    }
    if (req.fileitems.file_selected_id) {
        return await FileItem.findById(req.fileitems.file_selected_id);
    }
    if (req.params.fileID) {
        return await FileItem.findById(req.params.fileID);
    }
    if (req.body.fileID) {
        return await FileItem.findById(req.body.fileID);
    }
    return null;
}
async function postFiles(req, res, next) {
    try {
        req.fileitems.file_saved = null;
        req.fileitems.file_selected_id = null;
        req.fileitems.files_saved = null;
        if (!req.files) {
            throw new Error("Input files null");
        }
        let current_user = null;
        let current_group = null;
        let user = userController.getCurrentUser(req);
        let group = groupController.getGroupRequest(req);
        current_user = user ? {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
        } : null;
        current_group = group ? {
            id: group._id,
            name: group.name,
        } : null;
        let files = [];
        let now = new Date();
        req.files.forEach(file => {
            let fileSave = new FileItem({
                id: file.filename,
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                createDate: now,
                isDeleted: false,
                user: current_user,
                group: current_group,
            });
            files.push(fileSave);
        });
        Promise.all(files.map(file => file.save())).then(filesaveds => {
            req.fileitems.files_saved = filesaveds;
            next();
        }).catch(error => next(error));
    } catch (error) {
        return next(Utils.createError(error, 500, 500, 'Upload Failed'));
    }
}
async function postFilesIfHave(req, res, next) {
    try {
        req.fileitems.file_saved = null;
        req.fileitems.file_selected_id = null;
        req.fileitems.files_saved = null;
        if (!req.files) {
            return next();
        }

        let current_user = null;
        let current_group = null;
        let user = userController.getCurrentUser(req);
        let group = groupController.getGroupRequest(req);
        current_user = user ? {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
        } : null;
        current_group = group ? {
            id: group._id,
            name: group.name,
        } : null;
        let files = [];
        let now = new Date();
        req.files.forEach(file => {
            let fileSave = new FileItem({
                id: file.filename,
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                createDate: now,
                isDeleted: false,
                user: current_user,
                group: current_group,
            });
            files.push(fileSave);
        });
        Promise.all(files.map(file => file.save())).then(filesaveds => {
            req.fileitems.files_saved = filesaveds;
            next();
        }).catch(error => next(error));
    } catch (error) {
        return next(Utils.createError(error, 500, 500, 'Upload Failed'));
    }
}
async function postOrUpdateFile(req, res, next) {
    try {
        let file = req.fileitems.file_saved = null;
        let file_id = req.fileitems.file_selected_id;
        let user = userController.getCurrentUser(req);
        let group = groupController.getGroupRequest(req);
        if (!req.file) {
            throw new Error("Input file null");
        }
        if (!file) {
            file = new FileItem({
                id: req.file.filename,
                name: req.file.originalname,
                type: req.file.mimetype,
                size: req.file.size,
                createDate: new Date(),
                isDeleted: false,
            });
        }
        file.user = user ? {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
        } : null;
        file.group = group ? {
            id: group._id,
            name: group.name,
        } : null;
        file = await file.save();
        req.fileitems.file_saved = file;
        req.fileitems.file_selected_id = file ? file._id : null;
        return next();
    } catch (error) {
        return next(Utils.createError(error, 500, 500, 'Upload Failed'));
    }
}
async function postFile(req, res, next) {
    try {
        req.fileitems.file_saved = null;
        req.fileitems.file_selected_id = null;
        let user = userController.getCurrentUser(req);
        let group = groupController.getGroupRequest(req);
        if (!req.file) {
            throw new Error("Input file null");
        }
        let file = new FileItem({
            id: req.file.filename,
            name: req.file.originalname,
            type: req.file.mimetype,
            size: req.file.size,
            createDate: new Date(),
            isDeleted: false,
        });
        file.user = user ? {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
        } : null;
        file.group = group ? {
            id: group._id,
            name: group.name,
        } : null;
        file = await file.save();
        req.fileitems.file_saved = file;
        req.fileitems.file_selected_id = file ? file._id : null;
        return next();
    } catch (error) {
        return next(Utils.createError(error, 500, 500, 'Upload Failed'));
    }
}
async function postFileIfHave(req, res, next) {
    try {
        req.fileitems.file_saved = null;
        req.fileitems.file_selected_id = null;
        let user = userController.getCurrentUser(req);
        let group = groupController.getGroupRequest(req);
        if (!req.file) {
            return next();
        }
        let file = new FileItem({
            id: req.file.filename,
            name: req.file.originalname,
            type: req.file.mimetype,
            size: req.file.size,
            createDate: new Date(),
            isDeleted: false,
        });
        file.user = user ? {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
        } : null;
        file.group = group ? {
            id: group._id,
            name: group.name,
        } : null;
        file = await file.save();
        req.fileitems.file_saved = file;
        req.fileitems.file_selected_id = file ? file._id : null;
        return next();
    } catch (error) {
        return next(Utils.createError(error, 500, 500, 'Upload Failed'));
    }
}
async function updateFile(req, res, next) {
    try {
        let file = req.fileitems.file_saved;
        let user = userController.getCurrentUser(req);
        let group = groupController.getGroupRequest(req);
        if (!req.file) {
            throw new Error("Input file null");
        }
        file.id = req.file.filename;
        file.name = req.file.originalname;
        file.type = req.file.mimetype;
        file.size = req.file.size;
        file.createDate = new Date();
        file.isDeleted = false;
        file.user = user ? {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
        } : null;
        file.group = group ? {
            id: group._id,
            name: group.name,
        } : null;
        file = await file.save();
        req.fileitems.file_saved = file;
        req.fileitems.file_selected_id = file ? file._id : null;
        return next();
    } catch (error) {
        return next(Utils.createError(error, 500, 500, 'Update file Failed'));
    }
}
async function deleteFile(req, res, next) {//TODO: check permission delete file.
    try {
        let file = req.fileitems.file_saved;
        file.isDeleted = true;
        file = await file.save();
        req.fileitems.file_saved= file;
        req.fileitems.file_selected_id = file ? file._id : null;
        return next();
    } catch (error) {
        return next(Utils.createError(error, 500, 500, 'Not delete file'));
    }
}
async function getInfoFile(req, res, next) {
    try {
        let  file = req.fileitems.file_saved;
        req.responses.data = Utils.createResponse(file.getBasicInfo());
        return next();
    } catch (error) {
        return next(Utils.createError(error, 400, 400, 'Not exit file'));
    }
}
async function getInfoFiles(req, res, next) {
    try {
        let files = req.fileitems.files_saved;
        if (!files) {
            return next(Utils.createError('Files not exited or deleted', 400));
        }
        let datas = files.filter(file => file.isDeleted === false).map(file => file.getBasicInfo());
        req.responses.data = Utils.createResponse(datas);
        return next();
    } catch (error) {
        return next(Utils.createError(error, 400, 400, 'Not exit file'));
    }
}

async function getOrAttachFile(req, res, next, isAttach) {
    try {
        let file = req.fileitems.file_saved;
        let readStream = fs.createReadStream(getLocalFilePath(file));
        readStream.on("open", () => {
            res.setHeader('Content-Type', file.type);
            res.setHeader('Content-Length', file.size);
            if (isAttach) {
                res.setHeader("Content-Disposition", "attachment; filename=\"" + file.name + "\"");
            } else {
                res.setHeader("Content-Disposition", "filename=\"" + file.name + "\"");
            }
            readStream.pipe(res);
        }).on("close", () => {
            res.end();
        }).on("error", err => {
            return next(Utils.createError(err, 500, 500, 'Not exit file'));
        });
    } catch (error) {
        return next(Utils.createError(error, 400, 400, 'Not exit file'));
    }
}
async function getFile(req, res, next) {
    return await getOrAttachFile(req, res, next, false);
}
async function attachFile(req, res, next) {
    return await getOrAttachFile(req, res, next, true);
}
async function getFiles(req, res, next) {
    try {
        let datas = await getAllFiles();
        if (datas) {
            req.responses.data = Utils.createResponse(datas);
        }
        return next();
    } catch (error) {
        return next(error);
    }
}
async function cleanUploadFolder() {
    let files = await FileItem.find({isDeleted : true});
    let filesExisted = await checkFilesExisted(files);
    let errorHandler = err => {};
    filesExisted.forEach(file => {
        fs.unlink(getLocalFilePath(file), errorHandler);
    });
    return filesExisted;
}

/*----------------------------------------------- */
let singleFileUpload = file_upload.single('fileUpload');
let singleImageUpload = image_upload.single('imageUpload');
let arrayFileUpload = file_upload.array('fileUpload', 10);
let arrayImageUpload = image_upload.array('imageUpload', 10);
let mixFileImageUpload = file_upload.fields([
    {name: 'coverImage', maxCount: 1},
    {name: 'profileImage', maxCount: 1},
    {name: 'fileUpload', maxCount: 5},
    {name: 'imageUpload', maxCount: 5},
]);

let coverImageUpload = file_upload.single('coverImage');
let profileImageUpload = file_upload.single('profileImage');

let anyFileUpload = file_upload.any();

exports.anyFileUpload = anyFileUpload;
exports.fileUpload = singleFileUpload;
exports.imageUpload = singleImageUpload;
exports.coverUpload = coverImageUpload;
exports.profileUpload = profileImageUpload;
exports.arrayFileUpload = arrayFileUpload;
exports.arrayImageUpload = arrayImageUpload;
exports.mixFileImageUpload = mixFileImageUpload;

exports.getFiles = getFiles;
exports.attachFile = attachFile;
exports.getFile = getFile;
exports.getInfoFile = getInfoFile;
exports.getInfoFiles = getInfoFiles;
exports.deleteFile = deleteFile;
exports.postFile = postFile;
exports.postFiles = postFiles;
exports.cleanUploadFolder = cleanUploadFolder;
exports.postFileIfHave = postFileIfHave;
exports.postFilesIfHave = postFilesIfHave;
exports.checkFileRequest = checkFileRequest;
exports.checkFileRequestIfHave = checkFileRequestIfHave;
exports.updateFile = updateFile;
exports.postOrUpdateFile = postOrUpdateFile;