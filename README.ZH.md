# OpenAD SDK (简体中文)

**作者**: Vincent

欢迎使用 **OpenAD SDK** 源代码仓库。本仓库包含了 OpenAD 针对不同社交/小游戏平台（Telegram & LINE）的底层 JS SDK 核心实现。

🌍 [English](README.md) | 简体中文 | [日本語](README.JA.md)

> [!IMPORTANT]
> **关于核心业务逻辑的说明**  
> 为了保障商业安全以及协议的合规性，本开源仓库**已剥离/删除了核心业务逻辑**（包括但不限于：敏感参数的拼接生成规则、安全性校验算法以及底层的加密数据上报交互）。
> 本仓库主要保留并展示了完整的业务流生命周期管理、DOM 广告节点渲染、各生命周期状态回调等底层逻辑，供开发者进行技术参考和定制化开发。

## 🌟 平台认证与高并发验证
* **Telegram 官方认证**：本仓库中针对 Telegram 平台的 SDK 实现已经通过了 **Telegram 平台的官方安全与性能双重认证**。
* **海量 DAU 支撑**：在实际生产环境中，该 SDK 具备极强的稳定性与扩展能力，**每日能够稳定承载高达 4.5 亿 DAU (日活跃用户) 的超大规模访问量**。

---

## 📂 平台接入文档指引

根据您集成的不同平台，请参阅以下详细的客户端接入和 API 使用指南：

1. **LINE 平台接入说明**  
   详细了解如何在 LINE LIFF、Kaia/Kaia Wallet 环境下集成 Banner 与 Interactive 广告，请阅读：  
   👉 **[LINE 平台接入文档 (README.LINE.ZH.md)](README.LINE.ZH.md)**

2. **Telegram 平台接入说明**  
   详细了解如何在 Telegram Mini App (TMA)、Web/Web3 钱包环境下集成横幅与全屏激励交互广告，请阅读：  
   👉 **[Telegram 平台接入文档 (README.TELEGRAM.ZH.md)](README.TELEGRAM.ZH.md)**

---

## 📜 许可协议
本项目采用 [MIT License](LICENSE) 许可协议。
