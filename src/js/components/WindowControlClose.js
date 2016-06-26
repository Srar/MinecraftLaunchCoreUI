import React, { Component, PropTypes } from 'react';

class GreenButton extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="window-controls">
                <div className="close"></div>
            </div>
        );
    }
}

export default GreenButton;