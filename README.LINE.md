# LINE Platform Integration Guide (OpenAD JS SDK for LINE NEXT)

**Author**: Vincent

This guide describes how to integrate the **OpenAD LINE SDK** in LINE Mini Apps (LMA), LINE Web Apps (LWA), and general Web/Web3 projects.

🌍 English | [简体中文](README.LINE.ZH.md) | [日本語](README.LINE.JA.md)

---

## 🚀 Step #1. Load the SDK

Include the SDK loader script inside the HTML `<head>` tag. The loader dynamically resolves the optimal OpenAD node API URL and loads the correct version of the SDK for the client:

```html
<head>
  <!-- Your other head elements -->
  <script 
    name="OpenADLineJsSDK" 
    version="1.0" 
    type="text/javascript" 
    src="https://protocol.openad.network/line/sdk.loader.js">
  </script>
</head>
```

> [!TIP]
> We recommend appending your application's release version or a timestamp query parameter to the script URL to prevent aggressive browser/platform caching, e.g.:  
> `https://protocol.openad.network/line/sdk.loader.js?v=your-app-version`

---

## 🎨 Step #2. Integrate Banner Ads

### Option A: Automatic DOM Placeholder Rendering (Recommended)
Add a `div` placeholder with the class name `openADJsSDKBanner` to the HTML `<body>`, configuring your `publisherId` and `zoneId` credentials:

```html
<body>
  <!-- Your content -->
  <div class="openADJsSDKBanner" publisherId="1" zoneId="427"></div>
  <!-- Your content -->
</body>
```

### Option B: Manual Initialization and Custom Rendering
In Single Page Applications (SPAs, e.g., Vue/React) or scenarios requiring fine-grained UI controls, you can fetch the advertising payload via JS and handle rendering/reporting manually.

#### 1. Define the Ad Config Structure (`LineAD`)
```javascript
const LineAD = {
  adInfo: {
    zoneId: 427,      // Replace with your zoneId
    publisherId: 1,   // Replace with your publisherId
  },
  adParams: {
    line: {
      type: 'LMA', // Platform type: LMA (LINE Mini App) or LWA (LINE Web App)
      liffId: '2007174241-G112KL7Y', // Your LIFF ID
      prototype: liff, // Pass your LIFF instance (prototype must feature getProfile and openWindow methods)
    },
    // Optional Web3 wallet configuration if using web3 features
    wallet: {
      type: 'eth', // Supported: 'eth', 'kaia', 'ton'
      provider: provider, // Initialized wallet provider instance
      components: '@reown', // Component library name (e.g., '@reown' or '@tonconnect/ui')
    }
  }
};
```
*(Note: If the application type is general `WEB` or `WEB3`, set `line.type` accordingly, specify the `web`/`wallet` API endpoints for fetching wallet addresses, and supply user identifiers: `userInfo: { userId, displayName }`.)*

#### 2. Trigger Banner Rendering Manually
```javascript
// Instruct the SDK to render the ad banner directly inside the placeholder DOM
window.OpenADLineJsSDK.banner.init({ ...LineAD });
```

#### 3. Fetch Raw Material & Dispatch Logging (Custom UI Rendering)
```javascript
// 1. Fetch raw advertising assets
const res = await window.OpenADLineJsSDK.banner.get({ ...LineAD });
if (res.code === 0) {
  const resource = res.data; // Contains resource_url, width, height, etc.
  
  // 2. Render your custom DOM layout with the material
  // ...render asset on screen...
  
  // 3. Log a "View" impression event when the ad is visible to the user
  await window.OpenADLineJsSDK.banner.log(LineAD.adInfo);
}

// 4. Dispatch a "Click" event when the user clicks your custom ad element
// (The SDK handles redirection automatically)
window.OpenADLineJsSDK.banner.click(LineAD.adInfo);
```

---

## 🎮 Step #3. Integrate Full-Screen Interactive Ads

Interactive ads display fullscreen content for a designated duration. They are ideal for reward incentive loops, such as granting in-game items, currency, or extra lives.

### 1. Initialize Ad Resource Loaders
```javascript
window.OpenADLineJsSDK.interactive.init({ ...LineAD }).then(res => {
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
      // (Level 2 click rewards are supported in WEB / WEB3 modes only)
    }
  },
  // Dispatched when user clicks the redirect action
  onAdClick: (e) => {
    console.log("Ad clicked: ", e);
  },
};
```

### 3. Display the Ad Frame (Reward Mechanism Mapping)

Depending on your platform type, invoke the renderer differently:

#### A. For General `WEB` or `WEB3` Platforms:
Directly submit the configuration parameters and lifecycle callback handlers:
```javascript
window.OpenADLineJsSDK.interactive.getRender({ adInfo: LineAD.adInfo, cb: callbackFunc });
```

#### B. For LINE-Exclusive `LMA` or `LWA` Platforms (Important):
Due to sandboxed environment mechanisms, you **must** supply an asynchronous callback `clickReward` to process the advanced click-reward logic securely:
```javascript
const clickReward = async () => {
  // Fire off an asynchronous API request/websocket signal to your servers to issue the Level 2 reward
  let res = await getRewardsLevel2Method();
  console.log('Reward dispatch status:', res);
};

// Render passing the clickReward property
window.OpenADLineJsSDK.interactive.getRender({ 
  adInfo: LineAD.adInfo, 
  cb: callbackFunc, 
  clickReward: clickReward 
});
```

> [!WARNING]
> 1. Execute `getRender` **promptly** after a successful `init` (`res.code === 0`). Ad material requests are highly time-sensitive; idling may lead to token expirations and rendering failures.
> 2. Re-trigger the `init` workflow **before every** individual ad display attempt. Reusing old payloads will fail telemetry collection and render impressions untracked.
