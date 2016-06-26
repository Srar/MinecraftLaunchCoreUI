const url      = require('./url');
const io       = require('./io');
const files    = require('./files');
const java     = require('./java');
const fs       = require('fs');
const filePath = require('./filePath');
const child_process = require('child_process');
const co       = window.require('co');
const unzip    = window.require('unzip');
const uuid     = window.require('node-uuid');

const EventEmitter = require('events').EventEmitter;

const LockFilesDir = filePath.lockFolder;

const gameRootFolder = filePath.gameRootFolder;
const gameAssetsFolder = filePath.gameAssetsFolder;
const gameLibrariesFolder = filePath.gameLibrariesFolder;
const gameVersionFolder = filePath.gameVersionFolder;
const gameNativeFolder = filePath.gameNativeFolder;
const gameNativeDownloadTempFolder = filePath.gameNativeDownloadTempFolder;

if(!io.syncFileIsExist(gameRootFolder)){
    console.info(`create ${gameRootFolder} folder.`);
    io.syncCreateFolder(gameRootFolder);
}


module.exports = {

    DownloadMinecraftProcess(version){
        const TaskEvent = new EventEmitter();
        return {
            event: TaskEvent,
            start: () => {
                /* 创建 Minecraft verions 文件夹 */
                if(!fs.existsSync(gameVersionFolder)){
                    console.info(`create ${gameVersionFolder} folder.`);
                    io.syncCreateFolder(gameVersionFolder);
                }

                if(fs.existsSync(`${gameVersionFolder}${version}/${version}.json`) && fs.existsSync(`${gameVersionFolder}/${version}/${version}.jar`)){
                    if(fs.existsSync(`${gameVersionFolder}/${version}/${version}.lock`)){
                        console.info(`minecraft [${version}] version exist.`);
                        return TaskEvent.emit('done');
                    }

                    if(fs.existsSync(`${gameVersionFolder}${version}/${version}.json`))
                        fs.unlinkSync(`${gameVersionFolder}${version}/${version}.json`);

                    if(fs.existsSync(`${gameVersionFolder}${version}/${version}.jar`))
                        fs.unlinkSync(`${gameVersionFolder}${version}/${version}.jar`);
                }

                var versions = null;
                TaskEvent.emit('list');
                files.getVersions(url.getVersionsForChinaUser()).then(list => {
                    console.log(list);
                    versions = files.formatVersions(list);
                    if(versions[version] == undefined) return TaskEvent.emit('error', `Can't find [${version}] from mojang server.`);

                    if(!fs.existsSync(`${gameVersionFolder}${version}`)){
                        console.info(`create ${gameVersionFolder}${version} folder.`);
                        io.syncCreateFolder(`${gameVersionFolder}${version}`);
                    }

                    console.info(`downloading minecraft [${version}] version json file.`)
                    TaskEvent.emit('json');
                    return io.request(versions[version].json);
                }).then(VersionInfo => {
                    return io.asyncWriteFile(`${gameVersionFolder}${version}/${version}.json`, VersionInfo);
                }).then(() => {
                    const core = url.getClientUrlForChinaUser(version);
                    const DownloadProcess = io.DownloadFileToDisk(`${gameVersionFolder}${version}/${version}.jar`, core, 10);
                    DownloadProcess.on('process', process => TaskEvent.emit('process', process));
                    DownloadProcess.on('done', () => {
                        fs.writeFileSync(`${gameVersionFolder}/${version}/${version}.lock`, '', 'utf-8');
                        TaskEvent.emit('done');
                    });
                    DownloadProcess.on('error', error => TaskEvent.emit('error', error));
                }).catch(err => TaskEvent.emit('error', err));
            }
        };
    },

    LoadLibrariesProcess(version){
        const TaskEvent = new EventEmitter();
        return {
            event: TaskEvent,
            start: () => {
                if(!fs.existsSync(`${gameVersionFolder}${version}/${version}.json`))
                    return TaskEvent.emit('error', `can't find ${version} from ${gameVersionFolder}`);

                if(!fs.existsSync(gameLibrariesFolder + version))
                    io.syncCreateFolder(gameLibrariesFolder + version);

                if(!fs.existsSync(gameNativeFolder + version))
                    io.syncCreateFolder(gameNativeFolder + version);

                if(fs.existsSync(`${gameVersionFolder}${version}/${version + '.liblock'}`)){
                    return TaskEvent.emit('done');
                }

                var natives   = [];
                var libraries = [];

                co(function *() {
                    /* 获取依赖库 */
                    try{
                        var VersionJSONContent = yield io.asyncReadFile(`${gameVersionFolder}/${version}/${version}.json`);
                        JSON.parse(VersionJSONContent).libraries.map(lib => {
                            if (lib.name.split(':').length != 3) return;
                            /* 静态类库 */
                            if (lib.natives != null && lib.natives['osx'] != null) {
                                if (lib.rules == null) {
                                    return natives.push(lib);
                                }
                                var isAllow = false;
                                lib.rules.map(rule => {
                                    if (rule.os != null && rule.os == 'osx') {
                                        if (rule.action == 'allow') isAllow = true;
                                    } else {
                                        var keys = [];
                                        for(var k in rule) keys.push(k);
                                        if (keys.length == 1 && rule.action != null) {
                                            isAllow = rule.action == 'allow';
                                        }
                                    }
                                });
                                if (isAllow) return natives.push(lib);
                            }

                            if (lib.rules != null && lib.natives != null && lib.rules.length == 1) {
                                var rule = lib.rules[0];
                                if(rule.os != null){
                                    if(rule.action == 'allow' && rule.os.name == 'osx') return natives.push(lib);
                                }
                            }
                            if (lib.natives == null) libraries.push(lib);
                        });
                    } catch (ex) {
                        return TaskEvent.emit('error', ex);
                    }

                    console.log('natives', natives);
                    console.log('libraries', libraries);

                    /* 下载Java依赖库 */
                    try {
                        TaskEvent.emit('libraries');
                        for (var i = 0; i < libraries.length; i++) {
                            const lib  = libraries[i];
                            const path = lib.downloads.artifact.path;
                            const LibUrl  = lib.downloads.artifact.url;
                            const FullPath = `${gameLibrariesFolder}${version}/${path}`;
                            const LibFileName = path.substring(path.lastIndexOf('/') + 1);

                            /* 判断lib是否已经存在 */
                            if(fs.existsSync(FullPath)){
                                console.info(`lib exist [${LibFileName}] [${i + 1}/${libraries.length}] skip.`)
                                TaskEvent.emit('libraries_process', {
                                    count: i + 1,
                                    total: libraries.length
                                });
                                continue;
                            }

                            yield files.asyncCreateLibFolderByLibPath(FullPath);
                            yield io.DownloadFileToDiskPromise(FullPath, url.getLibrariesForChinaUser(LibUrl), 5);

                            console.info(`downloaded [${LibFileName}] [${i + 1}/${libraries.length}]`);
                            TaskEvent.emit('libraries_process', {
                                count: i + 1,
                                total: libraries.length
                            });
                        }
                    } catch (ex){
                        return TaskEvent.emit('error', ex);
                    }

                    /* 下载 & 解压 静态依赖库 */
                    try {
                        TaskEvent.emit('natives');
                        yield io.asyncCreateFolderParent(gameNativeDownloadTempFolder + version);
                        for (var i = 0; i < natives.length; i++) {
                            const native = natives[i];

                            const NativeUrl      = native.downloads.classifiers['natives-osx'].url;
                            const NativeFileName = NativeUrl.substring(NativeUrl.lastIndexOf('/') + 1);
                            const FullPath       = `${gameNativeDownloadTempFolder}${version}/${NativeFileName}`;

                            if(fs.existsSync(FullPath)){
                                console.info(`natives lib [${NativeFileName}] [${i + 1}/${natives.length}] skip.`);
                            } else {
                                console.info(`natives lib [${NativeFileName}] [${i + 1}/${natives.length}] download.`);
                                yield io.DownloadFileToDiskPromise(FullPath, url.getLibrariesForChinaUser(NativeUrl), 5);
                            }

                            try {
                                fs.createReadStream(FullPath).pipe(unzip.Extract({ path: gameNativeFolder + version }));
                                TaskEvent.emit('natives_process', {
                                    count: i + 1,
                                    total: natives.length
                                });
                            }catch (ex) {
                                throw `unzip native ${NativeFileName} error.`;
                            }
                        }
                        setTimeout(() => {
                            fs.writeFileSync(`${gameVersionFolder}${version}/${version + '.liblock'}`, '', 'utf-8');
                            TaskEvent.emit('done');
                        }, 1000);
                    } catch(ex) {
                        TaskEvent.emit('error', ex);
                    }
                });
            }
        };
    },

    LaunchMinecraftProcess(version, _args){
        const TaskEvent = new EventEmitter();
        return {
            event: TaskEvent,
            start: () => {
                var args = {
                    xmx: _args['xmx'] ? _args['xmx'] : 256,
                    xms: _args['xms'] ? _args['xms'] : 1024,

                    width : _args['width']  ? _args['width'] : 854,
                    height: _args['height'] ? _args['height'] : 480,

                    player: _args['player'] ? _args['player'] : 'unknow',
                };

                var JVMArgs = [];

                if(!fs.existsSync(`${gameVersionFolder}${version}/${version}.json`))
                    return TaskEvent.emit('error', `can't find ${version} from ${gameVersionFolder}`);

                JVMArgs.push('-XX:+UseG1GC');
                JVMArgs.push('-XX:-UseAdaptiveSizePolicy');
                JVMArgs.push('-XX:-OmitStackTraceInFastThrow');

                JVMArgs.push(`-Xmn${args.xmx}m`);
                JVMArgs.push(`-Xmx${args.xms}m`);

                JVMArgs.push(`-Djava.library.path=${gameNativeFolder + version}`);

                JVMArgs.push('-Dfml.ignoreInvalidMinecraftCertificates=true');
                JVMArgs.push('-Dfml.ignorePatchDiscrepancies=true');

                JVMArgs.push(`-Duser.home=${filePath.gameHome}`);

                JVMArgs.push(`-cp`);

                var natives   = [];
                var libraries = [];
                var LoadLibrariesString = "";

                co(function *() {
                    const VersionJSONContent = JSON.parse(yield io.asyncReadFile(`${gameVersionFolder}/${version}/${version}.json`));
                    VersionJSONContent.libraries.map(lib => {
                        if (lib.name.split(':').length != 3) return;
                        /* 静态类库 */
                        if (lib.extract != null && lib.natives != null && lib.natives['osx'] != null) {
                            if (lib.rules == null) {
                                return natives.push(lib);
                            }
                            var isAllow = false;
                            lib.rules.map(rule => {
                                if (rule.os != null && rule.os == 'osx') {
                                    if (rule.action == 'allow') isAllow = true;
                                } else {
                                    var keys = [];
                                    for(var k in rule) keys.push(k);
                                    if (keys.length == 1 && rule.action != null) {
                                        isAllow = rule.action == 'allow';
                                    }
                                }
                            });
                            if (isAllow) return natives.push(lib);
                        }
                        if (lib.natives == null && lib.extract == null) libraries.push(lib);
                    });
                    for (var i = 0; i < libraries.length; i++) {
                        const lib  = libraries[i];
                        const path = lib.downloads.artifact.path;
                        const FullPath = `${gameLibrariesFolder}${version}/${path}`;

                        /* 判断lib是否已经存在 */
                        if(fs.existsSync(FullPath)){
                            LoadLibrariesString += `${FullPath}:`;
                        }
                    }
                    JVMArgs.push(LoadLibrariesString + `${gameVersionFolder}${version}/${version}.jar`);

                    console.log('main:', VersionJSONContent['mainClass']);
                    JVMArgs.push(VersionJSONContent.mainClass);

                    var ClientUUID = uuid.v1().replace(/-/g, '');

                    VersionJSONContent.minecraftArguments.split(' ').map(item => {
                        switch (item) {
                            case '${auth_player_name}': item = args.player; break;
                            case '${version_name}': item = '"+1s"'; break;
                            case '${game_directory}': item = gameRootFolder ; break;
                            case '${assets_root}': item = gameAssetsFolder; break;
                            case '${assets_index_name}': item = VersionJSONContent.assets; break;
                            case '${auth_uuid}':
                            case '${auth_access_token}':
                                item = ClientUUID;
                                break;
                            case '${user_properties}': item = '{}'; break;
                            case '${user_type}': item = 'Legacy'; break;
                            //1.5.2
                            case  '${game_assets}': item = gameAssetsFolder; break;
                        }
                        JVMArgs.push(item);
                    });

                    JVMArgs.push('--height');
                    JVMArgs.push(args.height);
                    JVMArgs.push('--width');
                    JVMArgs.push(args.width);

                    // var outputdebug = '';
                    // JVMArgs.map(line => outputdebug += line + '\n');
                    // fs.writeFileSync(gameRootFolder + 'debug.txt', outputdebug, 'utf-8');

                    var child = child_process.spawn('/usr/bin/java', JVMArgs, { cwd: gameRootFolder });
                    child.on('error', (err) =>  TaskEvent.emit('error', err));
                    child.stdout.on('data', (data) => TaskEvent.emit('message', data));
                    child.stderr.on('data', (data) => TaskEvent.emit('message', data));
                    child.on('exit', (code) => TaskEvent.emit('exit', code));
                    child.stdout.setEncoding('utf8');
                });
            }
        }
    },

    InstallJavaProcess() {
        const TaskEvent = new EventEmitter();
        return {
            event: TaskEvent,
            start: () => {
                java.CheckJava().then(result => {
                    if (result) return TaskEvent.emit('done');
                    var DownloadJavaTask = java.DownloadJavaToWorkSpace()
                    DownloadJavaTask.on('done', () => TaskEvent.emit('done'));
                    DownloadJavaTask.on('process', (process) => TaskEvent.emit('process', process));
                    DownloadJavaTask.on('install', () => TaskEvent.emit('install'));
                    DownloadJavaTask.on('error', (error) => TaskEvent.emit('error', error));
                });
            }
        }
    }
}