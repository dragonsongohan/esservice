let Config = require('../models/config');
let Utils = require('../application/utils');

async function getConfig() {
    try {
        let config = await Config.findOne({isDeleted: false});
        if (!config) {
            config = new Config({
                _id: Date.now(),
                userID: 0,
                timeCreate: new Date(),
                config: Config.getDefaultConfig(),
                isDeleted: false,
            });
            config.setInited(false);
            config = await config.save();
        }
        return config;
    } catch (error) {
        return false;
    }
}

exports.getConfig = getConfig;
// exports.setInited = setInited;