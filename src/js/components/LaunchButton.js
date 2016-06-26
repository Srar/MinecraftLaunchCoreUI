import React, { Component, PropTypes } from 'react';
import $ from 'jquery';

class LaunchButton extends Component {

    constructor(props) {
        super(props);
        this.onClick = this.props.onClick ? this.props.onClick : () => {};
        this.GradientAngle = 137;
    }

    componentDidMount() {
        // setInterval(() => {
        //     if(this.GradientAngle > 360) this.GradientAngle = 0;
        //     this.GradientAngle = this.GradientAngle + 50;
        //     $(this.refs.LaunchButton).css('background', 'linear-gradient(' + this.GradientAngle + 'deg, #80ce53, #f6df35)');
        // }, 1000);
    }

    AddStyle(a, b){
        $(this.refs.Button).css(a, b);
    }

    RemoveStyle(a){
        $(this.refs.Button).css(a, '');
    }
    
    render() {
        var ButtonBorderStyle = {
            width: 90,
            height: 34,
        };

        for (var key in this.props.style)
            ButtonBorderStyle[key] = this.props.style[key];

        var ButtonStyle = {
            width: ButtonBorderStyle['width'] - 4,
            height: ButtonBorderStyle['height'] - 4,
        }


        return (
            <div style={ButtonBorderStyle}
                 ref="Button"
                 className={(this.props.className ? this.props.className : '') + ' launch-button'}>
                <button type="button"
                        onClick={this.onClick}
                        style={ButtonStyle}>
                    <span>Launch Minecraft</span>
                </button>
            </div>
        );
    }
}

export default LaunchButton;