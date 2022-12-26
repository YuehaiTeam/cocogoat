[English](README_en.md)
<div align="center">

# 椰羊·卷土重来
[![https://cocogoat.work](https://img.shields.io/website?down_message=APP%20DOWN&label=APP&style=for-the-badge&up_color=%2300adff&up_message=https%3A%2F%2Fcocogoat.work&url=https%3A%2F%2Fcocogoat.work)](https://cocogoat.work)

网页端原神工具箱。也是半仙之兽。

[![Build Production](https://img.shields.io/github/actions/workflow/status/YuehaiTeam/cocogoat/build-production.yml?branch=main&style=for-the-badge)](https://github.com/YuehaiTeam/cocogoat-web/actions/workflows/build-production.yml)
[![Build Singlefile](https://img.shields.io/github/actions/workflow/status/YuehaiTeam/cocogoat/build-singlefile.yml?branch=main&style=for-the-badge&label=SINGLEFILE)](https://github.com/YuehaiTeam/cocogoat-web/actions/workflows/build-production.yml)
![BSD-3 License](https://img.shields.io/github/license/YuehaiTeam/cocogoat?style=for-the-badge)

</div>

## 功能
 - 成就识别
 - 成就管理
 - 还在开发中......

### 成就识别
 - 使用[PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)和[onnxruntime](https://onnx.ai)在网页端本地识别
 - 支持通过配合仅140k的客户端实现模拟点击
 - 支持手机端扫描截图

### 成就管理
 - 支持按分类、任务、委托筛选成就
 - 支持查看成就的触发条件，如是任务触发可以显示任务名

## 遇到问题？
如您的问题未在此处列出或遇到不明卡死等情况，您可以[搜索或提交issue](issues)或者[加入交流群：933468075](https://jq.qq.com/?_wv=1027&k=Pl2MFHcA)反馈。

**常见问题：**
 - Q: 有没有离线版？  
   A: 有，可以到Actions里下载或加群获取。
 - Q: 为什么有些功能需要客户端？  
   A: 由于浏览器限制，这些需要模拟操作键盘鼠标的功能没办法直接实现。
 - Q: 为什么不只做客户端？  
   A: 网页端可以在 不想要任何模拟点击防止检测的环境 / 非windows电脑 / 也许是手机（开发中）/ 等使用，且方便集成。  
 - Q: 为什么客户端需要管理员权限？  
   A: 原神游戏使用管理员权限运行，如果以普通权限运行程序，我们将无法进行模拟点击和滚轮操作。  
 - Q: 客户端开源吗？  
   A: [cocogoat-control](https://github.com/YuehaiTeam/cocogoat-control)
 - Q: 会发送我的游戏数据到服务器吗？  
   A: 不会。所有需要发送到服务器的数据都会在发送前提示你（比如反馈），即使是崩溃报告也可以在设置里关闭。
 - Q: 能否导出数据到....   
   A: 未来可期，只需要带着需要的导入格式提交PR/issue/加群反馈......

## 更新
 - 如果您发现有些新功能没有出现，请直接按Ctrl+F5刷新。  

## 参与开发 
本项目基于 `typescript`和`vue.js`开发，我们欢迎一切有关的讨论、帮助和Pull Requests。  
推荐的开发环境：  
 - 本地运行: `pnpm serve`（vite）
 - 本地打包: `pnpm build`（webpack）
 - 单文件打包: `pnpm build:singlefile`（vite）
 - 以上命令都可以手动通过`:vite`或`:webpack`切换工具链。我们推荐使用`vite`进行开发，在`webpack`下测试后部署。