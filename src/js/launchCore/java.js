'use strict';

const io = require('./io.js');
const fs = require('fs');
const spawn = require('child_process').spawn;
const constants = require('../constants');
const tarGzip = require('node-targz');
const rmdir = window.require('rmdir');
const EventEmitter = require('events').EventEmitter;

const JavaConfigPath   = constants.WORKSPACE + '/java.json';
const JavaPackagePath  = constants.WORKSPACE + '/java.tar.gz';
const JavaLockFilePath = constants.WORKSPACE + '/java.lock';
const JavaHomePath     = constants.WORKSPACE + '/java/';

module.exports = {
    CheckSystemJava(){
        return new Promise((resolve, reject) => {
            var _170 = false;
            var _180 = false;

            const JavaProcess = spawn('/usr/bin/java', ['-version']);
            JavaProcess.stdout.on('data', (data) => {
                if(data.indexOf('"1.8') != -1) _180 = true;
                if(data.indexOf('"1.7') != -1) _170 = true;
            });
            JavaProcess.stderr.on('data', (data) => {
                if(data.indexOf('"1.8') != -1) _180 = true;
                if(data.indexOf('"1.7') != -1) _170 = true;
            });
            JavaProcess.on('error', (error) => resolve(false));
            JavaProcess.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
                var result = false;
                if(_170) {
                    console.log('Java Version: 17x');
                    result = true;
                }
                if(_180) {
                    console.log('Java Version: 18x');
                    result = true;
                }
                return resolve(result);
            });
        });
    },

    CheckJava(){
        return new Promise((resolve, reject) => {
            if(fs.existsSync(JavaLockFilePath)) return resolve(true);
            this.CheckSystemJava().then((result) => resolve(result));
            //resolve(false);
        });
    },

    GetIncidentallyJavaInfo(){
        return new Promise((resolve, reject) => {
            io.request('http://libs.x-speed.cc/JavaDownloadConfig.json').then(content => {
                try{
                    resolve(JSON.parse(content));
                } catch(ex) {
                    reject(ex);
                }
            }).catch(error => reject(error))
        });
    },

    RmrfDir(path){
        return new Promise((resolve, reject) => {
            if(!fs.existsSync(path)) resolve();
            rmdir(path, (err) => {
                err ? reject(err) : resolve();
            });
        });
    },

    GetWorkSpaceJVMProcess(Args, SpawnArgs){
        return new Promise((resolve, reject) => {
            if(!fs.existsSync(JavaLockFilePath)) return reject('workspack java not install.');
            resolve (spawn(JavaHomePath + 'Contents/Home/bin/java', Args, SpawnArgs))
        });
    },

    ClearWorkSpaceJava(){
        return new Promise((resolve, reject) => {
            if(!fs.existsSync(JavaPackagePath)){
                if(fs.existsSync(JavaPackagePath))  fs.unlinkSync(JavaPackagePath);
                if(fs.existsSync(JavaConfigPath))   fs.unlinkSync(JavaConfigPath);
                if(fs.existsSync(JavaLockFilePath)) fs.unlinkSync(JavaLockFilePath);
                this.RmrfDir(constants.WORKSPACE + '/java')
                    .then(resolve()).catch(err => reject(err));
            } else {
                resolve();
            }
        });
    },

    DownloadJavaToWorkSpace(){
        const TaskEvent = new EventEmitter();

        fs.exists(JavaLockFilePath, (exists) => {
            if(exists) return TaskEvent.emit('done');
            this.ClearWorkSpaceJava()
                .then(() => {
                    return this.GetIncidentallyJavaInfo();
                })
                .then((JavaConfig) => {
                    fs.writeFileSync(JavaConfigPath, JSON.stringify(JavaConfig), 'utf-8');

                    const DownloadProcess = io.DownloadFileToDisk(JavaPackagePath, JavaConfig.DownloadUrl, 10);

                    DownloadProcess.on('process', process => TaskEvent.emit('process', process));

                    DownloadProcess.on('done', () => {
                        console.log('donwload java done');
                        TaskEvent.emit('install');
                        this.RmrfDir(constants.WORKSPACE + '/' + JavaConfig.DecompressDir)
                            .then(() => {
                                tarGzip.decompress({
                                    source: JavaPackagePath,
                                    destination: constants.WORKSPACE
                                }, () => {
                                    fs.renameSync(constants.WORKSPACE + '/' + JavaConfig.DecompressDir, constants.WORKSPACE + '/java');
                                    if(fs.existsSync(JavaPackagePath))
                                        fs.unlinkSync(JavaPackagePath);
                                    if(!fs.existsSync(JavaLockFilePath))
                                        fs.writeFileSync(JavaLockFilePath, '', 'utf-8');

                                    TaskEvent.emit('done');
                                });
                            })
                            .catch(err => TaskEvent.emit('error', err));
                    });

                    DownloadProcess.on('error', e => TaskEvent.emit('error', e));
                });
        });

        return TaskEvent;
    }
}