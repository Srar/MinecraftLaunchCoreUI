import React, { Component, PropTypes } from 'react';
import child_process from 'child_process';
import $ from 'jquery';

const newsApiUrl = 'https://authentication.x-speed.cc/mcbbsNews/';
const newsChangeTime = 1000 * 4;
const newsTransitionEndTime = 150;

class NewsMessage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            news: [
                {title: '哇哦! 拉取新闻失败了!'},
                {title: '这真是一个令人悲伤的消息'},
                {title: '也许是您的无线网没有连接?'},
                {title: '也许是新闻爬虫蹦了?'},
                {title: '也许是mcbbs蹦了?'},
                {title: '其实我也不知道'},
                {title: '请坐和放宽'},
                {title: '也许100年内可以恢复'},
            ],
            newsSubscript: 1,
            disabledClick: true,
        }

        this.changeNewsTimer = null;
    }

    componentDidMount(){
        $.ajax({
            url: newsApiUrl,
            dataType: 'json',
            success: function(data) {
                this.setState({ news: data });
                this.changeNewsMessage(data[0].title);
                this.registerTimer();
                this.disabledClick(false);
            }.bind(this),
            error: function() {
                this.changeNewsMessage(this.getNewsByLocation(0).title);
                this.registerTimer();
            }.bind(this)
        });
    }

    componentWillUnmount() {
        this.clearTimer();
    }

    /* 注册公告切换Timer */
    registerTimer(){
        this.changeNewsTimer = setInterval(function (){
            var newsLocation = this.getNewsLocation();
            this.changeNewsMessage(this.getNewsByLocation(newsLocation).title);

            /* 判断后面还有没有新闻 */
            if( (newsLocation + 1) == this.state.news.length ){
                this.setNewsLocation(0);
            } else {
                this.setNewsLocation(newsLocation + 1);
            }
        }.bind(this), newsChangeTime);
    }

    /* 释放公告切换Timer */
    clearTimer(){
        clearInterval(this.changeNewsTimer);
    }

    /* 设置新闻数组下标 */
    setNewsLocation(newsLocation){
        this.setState({ newsSubscript: newsLocation });
    }

    /* 获取新闻数组下标 */
    getNewsLocation(){
        return this.state.newsSubscript;
    }

    /* 根据下表获取新闻 */
    getNewsByLocation(location){
        return this.state.news[location];
    }

    changeNewsMessage(message){
        $(this.refs.news).addClass("news-change");
        setTimeout(function() {
            $(this.refs.news).html(message);
            $(this.refs.news).removeClass("news-change");
        }.bind(this), newsTransitionEndTime);
    }

    disabledClick(bool){
        this.setState({ disabledClick: bool });
    }

    __onClickNews(){
        if(this.state.disabledClick) return;
        var news = this.getNewsByLocation(this.getNewsLocation() - 1);
        var link = news.link.replace(/&amp;/g, '&');
        console.log(link);
        child_process.execSync(`open "${link}"`);
    }

    render() {
        var bashClassName = "news";
        if(!this.state.disabledClick) bashClassName += ' news-hand';
        return (
            <span className={bashClassName} ref="news" onClick={this.__onClickNews.bind(this)}>拉取新闻中...</span>
        );
    }
}

export default NewsMessage;