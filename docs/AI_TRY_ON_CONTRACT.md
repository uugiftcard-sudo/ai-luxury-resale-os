# CLOTH AI Try-On Contract

## Purpose

CLOTH 的「AI 換裝 / 試衣」功能是網店功能，不是 XAU 直播老師服裝功能。

目標流程：

1. 客人上傳自己的相片。
2. 客人選擇 CLOTH 商品，例如二手奢侈品外套、裙、包、配飾。
3. 系統生成 AI Try-On 預覽圖，展示商品穿搭或上身效果。
4. 預覽結果只用於購物參考，不改動原商品資料，不自動下單。

## Product Boundary

- 所屬項目：CLOTH
- 不屬於：XAU 會員頁、XAU AI 老師服裝、XAU OBS 直播場景
- XAU 只可保留「直播數字人外觀設定」，不可包裝成網店客人試衣。

## V1 Scope

- Upload customer photo
- Select one product
- Generate one preview result
- Store consent flag and generated preview metadata
- Show disclaimer: AI 試衣效果只供參考，實物尺寸、材質、成色以商品頁為準

## Explicit Non-Goals

- No auto-purchase
- No identity verification
- No permanent biometric profile
- No cross-use of customer photo in XAU livestream assets
