import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

import { setConfig, getConfig, getSourceJSON } from './config.js';

global.config = {};
global.config.set = setConfig;
global.config.get = getConfig;
global.config.source = getSourceJSON;

ReactDOM.render(<App />, document.getElementById('app'));