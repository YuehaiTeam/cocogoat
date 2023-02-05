[中文](README.md)
<div align="center">

# cocogoat-web - The Return
[![https://cocogoat.work](https://img.shields.io/website?down_message=APP%20DOWN&label=APP&style=for-the-badge&up_color=%2300adff&up_message=https%3A%2F%2Fcocogoat.work&url=https%3A%2F%2Fcocogoat.work)](https://cocogoat.work)

A 100% browser-based toolbox for Genshin Impact with every line of code made by working overtime.

[![Build Production](https://img.shields.io/github/actions/workflow/status/YuehaiTeam/cocogoat/build-production.yml?branch=main&style=for-the-badge)](https://github.com/YuehaiTeam/cocogoat-web/actions/workflows/build-production.yml)
[![Build Singlefile](https://img.shields.io/github/actions/workflow/status/YuehaiTeam/cocogoat/build-singlefile.yml?branch=main&style=for-the-badge&label=SINGLEFILE)](https://github.com/YuehaiTeam/cocogoat-web/actions/workflows/build-production.yml)
![BSD-3 License](https://img.shields.io/github/license/YuehaiTeam/cocogoat?style=for-the-badge)

</div>

## Features
 - Achievements scanning
 - Achievement management
 - More features to come...

### Achievement scanning
 - Recognize achievements by using a special version of [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) and [onnxruntime](https://onnx.ai) to run OCR in your browser.
 - Auto switching by running a clien that is only 140K in size.
 - Chinese and English are currently supported for recognition.
 - Support for mobile phone screenshots.

### Achievement management
- Support filtering achievements by category, task & commissions
- Support for viewing the trigger conditions of achievements. If the achievement is triggered by task, the task name can be displayed.

## Contact or Feedback
 - Any issues/feedback is welcome. Don't be scared by all the Chinese text, we'll answer you in English!
 - For Chinese-reading users, our QQ group is [933468075](https://jq.qq.com/?_wv=1027&k=Pl2MFHcA).

**FAQs**
 - Q: Can I use this locally？  
   A: Yes. Just download the `singlefile build` from `GitHub Actions` and open the local HTML file with Chrome v91 or higher .
 - Q: Why does this website need a client?  
   A: It is implossible to simulate keyboard and mouse events without it.
 - Q: Why make a web page and not just a client?  
   A: Web pages can be used anywhere!
 - Q: Why does the client need administrator privileges?  
   A: Genshin Impact runs with administrator privileges. If you run cocogoat with normal privileges, it will not be able to simulate the click and scroll wheel actions.
 - Q: Is the client opensource?  
   A: [cocogoat-control](https://github.com/YuehaiTeam/cocogoat-control)
 - Q: Will my data be sent to the server?  
   A: No. Amy data that needs to be sent (such as feedback) will prompt you before it is sent. Even crash reports can be turned off in the settings.
 - Q: Can I export data to...?  
   A: Eventually, we just need a PR/issue/group feedback to be submitted with the required import format!

## Upadting
 - Just reload the page by pressing `Ctrl+F5`

## Contributing
This project is based on `typescript` and `vue.js`.  
Feel free to contribute by creating pull requests or submitting bug reports/feature requests!

 - Run locally: `pnpm serve` (vite)
 - Build locally: `pnpm build` (webpack)
 - Build as a single file: `pnpm build:singlefile` (vite)
 - You can specify the toolchain with `:vite` or `:webpack`. We recommend `vite` for development and `webpack` for deployment after testing.
