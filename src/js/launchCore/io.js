'use strict';

const fs      = require('fs');
const mkdirp  = require('mkdirp');
const EventEmitter = require('events').EventEmitter;
import fetch from 'node-fetch';

module.exports = {
    asyncCreateFolderParent(path) {
        return new Promise((resolve, reject) => {
            mkdirp(path, (err) => {
                err ? reject(err) : resolve();
            });
        });
    },

    syncCreateFolder(path) {
        try {
            if (!fs.existsSync(path)) fs.mkdirSync(path);
        } catch (ex) {
            console.error('create folder error ', ex);
        }
    },

    syncFileIsExist(fileName) {
        return fs.existsSync(fileName);
    },

    asyncWriteFile(fileName, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(fileName, data , 'utf8', (err, data) => {
                err ? reject(err) : resolve(data);
            });
        });
    },

    WriteBufferToFile(fileName, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(fileName, data , (err, data) => {
                err ? reject(err) : resolve(data);
            });
        });
    },

    asyncReadFile (fileName) {
        return new Promise((resolve, reject) => {
            fs.readFile(fileName, 'utf8', (err, data) => {
                err ? reject(err) : resolve(data);
            });
        });
    },

    request(url, timeout) {
        return fetch(url, { timeout: timeout }).then((response) => {
            return Promise.resolve(response.text());
        });
    },

    DownloadFileToDiskPromise(path, url, RetryCount){
        return new Promise((resolve, reject) => {
            const DownloadProcess = this.DownloadFileToDisk(path, url, RetryCount);
            DownloadProcess.on('done', () => resolve());
            DownloadProcess.on('error', err => reject(err));
        });
    },

    DownloadFileToDisk(path, url, RetryCount){
        if( RetryCount === undefined ) RetryCount = 0;
        const DownloadBufferProcessEvent = this.GetDownloadBuffer(url);

        var DownloadFileProcessEvent = new EventEmitter();

        DownloadBufferProcessEvent.on('process', process => DownloadFileProcessEvent.emit('process', process));

        DownloadBufferProcessEvent.on('done', buffer => {
            this.WriteBufferToFile(path, buffer)
                .then(DownloadFileProcessEvent.emit('done'))
                .catch(e => DownloadFileProcessEvent.emit('error', e));
        });

        DownloadBufferProcessEvent.on('error', e => {
            if(RetryCount == 0) {
                DownloadFileProcessEvent.removeAllListeners('process');
                DownloadFileProcessEvent.removeAllListeners('done');
                DownloadFileProcessEvent.emit('error', e);
                return;
            }

            var process = DownloadFileProcessEvent.listeners('process')[0];
            var done = DownloadFileProcessEvent.listeners('done')[0];
            var error = DownloadFileProcessEvent.listeners('error')[0];
            process = typeof process == 'function' ? process : () => {};
            done = typeof done == 'function' ? done : () => {};
            error = typeof error == 'function' ? error : () => {};

            DownloadFileProcessEvent.removeAllListeners('process');

            setTimeout(() => {
                console.log('retry count: ' + RetryCount);
                DownloadFileProcessEvent = this.DownloadFileToDisk(path, url, --RetryCount);
                DownloadFileProcessEvent.addListener('process', process);
                DownloadFileProcessEvent.addListener('done', done);
                DownloadFileProcessEvent.addListener('error', error);
            }, 500);
        });

        return DownloadFileProcessEvent;
    },

    GetDownloadBuffer(url){
        const DownloadProcessEvent = new EventEmitter();

        var FileSize = 0;
        var DownloadSize = 0;
        fetch(url).then((response) => {
            if(response.status != 200) {
                DownloadProcessEvent.removeAllListeners('process');
                DownloadProcessEvent.removeAllListeners('done');
                return DownloadProcessEvent.emit('error','web server return status code:' + response.statusCode)
            }

            FileSize = response.headers._headers['content-length'] ? response.headers._headers['content-length'][0] : 0;
            FileSize = parseInt(FileSize);

            const bufs = [];
            const readable = response.body;
            var ReportProcess = true;
            readable.on('data', (b) => {
                DownloadSize += b.length;
                if(ReportProcess){
                    ReportProcess = false;
                    setTimeout(() => { ReportProcess = true }, 100);
                    DownloadProcessEvent.emit('process', {
                        FileSize: FileSize,
                        DownloadedSize: DownloadSize,
                        Process: parseInt((DownloadSize / FileSize) * 100)
                    });
                    //console.log(`${DownloadSize}/${FileSize} ${parseInt((DownloadSize / FileSize) * 100)}`);
                }
                bufs.push(b);
            });
            readable.on('end', () => DownloadProcessEvent.emit('done', Buffer.concat(bufs)));
            readable.on('error', (e) => DownloadProcessEvent.emit('error', e));
        }).catch((err) => {
            DownloadProcessEvent.removeAllListeners('process');
            DownloadProcessEvent.removeAllListeners('done');
            return DownloadProcessEvent.emit('error','download file process error:' + err);
        });

        return DownloadProcessEvent;
    },
}