# Telegram 平台向け統合ガイド (OpenAD JS SDK for Telegram) (日本語)

**著者**: Vincent

本ガイドでは、Telegram Mini App (TMA) および一般的な Web/Web3 プロジェクトに **OpenAD Telegram SDK** を統合する方法について詳しく説明します。

🌍 [English](README.TELEGRAM.md) | [简体中文](README.TELEGRAM.ZH.md) | 日本語

---

## ⚡ 認定セキュリティと大規模実績

* **公式の監査および認定**：本 SDK は、**Telegram プラットフォームによる厳格な監査および公式のダブル認定に合格しています**。
* **大規模なアクセスへの対応**：過酷な高負荷環境下における広範な負荷テストにより、本 SDK は商用の本番環境において**グローバルで1日あたり最大 4.5 億 DAU（デイリーアクティブユーザー数）の超大規模アクセス**を安定して処理でき、広告の確実な配信と統計ログの確実な送信を保証します。

---

## 🚀 ステップ #1. SDKの読み込み

HTML の `<head>` タグ内に SDK ローダーを読み込みます。このローダーは、現在のクライアントにとって最適な OpenAD ノード API URL を動的に解決し、適切なバージョンの SDK を読み込みます。

```html
<head>
  <!-- 他の要素 -->
  <script 
    name="OpenADTGJsSDK" 
    version="4.0" 
    type="text/javascript" 
    src="https://protocol.openad.network/tg/sdk.loader.js">
  </script>
</head>
```

> [!TIP]
> ブラウザによるキャッシュを防ぐため、以下のように JS の URL の後ろにアプリのリリースバージョンやタイムスタンプなどのクエリパラメータを追加することを推奨します。  
> `https://protocol.openad.network/tg/sdk.loader.js?v=your-app-version`

---

## 🎨 ステップ #2. バナー広告 (Banner Ads) の統合

### 選択肢 A：DOM プレースホルダーの自動レンダリング (推奨)
HTML の `<body>` 内に、クラス名 `OpenADJsSDKBanner` を持つ `div` プレースホルダーを追加し、管理画面から取得した `publisherId` と `zoneId` を設定します。

```html
<body>
  <!-- アプリのコンテンツ -->
  <div class="OpenADJsSDKBanner" publisherId="49" zoneId="158"></div>
  <!-- アプリのコンテンツ -->
</body>
```
*(注：上位バージョンの SDK（[tg.sdk.v5.js](tg.sdk.v5.js) など）を使用する場合、クラス選択器の制約が緩和されています。正しい `zoneId` と `publisherId` 属性を持つ任意の `div` 要素であれば、SDK が自動的に検出して広告をレンダリングします。)*

### 選択肢 B：手動初期化とカスタムレンダリング
SPA（Vue/React など）や、広告の表示タイミング・デザインを細かくカスタマイズしたい場合は、JS を使用して手動でデータを取得し、レンダリングおよびログ送信を行うことができます。

#### 1. 広告設定オブジェクト (`TGAD`) の定義
```javascript
const TGAD = {
  adInfo: {
    zoneId: 158,      // ご自身の zoneId に置き換えてください
    publisherId: 49,   // ご自身の publisherId に置き換えてください
  },
  adParams: {
    TG: {
      type: 'TMA', // プラットフォーム種別: 'TMA' (Telegram Mini App), 'WEB', 'WEB3'
    },
    // Web3 ウォレットコンポーネントを使用する場合（任意）
    wallet: {
      type: 'ton', // サポート: 'eth', 'kaia', 'ton'
      provider: provider, // 初期化済みのウォレットプロバイダー（例: @tonconnect/ui の account）
      components: '@tonconnect/ui', // コンポーネントライブラリ名
    }
  }
};
```
*(注：アプリケーションの種別が `WEB` または `WEB3` の場合は、`TG.type` を適宜設定し、ウォレットアドレス取得用の API エンドポイント `web`/`wallet` を指定のうえ、ユーザー識別子 `userInfo: { userId, firstName, lastName, username }` を渡してください)*

#### 2. バナー広告の手動レンダリング
```javascript
// SDK を呼び出し、プレースホルダー DOM 内に広告バナーを直接レンダリングします
window.OpenADTGJsSDK.banner.init({ ...TGAD });
```

#### 3. 広告素材の直接取得とログ送信（カスタム UI の場合）
```javascript
// 1. 広告データを取得
const res = await window.OpenADTGJsSDK.banner.get({ ...TGAD });
if (res.code === 0) {
  const resource = res.data; // resource_url, width, height などが含まれます
  
  // 2. 取得した素材をもとに、独自の DOM 構造でレンダリング
  // ...画面上に表示...
  
  // 3. 広告がユーザーに表示されたら、インプレッション（表示）ログを手動送信
  await window.OpenADTGJsSDK.banner.log(TGAD.adInfo);
}

// 4. ユーザーがカスタム広告要素をクリックした際に、クリックログを手動送信
// （遷移先のアプリやリンクへのジャンプ処理は SDK が自動で処理します）
window.OpenADTGJsSDK.banner.click(TGAD.adInfo);
```

---

## 🎮 ステップ #3. 全画面インタラクティブ/リワード広告 (Interactive Ads)

インタラクティブ広告は、ユーザーに全画面広告を一定時間表示する仕組みです。視聴完了後にゲーム内特典（ライフ、コイン、アイテムなど）を付与するリワード施策に最適です。

### 1. 広告リソースの初期化
```javascript
window.OpenADTGJsSDK.interactive.init({ ...TGAD }).then(res => {
  if (res.code === 0) {
     // 初期化成功。getRender を呼び出して広告画面を表示可能
  } else {
     // 現在配信可能な広告がない、または初期化失敗。UI上の広告入り口を非表示にしてください
  }
});
```

### 2. ライフサイクルコールバック関数の設定
```javascript
const callbackFunc = {
  // 広告素材のロード完了時 (e = true / false)
  onAdResourceLoad: (e) => {
    console.log("広告ロード状態: ", e);
  },
  // 全画面ポップアップが表示される直前
  onAdOpening: (e) => {
    console.log("広告ウィンドウを表示中...");
  },
  // ポップアップが完全に表示され、再生が開始された時
  onAdOpened: (e) => {
    console.log("広告ウィンドウの表示完了");
  },
  // 広告主側が指定した特定タスク（一定秒数の視聴など）が完了した時
  onAdTaskFinished: (e) => {
    console.log("広告内タスク完了: ", e);
  },
  // 広告ウィンドウが閉じる直前
  onAdClosing: (e) => {
    console.log("広告ウィンドウを閉じる中...");
  },
  // 広告ウィンドウが完全に閉じた時（★ここで報酬付与の判定を行います）
  onAdClosed: (e) => {
    // e = 'view' / 'click' / 'close'
    if (e === 'close') {
      // ユーザーが再生途中で手動で広告を閉じた場合【報酬付与なし】
    }
    if (e === 'view') {
      // ユーザーが広告を最後まで視聴完了した（クリックはせず）【レベル 1（基本）報酬付与】
    }
    if (e === 'click') {
      // ユーザーが最後まで視聴し、クリックによる遷移も完了した【レベル 2（特別）報酬付与】
    }
  },
  // ユーザーが広告をクリックし遷移が発生した時
  onAdClick: (e) => {
    console.log("広告クリック検出: ", e);
  },
};
```

### 3. 広告ページの表示
```javascript
// 全画面広告ポップアップを取得して表示
window.OpenADTGJsSDK.interactive.getRender({ adInfo: TGAD.adInfo, cb: callbackFunc });
```

> [!WARNING]
> 1. `init` が `res.code === 0` を返した後は、**速やかに** `getRender` を呼び出してください。広告素材は一定時間で期限切れとなり、レンダリングできなくなります。
> 2. ユーザーが広告を再生するたびに、**毎回必ず新しく** `init` を実行して広告アセットを取得し直してください。古いデータの使い回しは不正な集計やトラッキングエラーの原因となります。
