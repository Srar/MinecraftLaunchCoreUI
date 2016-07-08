# MinecraftLaunchCoreUI

基于Electron开发的Minecraft启动器 目前仅支持OSX 目前主要功能已完成

## 本启动器包含以下特性
* 优秀的用户体验
* 针对中国大陆用户提供优化的Minecraft资源下载速度
* 如系统未安装Java或者系统版本过低 会自动下载Java
* 
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
# Clone至本地
git clone https://github.com/Srar/MinecraftLaunchCoreUI.git
cd MinecraftLaunchCoreUI
# 安装依赖包
sudo npm install
# 构建启动器
gulp package
```
