import React, { Component, PropTypes } from 'react';
import $ from 'jquery';
import fs from 'fs';

import LoadingIcon from './LoadingIcon';
import LoadingText from './LoadingText';
import launchCore  from '../launchCore/core.js';


const constants = require('../constants');

class ChoseVersionsContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            versions: [],
        }
        this.downloadVersions = [];
    }

    display() {
        $(this.refs.choseVersionsContainer).addClass('chose-versions-container-display');
        this.setLoading(true);

        /* 获取已经可以离线的版本 */
        var sourceConfig = global.config.source();
        for (var key in sourceConfig) {
            if(key.substring(0, 8) == 'version-'){
                this.downloadVersions.push(key.substring(8, key.length));
            }
        }

        var versionsOfflineFile = constants.WORKSPACE + '/versions.json';

        /* load verions list */
        launchCore.files.getVersions(launchCore.url.getVersionsForChinaUser())
            .then(versions => {
                var render = versions.map(item => {
                    item['chose'] = global.config.get('MinecraftVersion') == item.id;
                    return item;
                });

                if(fs.existsSync(versionsOfflineFile)) fs.unlinkSync(versionsOfflineFile);
                fs.writeFileSync(versionsOfflineFile, JSON.stringify(render), 'utf-8');

                setTimeout(() => {
                    this.setState({ versions: render });
                    this.setLoading(false)
                }, 1000);
            }).catch(error => {
                this.setLoading(false);
                if(!fs.existsSync(versionsOfflineFile)) return alert(error);
                this.setState({ versions: JSON.parse(fs.readFileSync(versionsOfflineFile, 'utf-8')) });
            });
    }

    hide(){
        $(this.refs.choseVersionsContainer).removeClass('chose-versions-container-display');
        /* 等待动画结束 */
        setTimeout(() => {
            this.setState({ versions: [] });
            this.setLoading(false);
        }, 400);
    }

    setLoading(status){
        if(status){
            this.refs.loadingText.registerTimer();
        } else {
            this.refs.loadingText.clearTimer();
        }
        this.setState({ loading: status })
    }

    getChineseType(type){
        switch (type){
            case 'release'  : return '正式版';
            case 'snapshot' : return '快照版';
            case 'old_beta' : return '初期内测版';
            case 'old_alpha': return '初期开发版';
            default         : return type;
        }
    }

    __onClickChoseVersion(version){
        global.config.set('MinecraftVersion', version);
        var temp = [];
        this.state.versions.map(item => {
            item['chose'] = version == item.id;
            temp.push(item);
        });
        this.setState({ versions: temp });
    }

    render() {
        /* 判断是否显示loading动画 */
        if(this.state.loading){
            $(this.refs.loading).css('display', 'block');
            $(this.refs.versions).css('display', 'none');
        } else {
            $(this.refs.loading).css('display', 'none');
            $(this.refs.versions).css('display', 'block');
        }

        return (
            <div ref="choseVersionsContainer" className="chose-versions-container">
                <div className="top-bar">
                    <i className="fa fa-angle-left back-button" aria-hidden="true" onClick={this.hide.bind(this)}></i>
                    <span className="title">版本选择</span>
                </div>
                
                <div className="body">
                    <div ref="loading">
                        {
                            /*

                             <div style={{
                             margin: 'auto',
                             marginTop: 100,
                             width: 90,
                             height: 112,
                             background: "url('./assets/images/server.svg')"
                             }}></div>

                             */
                        }
                        <LoadingIcon className="loading-icon-main" style={{marginTop:150}} />
                        <LoadingText ref="loadingText" text="Getting versions list" />
                    </div>

                    <div className="versions-list" ref="versions">
                        {this.state.versions.map(item => {
                            return (
                                <div className="versions-item"
                                     key={'versionslistItem' + item.id}
                                     onClick={this.__onClickChoseVersion.bind(this, item.id)}>
                                    <span className="version">{item.id}</span>
                                    {this.downloadVersions.map(version => {
                                        if(version == item.id){
                                            return <span className="offline">可离线</span>
                                        }
                                    })}
                                    <span className="type">
                                        版本类型:&nbsp;{ this.getChineseType(item.type) }
                                    </span>
                                    <span className="time">
                                        发布时间:&nbsp;{ item.releaseTime.substring(0, item.releaseTime.indexOf('T')) }
                                    </span>
                                    {/* 是否已经选择了这个版本 */}
                                    {item.chose ? <i className="fa fa-check chose"
                                                     aria-hidden="true" /> : <i/>}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export default ChoseVersionsContainer;