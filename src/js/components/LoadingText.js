import React, { Component, PropTypes } from 'react';
import $ from 'jquery';

class LoadingText extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: 'loading',
            dropText: 'loading'.split('').map(item => {
                return {
                    html: item,
                    className: 'drop',
                    style: {}
                }
            })
        };
        this.divStyle = {
            position: 'relative',
            top: this.props.top ? this.props.top : 0,
            right: this.props.right ? this.props.right : 0,
            bottom: this.props.bottom ? this.props.bottom : 0,
            left: this.props.left ? this.props.left : 0,
            margin: 'auto',
            textAlign: 'center',
            fontSize: this.props.fontSize ? this.props.fontSize : 20,
        }

        this.genStyle = {
            position: 'absolute',
            right: 0,
            bottom: 0,
            left: 0,
            margin: 'auto',
            top: 0,
            textAlign: 'center',
        }

        for(var key in this.props.style){
            this.divStyle[key] = this.props.style[key];
        }

        this.charCount = 0;
        this.gloupTimer;
        this.changeCharTimer;

    }

    componentDidMount() {
        this.updateText(this.props.text);
        //this.registerTimer();
    }

    componentWillUnmount() {
        this.clearTimer();
    }

    registerTimer(){
        // console.log((this.state.dropText.length - this.getEmptyCount(this.state.text)) * 150 * 3);
        this.changeCharTimer = setInterval(this.dropText.bind(this), 150);
        this.gloupTimer = setInterval(function (){
            this.changeCharTimer = setInterval(this.dropText.bind(this), 150);
        }.bind(this), (this.state.dropText.length - this.getEmptyCount(this.state.text)) * 150 * 3);
    }

    clearTimer(){
        clearInterval(this.gloupTimer);
        clearInterval(this.changeCharTimer);
        this.charCount = this.state.dropText.length - 1;
        this.dropText();
    }

    updateCss(style){
        $(this.refs.LoadingText).css(style);
    }

    updateText(text){
        if(text == this.state.text) return;
        this.clearTimer();
        this.setState({
            text: text,
            dropText: text.split('').map(item => {
                return {
                    html: item,
                    className: 'drop',
                    style: {}
                }
            })
        });
    }

    dropText(){
        var source = this.state.dropText;
        source[this.charCount].style = {};
        source[this.charCount].className = 'drop droping';
        this.setState({ dropText: source });
        this.charCount++;
        if(this.charCount == this.state.dropText.length){
            //console.log('clear');
            this.charCount = 0;
            clearInterval(this.changeCharTimer);
            this.clearDropTextStyle();
        }
    }

    clearDropTextStyle(){
        setTimeout(function () {
            var source = this.state.dropText;
            source = source.map(item => {
                var temp = item;
                temp.style = {visible: 'hidden'};
                temp.className = 'drop drop-clear';
                return temp;
            });
            this.setState({ dropText: source });
        }.bind(this), 300);
    }

    getEmptyCount(content){
        var count = 0;
        content.split('').map(item => {
            if(item.trim() == '') count++;
        });
        return count;
    }

    render() {
        return (
            <div ref="LoadingText" className="loading-text" style={this.divStyle}>
                <div style={this.genStyle}>
                    {this.state.dropText.map((item, idx) => {
                        return <span className={item.className}
                                     style={item.style}
                                     key={idx}>{item.html}</span>
                        // return <span style={{visible: 'hidden'}} ref={idx}>{char}</span>
                    })}
                </div>
                <span>{this.state.text}</span>
            </div>
        )
    }
}

export default LoadingText;