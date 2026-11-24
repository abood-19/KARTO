# KARTO app — App Store & Google Play

This folder is the customer app on its own (only ordering, menu, cart, profile, game). Staff screens and the owner system are not inside it.

## 1. Point the app at your server
Open `www/config.js` and set your server address:
```js
window.KARTO_API = "https://karto.uz";
```

## 2. Android (Google Play)
1. Install Node.js 20 and Android Studio.
2. In this folder: `npm install` then `npm run android`.
3. Android Studio opens → Build → Generate Signed Bundle (.aab) → upload to Google Play Console (one-time fee $25).

## 3. iPhone (App Store)
1. Needs a Mac with Xcode and an Apple Developer account ($99/year).
2. `npm install` then `npm run ios`.
3. Xcode opens → Product → Archive → upload to App Store Connect.

## Icons and splash
`www/icon-512.png` is the KARTO icon. Generate all sizes with `npx @capacitor/assets generate --iconBackgroundColor '#FFC21A'` after placing a 1024px icon at `assets/icon.png`.
