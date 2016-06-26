const constants = require('../constants');

const lockFolder                   = constants.WORKSPACE + '/lock/';

const gameRootFolder               = constants.WORKSPACE + '/.minecraft/';
const gameAssetsFolder             = gameRootFolder + 'assets/';
const gameLibrariesFolder          = gameRootFolder + 'libraries/';
const gameVersionFolder            = gameRootFolder + 'versions/';
const gameNativeFolder             = gameRootFolder + 'native/';
const gameNativeDownloadTempFolder = gameRootFolder + '/nativeTemp/';

module.exports = {
    lockFolder:lockFolder,

    gameHome: constants.WORKSPACE,

    gameRootFolder: gameRootFolder,
    gameAssetsFolder:gameAssetsFolder,
    gameLibrariesFolder:gameLibrariesFolder,
    gameVersionFolder: gameVersionFolder,
    gameNativeFolder: gameNativeFolder,
    gameNativeDownloadTempFolder: gameNativeDownloadTempFolder
};