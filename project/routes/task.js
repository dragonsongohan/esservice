let express = require('express');
let router = express.Router();
let fileController = require('../controllers/fileitem');
let userController = require('../controllers/user');
let groupController = require('../controllers/group');

let cleanUploadFolderInterval = null;
function startCleanUploadFolderTask() {
    if (cleanUploadFolderInterval) return;
    cleanUploadFolderInterval = setInterval(() => {
        fileController.cleanUploadFolder();
    }, 5000);
}
function stopCleanUploadFolderTask() {
    if (cleanUploadFolder) {
        clearInterval(cleanUploadFolderInterval);
    }
    cleanUploadFolderInterval = null;
}

/*----------------TASK_API----------------------------*/
router.route('/cleanUploadFolder/start').post((req, res) => {
    startCleanUploadFolderTask();
    res.status(cleanUploadFolderInterval ? 200 : 500).end();
});
router.route('/cleanUploadFolder/stop').post((req, res) => {
    stopCleanUploadFolderTask();
    res.status(cleanUploadFolderInterval ? 500 : 200).end();
});

module.exports = router;
// module.exports.startCleanUploadFolderTask = startCleanUploadFolderTask;
// module.exports.stopCleanUploadFolderTask = stopCleanUploadFolderTask;