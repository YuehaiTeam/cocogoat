[中文](README.md)
<div align="center">

# cocogoat-web
[![https://cocogoat.work](https://img.shields.io/website?down_message=APP%20DOWN&label=APP&style=for-the-badge&up_color=%2300adff&up_message=https%3A%2F%2Fcocogoat.work&url=https%3A%2F%2Fcocogoat.work)](https://cocogoat.work)

A toolbox 100% running in browser for Genshin Impact with every line of code made by working overtime.

[![Build Production](https://img.shields.io/github/workflow/status/YuehaiTeam/cocogoat/Build%20Production?style=for-the-badge)](https://github.com/YuehaiTeam/cocogoat-web/actions/workflows/build-production.yml)
[![Build Singlefile](https://img.shields.io/github/workflow/status/YuehaiTeam/cocogoat/Build%20SingleFile?label=SINGLEFILE&style=for-the-badge)](https://github.com/YuehaiTeam/cocogoat-web/actions/workflows/build-production.yml)
![BSD-3 License](https://img.shields.io/github/license/YuehaiTeam/cocogoat?style=for-the-badge)

</div>

## Features
 - Achievements scanning
 - More features on the way......

### Achievements scanning
 - Recognize achievements by using a special version of [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) and [onnxruntime](https://onnx.ai) to run OCR in your browser.
 - Auto switching by running a client which has a size of only 140K.
 - Chinese and English are supported for recognizing.

## Contact or Feedback
 - Any issues are welcomed. Don't be scared by plenty of Chinese! We'll answer you in English.
 - For Chinese-reading users, our QQ group is [933468075](https://jq.qq.com/?_wv=1027&k=Pl2MFHcA).

**FAQs**
 - Q: Can I use this locally？  
   A: Yes. Just download the `singlefile build` from `Github Actions` and open the local HTML file with Chrome version 91 or upper.
 - Q: Why this website needs a client?  
   A: Simulating keyboard and mouse event is impossible without it.
 - Q: Then why make a web page and not just a client?
   A: Web pages can be used everywhere!
 - Q: Is the client opensource?
   A: [cocogoat-control](https://github.com/YuehaiTeam/cocogoat-control)

## Upadting
 - Just reload the page by pressing `Ctrl+F5`

## Contributing
This project is based on `typescript` and `vue.js`.  
Feel free to contribute by creating pull requests or submitting bug reports/feature requests!

 - Run locally: `yarn serve`
 - Build locally: `yarn build`