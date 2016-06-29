# MinecraftLaunchCoreUI

基于Electron开发的Minecraft启动器 目前仅支持OSX

## 本启动器包含以下特性
* 不支持 Windows
* 不支持 Linux
* 不支持自定义Minecraft版本
* 不支持正版登录
* 不支持自定义下载源
* 不支持自定义Java路径
* 不支持自定义JVM额外参数
* 不支持启动器自动更新
* 不支持 Forge & LiteLoader 下载安装

## 如何构建

```bash
# Clone this repository
git clone https://github.com/Srar/MinecraftLaunchCoreUI.git
# Go into the repository
cd MinecraftLaunchCoreUI
# Install dependencies
sudo npm install
# build project
gulp package
```