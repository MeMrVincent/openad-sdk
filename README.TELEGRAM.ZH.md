# Telegram 平台接入指南 (OpenAD JS SDK for Telegram) (简体中文)

**作者**: Vincent

本指南详细介绍了如何在 Telegram Mini App (TMA) 以及通用的 Web/Web3 项目中接入 **OpenAD Telegram SDK**。

🌍 [English](README.TELEGRAM.md) | 简体中文 | [日本語](README.TELEGRAM.JA.md)

---

## ⚡ 性能与稳定性验证
* **官方权威认证**：本 SDK 已经成功通过了 **Telegram 官方平台的全面审计与权威认证**。
* **高并发承载能力**：经过极端高并发及海量并发测试验证，本 SDK 在全球生产环境中**每日能够稳定承载 4.5 亿 DAU (日活跃用户) 的超大规模请求**，性能和数据一致性极具保障。

---

## 🚀 步骤 #1. 加载 SDK

在 HTML 的 `<head>` 标签中引入 SDK 加载器。此加载器会自动选择最合适的 OpenAD 节点 API 并加载对应版本的 SDK：

```html
<head>
  <!-- 您的其他代码 -->
  <script 
    name="OpenADTGJsSDK" 
    version="4.0" 
    type="text/javascript" 
    src="https://protocol.openad.network/tg/sdk.loader.js">
  </script>
</head>
```

> [!TIP]
> 推荐在 JS 引入地址后添加您的应用版本号或发布时间戳参数，以防浏览器缓存旧的加载脚本，例如：  
> `https://protocol.openad.network/tg/sdk.loader.js?v=your-app-version`

---

## 🎨 步骤 #2. 接入横幅广告 (Banner Ads)

### 方案 A：自动 DOM 占位渲染 (推荐)
在 HTML 的 `<body>` 中添加一个带 `OpenADJsSDKBanner` 类的 `div` 占位符，配置您从平台申请的 `publisherId` 和 `zoneId`：

```html
<body>
  <!-- 页面其它内容 -->
  <div class="OpenADJsSDKBanner" publisherId="49" zoneId="158"></div>
  <!-- 页面其它内容 -->
</body>
```
*(注：在使用较高版本的 SDK [tg.sdk.v5.js](tg.sdk.v5.js) 时，选择器已进一步放宽，只要是 `div` 标签且包含正确的 `zoneId` 和 `publisherId` 属性，SDK 即可完成识别和自动填充。)*

### 方案 B：手动初始化与自定义渲染
在 SPA（单页应用，如 Vue/React）或需要细粒度控制广告数据的场景中，您可以使用 JS 手动初始化和上报数据。

#### 1. 定义广告对象数据结构 (`TGAD`)
```javascript
const TGAD = {
  adInfo: {
    zoneId: 158,      // 替换为您的 zoneId
    publisherId: 49,   // 替换为您的 publisherId
  },
  adParams: {
    TG: {
      type: 'TMA', // 平台类型: 'TMA' (Telegram Mini App), 'WEB', 'WEB3'
    },
    // 如果您有 Web3 钱包组件，可以传入此项（可选）
    wallet: {
      type: 'ton', // 支持 'eth', 'kaia', 'ton'
      provider: provider, // 钱包初始化后的 provider 实例，如 @tonconnect/ui 的 account
      components: '@tonconnect/ui', // 钱包组件库名称
    }
  }
};
```
*(注：如果应用类型是 `WEB` 或 `WEB3`，则需将 `TG.type` 设为对应值，配置获取钱包地址的 `web`/`wallet` 接口，并传入包含唯一标识的用户数据 `userInfo: { userId, firstName, lastName, username }`)*

#### 2. 手动渲染 Banner 广告
```javascript
// 直接调用 SDK 在占位 DOM 处渲染横幅
window.OpenADTGJsSDK.banner.init({ ...TGAD });
```

#### 3. 获取原始广告数据并上报 (完全自定义渲染)
```javascript
// 1. 获取广告物料数据
const res = await window.OpenADTGJsSDK.banner.get({ ...TGAD });
if (res.code === 0) {
  const resource = res.data; // 包含 resource_url, width, height 等
  
  // 2. 渲染您的广告 DOM 节点（示例）
  // ...渲染并展示给用户...
  
  // 3. 用户可见广告时，必须手动上报展示曝光日志
  await window.OpenADTGJsSDK.banner.log(TGAD.adInfo);
}

// 4. 当用户点击该广告物料时，手动上报点击日志（SDK 会自动处理广告页跳转）
window.OpenADTGJsSDK.banner.click(TGAD.adInfo);
```

---

## 🎮 步骤 #3. 接入全屏交互/激励广告 (Interactive Ads)

交互广告适用于提供游戏内激励场景（例如：玩家观看完广告后获得额外生命、金币或游戏道具等）。

### 1. 手动加载与初始化广告资源
```javascript
window.OpenADTGJsSDK.interactive.init({ ...TGAD }).then(res => {
  if (res.code === 0) {
     // 初始化成功，可以开始调用 getRender 呈现广告
  } else {
     // 当前无广告资源或初始化失败，请在 UI 上隐去广告入口
  }
});
```

### 2. 创建生命周期状态回调函数
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
  // 广告窗口已彻底关闭（重要：在此处处理发奖逻辑）
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
    }
  },
  // 广告被点击并触发跳转
  onAdClick: (e) => {
    console.log("广告已被用户点击跳转: ", e);
  },
};
```

### 3. 获取并渲染广告页面
```javascript
// 渲染并加载交互式全屏广告
window.OpenADTGJsSDK.interactive.getRender({ adInfo: TGAD.adInfo, cb: callbackFunc });
```

> [!WARNING]
> 1. 请在调用 `init` 方法返回 `res.code === 0` 后，**尽快**调用 `getRender`，因为广告数据具有时效性，超时会导致展示无效。
> 2. 用户每次需要观看广告时，客户端都**必须重新执行**一次 `init` 获取全新资源，否则重复展示可能无法被计入有效统计。
