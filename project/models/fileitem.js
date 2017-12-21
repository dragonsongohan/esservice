let mongoose = require('mongoose');
let Utils = require('../application/utils');
let FileItemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, },
    name: { type: String, required: true, default: 'NoName' },
    type: { type: String, required: true, default: 'application/octet-stream', },
    size: { type: Number, required: true, default: 0, },
    createDate: { type: Date, required: false, default: new Date(), },
    versions:{type: [String], default: []},
    isDeleted: { type: Boolean, required: true, default: false, },
    user: {
        type: {
            id: Number,
            firstName: String,
            lastName: String,
        },
        required: false,
        default: null,
    },
    group: {
        type: {
            id: Number,
            name: String,
        },
        required: false,
        default: null
    },
});
function getVersion(version) {
    if (!this.versions) {this.versions = []};
    let v = Number(version);
    if (isNaN(v)) return null;
    if (v >= 0 && v < this.versions.length) {
        return this.versions[v];
    }
    return null;
}
function addFiles(files) {
    if (!this.versions) {this.versions = []};
    if (!files) return null;
    let now = new Date();
    if (Array.isArray(files)) {
        let maxIndex = files.length - 1;
        if (maxIndex >= 0) {
            this.id = files[maxIndex];
            this.createDate = now;
        }
        files.forEach(file => {
            this.versions.push({_id: file, createDate: now});
        });
    } else {
        this.id = files;
        this.createDate = now;
        this.versions.push({_id: files, createDate: now});
    }
    return this;
}
function getBasicInfo() {
    return {
        id:         this._id,
        name:       this.name,
        type:       this.type,
        size:       this.size,
        user:       this.user,
        group:      this.group,
        createDate: Utils.exportDate(this.createDate),
    }
}

FileItemSchema.methods.getBasicInfo = getBasicInfo;
FileItemSchema.methods.addFiles = addFiles;
FileItemSchema.methods.getVersion = getVersion;
module.exports = mongoose.model('FileItem', FileItemSchema);