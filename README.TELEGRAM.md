# Telegram Platform Integration Guide (OpenAD JS SDK for Telegram)

**Author**: Vincent

This guide describes how to integrate the **OpenAD Telegram SDK** in Telegram Mini Apps (TMA) and general Web/Web3 projects.

🌍 English | [简体中文](README.TELEGRAM.ZH.md) | [日本語](README.TELEGRAM.JA.md)

---

## ⚡ Audited Security and High Scale

* **Official Audit and Certification**: This SDK has successfully passed rigorous audits and received official certification from the Telegram platform.
* **Massive Concurrency Capacity**: Extensively benchmarked under extreme workloads, this SDK reliably scales to handle up to **450 million DAU (Daily Active Users)** globally in live production environments, ensuring consistent ad delivery and logging telemetry.

---

## 🚀 Step #1. Load the SDK

Include the SDK loader script inside the HTML `<head>` tag. The loader dynamically resolves the optimal OpenAD node API URL and loads the correct version of the SDK for the client:

```html
<head>
  <!-- Your other head elements -->
  <script 
    name="OpenADTGJsSDK" 
    version="4.0" 
    type="text/javascript" 
    src="https://protocol.openad.network/tg/sdk.loader.js">
  </script>
</head>
```

> [!TIP]
> We recommend appending your application's release version or a timestamp query parameter to the script URL to prevent aggressive browser/platform caching, e.g.:  
> `https://protocol.openad.network/tg/sdk.loader.js?v=your-app-version`

---

## 🎨 Step #2. Integrate Banner Ads

### Option A: Automatic DOM Placeholder Rendering (Recommended)
Add a `div` placeholder with the class name `OpenADJsSDKBanner` to the HTML `<body>`, configuring your `publisherId` and `zoneId` credentials:

```html
<body>
  <!-- Your content -->
  <div class="OpenADJsSDKBanner" publisherId="49" zoneId="158"></div>
  <!-- Your content -->
</body>
```
*(Note: In higher versions of the SDK, such as [tg.sdk.v5.js](tg.sdk.v5.js), the selector constraint has been relaxed. Any `div` tag that possesses the correct `zoneId` and `publisherId` attributes will be automatically recognized and rendered.)*

### Option B: Manual Initialization and Custom Rendering
In Single Page Applications (SPAs, e.g., Vue/React) or scenarios requiring fine-grained UI controls, you can fetch the advertising payload via JS and handle rendering/reporting manually.

#### 1. Define the Ad Config Structure (`TGAD`)
```javascript
const TGAD = {
  adInfo: {
    zoneId: 158,      // Replace with your zoneId
    publisherId: 49,   // Replace with your publisherId
  },
  adParams: {
    TG: {
      type: 'TMA', // Platform type: 'TMA' (Telegram Mini App), 'WEB', 'WEB3'
    },
    // Optional Web3 wallet configuration if using web3 features
    wallet: {
      type: 'ton', // Supported: 'eth', 'kaia', 'ton'
      provider: provider, // Initialized wallet provider instance (e.g. account from @tonconnect/ui)
      components: '@tonconnect/ui', // Component library name
    }
  }
};
```
*(Note: If the application type is `WEB` or `WEB3`, set `TG.type` accordingly, specify the `web`/`wallet` API endpoints for fetching wallet addresses, and supply user identifiers: `userInfo: { userId, firstName, lastName, username }`.)*

#### 2. Trigger Banner Rendering Manually
```javascript
// Instruct the SDK to render the ad banner directly inside the placeholder DOM
window.OpenADTGJsSDK.banner.init({ ...TGAD });
```

#### 3. Fetch Raw Material & Dispatch Logging (Custom UI Rendering)
```javascript
// 1. Fetch raw advertising assets
const res = await window.OpenADTGJsSDK.banner.get({ ...TGAD });
if (res.code === 0) {
  const resource = res.data; // Contains resource_url, width, height, etc.
  
  // 2. Render your custom DOM layout with the material
  // ...render asset on screen...
  
  // 3. Log a "View" impression event when the ad is visible to the user
  await window.OpenADTGJsSDK.banner.log(TGAD.adInfo);
}

// 4. Dispatch a "Click" event when the user clicks your custom ad element
// (The SDK handles redirection automatically)
window.OpenADTGJsSDK.banner.click(TGAD.adInfo);
```

---

## 🎮 Step #3. Integrate Full-Screen Interactive Ads

Interactive ads display fullscreen content for a designated duration. They are ideal for reward incentive loops, such as granting in-game items, currency, or extra lives.

### 1. Initialize Ad Resource Loaders
```javascript
window.OpenADTGJsSDK.interactive.init({ ...TGAD }).then(res => {
  if (res.code === 0) {
     // Initialization succeeded; call getRender to display the ad frame
  } else {
     // No ads available or init failed; hide the entry button in your UI
  }
});
```

### 2. Define Lifecycle Callback Handlers
```javascript
const callbackFunc = {
  // Dispatched when the ad resource has loaded (e = true / false)
  onAdResourceLoad: (e) => {
    console.log("Ad loaded status: ", e);
  },
  // Dispatched when the fullscreen popup starts opening
  onAdOpening: (e) => {
    console.log("Ad window opening...");
  },
  // Dispatched when the popup opens and playback commences
  onAdOpened: (e) => {
    console.log("Ad window opened");
  },
  // Dispatched when the required task specified by the advertiser is finished
  onAdTaskFinished: (e) => {
    console.log("Ad task finished: ", e);
  },
  // Dispatched when the popup window starts closing
  onAdClosing: (e) => {
    console.log("Ad window closing...");
  },
  // Dispatched when the popup is fully closed (essential for rewarding)
  onAdClosed: (e) => {
    // e = 'view' / 'click' / 'close'
    if (e === 'close') {
      // User manually aborted the ad midway; 【DO NOT issue rewards】
    }
    if (e === 'view') {
      // User watched the ad fully without clicking redirect; 【Grant Level 1 Reward】
    }
    if (e === 'click') {
      // User watched the ad fully and clicked the link; 【Grant Level 2 Reward】
    }
  },
  // Dispatched when user clicks the redirect action
  onAdClick: (e) => {
    console.log("Ad clicked: ", e);
  },
};
```

### 3. Display the Ad Frame
```javascript
// Render and load the interactive fullscreen ad overlay
window.OpenADTGJsSDK.interactive.getRender({ adInfo: TGAD.adInfo, cb: callbackFunc });
```

> [!WARNING]
> 1. Execute `getRender` **promptly** after a successful `init` (`res.code === 0`). Ad material requests are highly time-sensitive; idling may lead to token expirations and rendering failures.
> 2. Re-trigger the `init` workflow **before every** individual ad display attempt. Reusing old payloads will fail telemetry collection and render impressions untracked.
