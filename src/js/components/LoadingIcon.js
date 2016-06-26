import React, { Component, PropTypes } from 'react';

class LoadingIcon extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.className ? this.props.className : ''}
                 style={this.props.style ? this.props.style : {}}>
                <div className="block block-one"></div>
                <div className="block block-two"></div>
                <div className="block block-three"></div>
                <div className="block block-four"></div>
            </div>
        )
    }
}

export default LoadingIcon;