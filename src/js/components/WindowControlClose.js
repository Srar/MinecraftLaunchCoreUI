import React, { Component, PropTypes } from 'react';
const remote = require('electron').remote;

class GreenButton extends Component {
    constructor(props) {
        super(props);
        console.log(remote);
    }

    __onClickClose(){
        var window = remote.getCurrentWindow();
        window.close();
    }

    render() {
        return (
            <div className="window-controls">
                <div className="close" onClick={this.__onClickClose.bind(this)}></div>
            </div>
        );
    }
}

export default GreenButton;