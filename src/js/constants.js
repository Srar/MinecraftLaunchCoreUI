const path = require('path');
const mkdirp = require('mkdirp');

// import keymirror from 'keymirror';

export const APP_NAME = 'MinecraftLaunchCore';
export const APP_VERSION = '0.0.1';
export const APP_AUTHER = 'Srar';

// export const APP_HOMEPAGE = 'https://ppoffice.github.io/Hozz';
// export const APP_RELEASES_URL = `https://api.github.com/repos/ppoffice/${ APP_NAME }/releases`;

export const USER_HOME = process.platform === 'win32' ? process.env.USERPROFILE || '' : process.env.HOME || process.env.HOMEPATH || '';
export const WORKSPACE = path.join(USER_HOME, '.' + APP_NAME);
export const CONFIG    = path.join(WORKSPACE, './config.json');
export const LOG       = path.join(WORKSPACE, './log.txt');

try {
    mkdirp.sync(WORKSPACE);
} catch (e) {
    console.log('Make workspace folder failed: ', e);
}