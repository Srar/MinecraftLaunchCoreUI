import React, { Component, PropTypes } from 'react';
import $ from 'jquery';

import Core from '../launchCore/core';

class SettingsContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    display() {
        $(this.refs.SettingsContainer).addClass('settings-container-display');
    }

    hide(){
        $(this.refs.SettingsContainer).removeClass('settings-container-display');
        /* 等待动画结束 */
        // setTimeout(() => {
        //
        // }, 400);
    }

    render() {
        return (
            <div ref="SettingsContainer" className="settings-container">
                <div className="top-bar">
                    <i className="fa fa-angle-left back-button" aria-hidden="true" onClick={this.hide.bind(this)}></i>
                    <span className="title">设置</span>
                </div>
                <div className="settings">
                    <div className="settings-item">
                        <label>玩家名称: </label>
                        <input type="text"
                               ref="PlayerName"
                               defaultValue={ global.config.get('PlayerName') }
                               onBlur={() => global.config.set('PlayerName', $(this.refs.PlayerName).val())}/>
                    </div>

                    <div className="settings-item">
                        <label>JVM内存: </label>
                        <input
                            type="text"
                            ref="JVMMemory"
                            defaultValue={ global.config.get('JVMMemory') }
                            onBlur={() => {
                                var memory = $(this.refs.JVMMemory).val();
                                    memory = parseInt(memory);
                                if(isNaN(memory)) memory = 1024;
                                if(memory < 512) memory = 1024;
                                $(this.refs.JVMMemory).val(memory);
                                global.config.set('JVMMemory', memory)
                            }}/>
                    </div>

                    <div className="settings-item">
                        <label>JVM路径: </label>
                        <input type="text" defaultValue="自动适配路径" disabled="disabled" />
                    </div>

                    <div className="settings-item">
                        <label>窗口大小: </label>

                        <input type="text"
                               ref="MinecraftWidth"
                               style={{width: 80}}
                               defaultValue={ global.config.get('width') }
                               onBlur={() => global.config.set('width', $(this.refs.MinecraftWidth).val())}/>
                        
                        <input type="text"
                               ref="MinecraftHeight"
                               style={{width: 80, left: 190}}
                               defaultValue={ global.config.get('height') }
                               onBlur={() => global.config.set('height', $(this.refs.MinecraftHeight).val())}/>
                    </div>

                    <div className="settings-item">
                        <label>开发测试: </label>
                        <button
                            type="button"
                            style={{left: 80, height: 25, top: 2}}
                            ref="DownloadJavaTestButton"
                            onClick={() => {
                                $(this.refs.DownloadJavaTestButton).html('正在下载');
                                var DownloadJavaTask = Core.java.DownloadJavaToWorkSpace()

                                DownloadJavaTask.on('done', () => {
                                     $(this.refs.DownloadJavaTestButton).html('测试下载Java Success');
                                });

                                DownloadJavaTask.on('process', (process) => {
                                     $(this.refs.DownloadJavaTestButton).html('测试下载进度 ' + process.Process);
                                });

                                DownloadJavaTask.on('error', (error) => {
                                     $(this.refs.DownloadJavaTestButton).html('测试下载错误 ' + error);
                                });
                            }}>测试下载Java</button>
                    </div>

                    <div className="settings-item">
                        <label>开发测试: </label>
                        <button
                            type="button"
                            style={{left: 80, height: 25, top: 2}}
                            onClick={() => {
                               Core.java.ClearWorkSpaceJava().then(() => console.log('clear java done'));
                            }}>清除工作目录Java</button>
                    </div>

                    <div className="settings-item">
                        <label>开发测试: </label>
                        <button
                            type="button"
                            style={{left: 80, height: 25, top: 2}}
                            onClick={() => {
                                Core.java.GetWorkSpaceJVMProcess(['-version'], {})
                                .then(process => {
                                    process.stdout.on('data', function (data) {
                                        console.info(data.toString().trim());
                                    });
                                    process.stderr.on('data', function (data) {
                                        console.info(data.toString().trim());
                                    });
                                    process.on('error', function (err) {
                                        console.error(err.toString().trim());
                                    });
                                    process.on('exit', function (code) {
                                        console.info('java process exit code: ' + code);
                                    });
                                });
                            }}>运行工作目录Java</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default SettingsContainer;