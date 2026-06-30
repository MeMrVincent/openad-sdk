# LINE 平台接入指南 (OpenAD JS SDK for LINE NEXT) (简体中文)

**作者**: Vincent

本指南详细介绍了如何在 LINE Mini App (LMA)、LINE Web App (LWA) 以及通用的 Web/Web3 项目中接入 **OpenAD LINE SDK**。

🌍 [English](README.LINE.md) | 简体中文 | [日本語](README.LINE.JA.md)

---

## 🚀 步骤 #1. 加载 SDK

在 HTML 的 `<head>` 标签中引入 SDK 加载器。此加载器会自动寻找最适合当前终端用户的 OpenAD 节点 API 并加载正确版本的 SDK：

```html
<head>
  <!-- 您的其他代码 -->
  <script 
    name="OpenADLineJsSDK" 
    version="1.0" 
    type="text/javascript" 
    src="https://protocol.openad.network/line/sdk.loader.js">
  </script>
</head>
```

> [!TIP]
> 推荐在 JS 引入地址后添加您的应用版本号或发布时间戳参数，以防浏览器或平台缓存旧版本，例如：  
> `https://protocol.openad.network/line/sdk.loader.js?v=your-app-version`

---

## 🎨 步骤 #2. 接入横幅广告 (Banner Ads)

### 方案 A：自动 DOM 占位渲染 (推荐)
在 HTML 的 `<body>` 中添加一个带 `openADJsSDKBanner` 类的 `div` 占位符，配置您从平台申请的 `publisherId` 和 `zoneId`：

```html
<body>
  <!-- 页面其它内容 -->
  <div class="openADJsSDKBanner" publisherId="1" zoneId="427"></div>
  <!-- 页面其它内容 -->
</body>
```

### 方案 B：手动初始化与自定义渲染
在 SPA（单页应用，如 Vue/React）或需要细粒度控制广告数据的场景中，您可以使用 JS 手动初始化和上报数据。

#### 1. 定义广告对象数据结构 (`LineAD`)
```javascript
const LineAD = {
  adInfo: {
    zoneId: 427,      // 替换为您的 zoneId
    publisherId: 1,   // 替换为您的 publisherId
  },
  adParams: {
    line: {
      type: 'LMA', // 平台类型: LMA (LINE Mini App) 或 LWA (LINE Web App)
      liffId: '2007174241-G112KL7Y', // 您的 LIFF ID
      prototype: liff, // 传入 LIFF 实例（LIFF 原型必须包含 getProfile 和 openWindow 方法）
    },
    // 如果您有 Web3 钱包组件，可以传入此项（可选）
    wallet: {
      type: 'eth', // 支持 'eth', 'kaia', 'ton'
      provider: provider, // 钱包初始化后的 provider 实例
      components: '@reown', // 钱包组件库名称，如 '@reown' 或 '@tonconnect/ui'
    }
  }
};
```
*(注：如果应用类型是通用的 `WEB` 或 `WEB3`，则需将 `line.type` 设为对应值，配置获取钱包地址的 `web`/`wallet` 接口，并传入包含唯一标识的用户数据 `userInfo: { userId, displayName }`)*

#### 2. 手动渲染 Banner 广告
```javascript
// 直接调用 SDK 在占位 DOM 处渲染横幅
window.OpenADLineJsSDK.banner.init({ ...LineAD });
```

#### 3. 获取原始广告数据并上报 (完全自定义渲染)
```javascript
// 1. 获取广告物料数据
const res = await window.OpenADLineJsSDK.banner.get({ ...LineAD });
if (res.code === 0) {
  const resource = res.data; // 包含 resource_url, width, height 等
  
  // 2. 渲染您的广告 DOM 节点（示例）
  // ...渲染完成后，展示给用户...
  
  // 3. 用户可见广告时，必须手动上报展示曝光日志
  await window.OpenADLineJsSDK.banner.log(LineAD.adInfo);
}

// 4. 当用户点击该广告物料时，手动上报点击日志（SDK 会自动处理广告页跳转）
window.OpenADLineJsSDK.banner.click(LineAD.adInfo);
```

---

## 🎮 步骤 #3. 接入全屏交互/激励广告 (Interactive Ads)

交互广告适用于提供传统游戏内激励场景（例如：玩家观看完广告后获得额外生命、金币等）。

### 1. 手动加载与初始化广告资源
```javascript
window.OpenADLineJsSDK.interactive.init({ ...LineAD }).then(res => {
  if (res.code === 0) {
     // 初始化成功，可以开始调用 getRender 呈现广告
  } else {
     // 当前无广告资源或初始化失败，请在 UI 上不显示广告入口
  }
});
```

<h3>2. 创建生命周期状态回调函数</h3>
```javascript
const callbackFunc = {
  // 广告资源是否加载完成 (e = true / false)
  onAdResourceLoad: (e) => {
    console.log("广告资源加载: ", e);
  },
  // 广告全屏弹窗正在打开
  onAdOpening: (e) => {
    console.log("广告窗口正在打开...");
  },
  // 广告弹窗已打开并开始播放/展示
  onAdOpened: (e) => {
    console.log("广告窗口已打开");
  },
  // 广告中包含的任务已完成（由广告主定义）
  onAdTaskFinished: (e) => {
    console.log("广告设定的任务已完成: ", e);
  },
  // 广告窗口正在关闭
  onAdClosing: (e) => {
    console.log("广告窗口正在关闭...");
  },
  // 广告窗口已彻底关闭（重要：在此处发放奖励）
  onAdClosed: (e) => {
    // e = 'view' / 'click' / 'close'
    if (e === 'close') {
      // 用户手动强行中途关闭了广告，【不予发放奖励】
    }
    if (e === 'view') {
      // 用户已完整观看完广告（未点击跳转），【发放 1 级基础奖励】
    }
    if (e === 'click') {
      // 用户完整看完了广告并发生了点击，【发放 2 级高级奖励】
      // (仅在 WEB / WEB3 模式下支持高级点击奖励发奖逻辑)
    }
  },
  // 广告被点击并触发跳转
  onAdClick: (e) => {
    console.log("广告已被用户点击跳转: ", e);
  },
};
```

### 3. 获取并渲染广告页面 (发奖机制)

根据不同的平台类型，调用方式有所不同：

#### A. 如果是通用 `WEB` 或 `WEB3` 模式：
直接传入配置与生命周期回调：
```javascript
window.OpenADLineJsSDK.interactive.getRender({ adInfo: LineAD.adInfo, cb: callbackFunc });
```

#### B. 如果是 LINE 专属 `LMA` 或 `LWA` 模式 (重要)：
根据平台机制与发奖安全规范，您**必须**额外提供一个发奖的异步回调函数 `clickReward` 传入 `getRender` 方法中：
```javascript
const clickReward = async () => {
  // 在此处触发异步网络请求，通知您的服务器执行发放点击高级奖励（如 Ajax/WebSocket）
  let res = await getRewardsLevel2Method();
  console.log('点击奖励发送状态:', res);
};

// 传入带有 clickReward 的参数
window.OpenADLineJsSDK.interactive.getRender({ 
  adInfo: LineAD.adInfo, 
  cb: callbackFunc, 
  clickReward: clickReward 
});
```

> [!WARNING]
> 1. 请在调用 `init` 方法返回 `res.code === 0` 后，**尽快**调用 `getRender`，因为广告物料是有时效性的，超时会导致展示无效。
> 2. 用户每次需要观看广告时，客户端都**必须重新执行**一次 `init` 获取全新资源，否则重复展示可能无法被计入有效统计。
