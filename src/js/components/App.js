import React, { Component, PropTypes } from 'react';
import $ from 'jquery';

import WindowControlClose from './WindowControlClose';
import NewsMessage from './NewsMessage';
import LoadingIcon from './LoadingIcon';
import LoadingText from './LoadingText';
import ChoseVersionsContainer from './ChoseVersionsContainer';
import SettingsContainer from './SettingsContainer';
import LaunchButton from './LaunchButton';
import Core from '../launchCore/core';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            LoadingText: '',
        };
    }

    __onClickLaunchMinecraft(){
        $(this.refs.LaunchErrorMessage).css('display', 'none');
        this.refs.LaunchButton.AddStyle('transform', 'scale(0)');
        setTimeout(() => {
            this.refs.LaunchButton.AddStyle('display', 'none');
            this.refs.LaunchButton.RemoveStyle('transform');
            this.LaunchMinecraftProcess();
        }, 300);
    }

    LaunchMinecraftProcess(){
        $(this.refs.LoadingDiv).css({ opacity: 0 });
        $(this.refs.LoadingDiv).css({ display: ''});
        $(this.refs.LoadingDiv).animate({ opacity: 1 }, 1000);

        const MinecraftVersion = global.config.get('MinecraftVersion');
        var args = {
            player: global.config.get('PlayerName'),
            width: global.config.get('width'),
            height: global.config.get('height'),

            xmx: 512,
            xms: global.config.get('JVMMemory'),
        };

        if(MinecraftVersion == '0.0.0'){
            return this.LaunchMinecraftError('请选择Minecraft版本');
        }

        /* 检测 & 下载 Java */
        this.refs.LoadingText.updateText('Downloading Java');
        this.DisplayLoadingProcess(true);
        this.UpdateLoadingProcess('0/0');

        const InstallJavaProcess = Core.process.InstallJavaProcess();
        const DownloadMinecraftProcess = Core.process.DownloadMinecraftProcess(MinecraftVersion);
        const LoadLibsProcess = Core.process.LoadLibrariesProcess(MinecraftVersion);
        const LaunchMinecraftProcess = Core.process.LaunchMinecraftProcess(MinecraftVersion, args);

        const InstallJavaProcessEvent = InstallJavaProcess.event;
        const DownloadMinecraftProcessEvent = DownloadMinecraftProcess.event;
        const DownloadMinecraftLibsEvent = LoadLibsProcess.event;
        const LaunchMinecraftEvent = LaunchMinecraftProcess.event;

        if(`version-${MinecraftVersion}` == true){
            LaunchMinecraftProcess.start();
            this.refs.LoadingText.updateText('Launching Minecraft.');
            this.DisplayLoadingProcess(false);
            return;
        }

        InstallJavaProcess.start();
        InstallJavaProcessEvent.on('done', () => {
            this.UpdateLoadingProcess('...');
            DownloadMinecraftProcess.start();
        });
        InstallJavaProcessEvent.on('process', process => this.UpdateLoadingProcess(process.Process + '%'));
        InstallJavaProcessEvent.on('install', () => this.UpdateLoadingProcess('...'));
        InstallJavaProcessEvent.on('error', error => {
            global.config.set(`version-${MinecraftVersion}`, false);
            this.LaunchMinecraftError('下载Java失败:' + error);
        });

        /* 检测 & 下载 Minecraft Core */
        DownloadMinecraftProcessEvent.on('list', () => this.refs.LoadingText.updateText('Getting versions list'));
        DownloadMinecraftProcessEvent.on('json', () => this.refs.LoadingText.updateText('Downloading JSON file'));
        DownloadMinecraftProcessEvent.on('process', (process) => {
            this.refs.LoadingText.updateText('Downloading game core');
            this.UpdateLoadingProcess(process.Process + '%');
        });
        DownloadMinecraftProcessEvent.on('done', () => {
            this.UpdateLoadingProcess('...');
            LoadLibsProcess.start()
        });
        DownloadMinecraftProcessEvent.on('error', (error) => {
            this.LaunchMinecraftError('下载核心失败:' + error);
            global.config.set(`version-${MinecraftVersion}`, false);
        });


        /* 检测 & 下载 Minecraft 依赖库 */
        DownloadMinecraftLibsEvent.on('libraries', () => this.refs.LoadingText.updateText('Downloading libraries'));
        DownloadMinecraftLibsEvent
            .on('libraries_process', (process) => this.UpdateLoadingProcess(`${process.count}/${process.total}`));

        DownloadMinecraftLibsEvent.on('natives', () => this.refs.LoadingText.updateText('Downloading natives'));
        DownloadMinecraftLibsEvent
            .on('natives_process', (process) => this.UpdateLoadingProcess(`${process.count}/${process.total}`));
        DownloadMinecraftLibsEvent.on('done', () => {
            LaunchMinecraftProcess.start();
            this.refs.LoadingText.updateText('Launching Minecraft.');
            this.DisplayLoadingProcess(false);
        });
        DownloadMinecraftLibsEvent.on('error', (error) => {
            global.config.set(`version-${MinecraftVersion}`, false);
            this.LaunchMinecraftError('下载依赖失败:' + error);
        })

        /* 启动Minecraft事件 */
        LaunchMinecraftEvent.on('error', (error) => this.LaunchMinecraftError('启动Minecraft失败:' + error));
        LaunchMinecraftEvent.on('message', msg => console.info(msg));
        LaunchMinecraftEvent.on('exit', code => {
            if(code == 0) {
                global.config.set(`version-${MinecraftVersion}`, true);
                return this.LaunchMinecraftError('');
            }
            this.LaunchMinecraftError(`Minecraft异常退出: ${code}`);
            global.config.set(`version-${MinecraftVersion}`, false);
        });
    }

    LaunchMinecraftError(error){
        $(this.refs.LoadingDiv).animate({ opacity: 0 }, 1000);
        setTimeout(() => {
            $(this.refs.LoadingDiv).css({ display: 'none'});
            this.refs.LaunchButton.AddStyle('display', 'block');
            this.refs.LaunchButton.AddStyle('transform', 'scale(1)');
            this.refs.LaunchButton.RemoveStyle('transform');
            $(this.refs.LaunchErrorMessage).css('display', 'block');
            $(this.refs.LaunchErrorMessage).html(error);
        }, 1000);
    }

    DisplayLoadingProcess(display){
        this.refs.LoadingProcess.updateCss({ display: display ? 'inline-block' : 'none', left:10 });
    }

    UpdateLoadingProcess(process){
        this.refs.LoadingProcess.updateText(process);
    }

    render() {
        return (
              <div style={{height: 487,width: 310}}>
                <ChoseVersionsContainer ref="ChoseVersionsContainer" />
                  <SettingsContainer ref="SettingsContainer" />
                <div className="main-container">
                    <div className="gradient"></div>
                    <img className="icon" src="./assets/images/main_icon.png"/>
                    <NewsMessage />
                    <WindowControlClose />

                    { /* Setting icon */}
                    <i className="fa fa-cog icon-left"
                       aria-hidden="true"
                       onClick={() => this.refs.SettingsContainer.display()} />
                    { /* Block icon <AppLoading  /> */}
                    <i className="fa fa-cubes icon-right"
                       aria-hidden="true"
                       onClick={() => this.refs.ChoseVersionsContainer.display()} />


                    <div ref="LoadingDiv" style={{display: 'none', position: 'relative', top: 20, textAlign: 'center'}}>
                        <LoadingIcon className="loading-icon-main" style={{marginTop:10}} />
                        <LoadingText ref="LoadingText" text="loading..." style={{display: 'inline-block'}} />
                        <LoadingText ref="LoadingProcess" text="yooo" style={{display: 'none'}} />
                    </div>


                    <LaunchButton
                        ref="LaunchButton"
                        onClick={this.__onClickLaunchMinecraft.bind(this)}
                        style={{width:190, height: 56}} />

                    <span ref="LaunchErrorMessage"
                          style={{position: 'relative',top: 38,textAlign: 'center',display: 'none', fontSize: 11}}>
                        ErrorMessage
                    </span>
                </div>
            </div>
        );
    }
}

export default App;