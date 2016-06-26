'use strict';

const fs = require('fs');
const path = require('path');
const constants = require('./constants');

const configPath = constants.CONFIG;
const defaultConfig = {
    PlayerName: 'Unknow',
    JVMMemory: 1024,
    MinecraftVersion: '0.0.0',
    width: 854,
    height: 480,
}
var config = {};

if(fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} else {
    config = defaultConfig;
    fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8');
}

export function getConfig(key){
    return config[key];
}

export function setConfig(key, value){
    console.log(`set config [${key}] [${value}]`);
    config[key] = value;
    fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8');
}

export function getSourceJSON(){
    return config;
}


