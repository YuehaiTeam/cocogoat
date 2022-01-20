# 集成指南
椰羊web是一个网页项目，这意味着它可以被集成到各类基于网页的计算器中。如需要在自己的项目中使用，可以使用iframe直接嵌套，椰羊web提供了基于postMessage的交互方式；也可以参照源码实现到自己的项目中，本项目所有部分均开源。

## 成就
### iframe集成
```html
<iframe src ="https://cocogoat.work/frames/achievement-scanner" frameborder="0" allow="display-capture">
</iframe>
```
记得加上`allow="display-capture"`以允许抓屏。

### 数据源
所有的成就数据均来自 https://github.com/dvaJi/genshin-data 。目前已知此处的成就id和`seelie`及`paimon.moe`完全一致。

### 交互
扫描器可以通过`iframe`和上层应用交互，单个消息的格式如下：
```js
{
    app: 'cocogoat.scanner.achievement',
    event: 'ready',
    data: ......
}
```
### 案例
 - [ScanAndExport](https://github.com/YuehaiTeam/cocogoat-web/blob/main/src/views/AchievementScanner/ScanAndExport.vue)  
   扫描并导出到其他网站。包含了如何获取结果和失败图片、如何重置、以及如何计算前继成就。

### 事件
以下列表中，`event`为扫描器向`parent`发送，`command`为`parent`向扫描器发送。

 - event:`ready`  
   当扫描器初始化（加载模型和运行库）完成后触发。  
   data: `undefined`
 - event:`result`
   当扫描结束后触发。  
   data:
   ```typescript
   interface ResultMessageData {
       dup: number // 重复个数
       results: (IAScannerData | IAScannerFaild)[]
   }
   ```
   `IAScannerData`和`IAScannerFaild`的定义在[这里](https://github.com/YuehaiTeam/cocogoat-web/blob/main/src/views/AchievementScanner/scanner/scanner.ts#L35-L52)。  

   默认情况下，仅失败条目在`IAScannerFaild.image.main`带有截图，以方便用户手动修改操作。如果在URL中指定了`?withImage=1`，则成功结果也会带有截图。

 - command:`start`  
   与点击开始按钮作用相同。  
   data: undefined  

 - command:`reset`  
   重置扫描器状态。  
   data: undefined