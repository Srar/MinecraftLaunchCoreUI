'use strict';

const client   = 'https://s3.amazonaws.com/Minecraft.Download/versions/<version>/<version>.jar';
//const clientCN = 'https://authentication.x-speed.cc/minecraft/versions/<version>/<version>.jar';
const clientCN = 'https://authentication.x-speed.cc/minecraft/versions/<version>.jar';

const versions   = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';
const versionsCN = 'https://authentication.x-speed.cc/minecraft/versions/list.json';

const libraries    = 'https://libraries.minecraft.net';
const librariesCN  = 'https://authentication.x-speed.cc/minecraft/libraries';

module.exports = {

    /* 国际用户获取客户端Jar */
    getClientUrlForGlobalUser(version){
        return client.replace(/<version>/g, version);
    },
    /* 中国用户获取客户端Jar */
    getClientUrlForChinaUser(version){
        return clientCN.replace(/<version>/g, version);
    },

    /* 国际用户获取版本列表 */
    getVersionsForGlobalUser(){
        return versions;
    },
    /* 中国用户获取版本列表 */
    getVersionsForChinaUser(){
        return versionsCN;
    },

    /* 国际用户获取Java依赖库 */
    getLibrariesForGlobalUser(){
        return libraries;
    },
    /* 中国用户获取Java依赖库 */
    getLibrariesForChinaUser(url){
        return url.replace(libraries, librariesCN);
    },
}