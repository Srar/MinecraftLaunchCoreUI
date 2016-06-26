'use strict';

const io = require('./io.js');

module.exports = {

    /* 获取游戏版本列表 */
    getVersions(url){
        return new Promise((resolve, reject) => {
            io.request(url).then(content => {
                try{
                    resolve(JSON.parse(content).versions);
                } catch(ex) {
                    reject(ex);
                }
            }).catch(error => reject(error))
        });
    },

    /* 异步创建Java依赖文件夹 */
    asyncCreateLibFolderByLibPath(path) {
        return io.asyncCreateFolderParent(path.substring(0, path.lastIndexOf('/')));
    },

    /* 格式化从mojang获取的json */
    formatVersions(versions) {
        var versionsList = {};
        versions.map(item => {
            versionsList[item.id] = {
                type: item.type,
                json: item.url
            };
        });
        return versionsList;
    }
}