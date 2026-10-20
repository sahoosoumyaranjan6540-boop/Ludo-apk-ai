#!/bin/bash
set -e

echo "=== Building Ludo Royal Web Assets ==="
npm run build

echo "=== Preparing Android APK Workspace ==="
BUILD_DIR="/tmp/ludo_apk_workspace"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/res/values"
mkdir -p "$BUILD_DIR/res/mipmap-hdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xhdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xxhdpi"
mkdir -p "$BUILD_DIR/assets"
mkdir -p "$BUILD_DIR/smali/com/royal/ludo"

# Keystore
if [ ! -f /tmp/debug.keystore ]; then
  keytool -genkey -v -keystore /tmp/debug.keystore -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Ludo Royal,O=Royal Studios,C=US"
fi

# Icons
cp public/pwa-192x192.png "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png"
cp public/pwa-192x192.png "$BUILD_DIR/res/mipmap-xhdpi/ic_launcher.png"
cp public/pwa-512x512.png "$BUILD_DIR/res/mipmap-xxhdpi/ic_launcher.png"

# Strings
cat << 'STRINGS' > "$BUILD_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Ludo Royal</string>
</resources>
STRINGS

# Manifest
cat << 'MANIFEST' > "$BUILD_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.royal.ludo"
    android:versionCode="1"
    android:versionName="1.0.0">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:hardwareAccelerated="true"
        android:allowBackup="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name="com.royal.ludo.MainActivity"
            android:label="@string/app_name"
            android:exported="true"
            android:screenOrientation="portrait"
            android:configChanges="orientation|keyboardHidden|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
MANIFEST

# Native Smali WebView Activity
cat << 'SMALI' > "$BUILD_DIR/smali/com/royal/ludo/MainActivity.smali"
.class public Lcom/royal/ludo/MainActivity;
.super Landroid/app/Activity;
.source "MainActivity.java"

.field private webView:Landroid/webkit/WebView;

.method public constructor <init>()V
    .registers 1
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V
    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .registers 6
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    const/4 v0, 0x1
    invoke-virtual {p0, v0}, Landroid/app/Activity;->requestWindowFeature(I)Z

    new-instance v0, Landroid/webkit/WebView;
    invoke-direct {v0, p0}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V
    iput-object v0, p0, Lcom/royal/ludo/MainActivity;->webView:Landroid/webkit/WebView;

    invoke-virtual {v0}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;
    move-result-object v1
    const/4 v2, 0x1
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDatabaseEnabled(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowFileAccess(Z)V
    invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setAllowContentAccess(Z)V

    new-instance v2, Landroid/webkit/WebViewClient;
    invoke-direct {v2}, Landroid/webkit/WebViewClient;-><init>()V
    invoke-virtual {v0, v2}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V

    const-string v2, "file:///android_asset/index.html"
    invoke-virtual {v0, v2}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V

    invoke-virtual {p0, v0}, Landroid/app/Activity;->setContentView(Landroid/view/View;)V
    return-void
.end method

.method public onBackPressed()V
    .registers 2
    iget-object v0, p0, Lcom/royal/ludo/MainActivity;->webView:Landroid/webkit/WebView;
    if-eqz v0, :cond_c
    invoke-virtual {v0}, Landroid/webkit/WebView;->canGoBack()Z
    move-result v0
    if-eqz v0, :cond_c
    iget-object v0, p0, Lcom/royal/ludo/MainActivity;->webView:Landroid/webkit/WebView;
    invoke-virtual {v0}, Landroid/webkit/WebView;->goBack()V
    return-void
    :cond_c
    invoke-super {p0}, Landroid/app/Activity;->onBackPressed()V
    return-void
.end method
SMALI

# Assemble Smali
echo "=== Assembling Smali Classes ==="
smali assemble "$BUILD_DIR/smali" -o "$BUILD_DIR/classes.dex"

# Copy dist assets
echo "=== Copying Web Assets into APK Assets ==="
cp -r dist/* "$BUILD_DIR/assets/"
rm -f "$BUILD_DIR/assets/LudoRoyal.apk"*
rm -rf "$BUILD_DIR/assets/assets/aistudio"

# Package with aapt
echo "=== Packaging APK with AAPT ==="
cd "$BUILD_DIR"
aapt package -F unaligned.apk -M AndroidManifest.xml -I /usr/lib/android-sdk/platforms/android-23/android.jar -S res -A assets
zip -u unaligned.apk classes.dex

# Zipalign
echo "=== Aligning APK ==="
mkdir -p /app/applet/public
zipalign -f -v 4 unaligned.apk /app/applet/public/LudoRoyal.apk

# Sign with apksigner
echo "=== Signing APK with Apksigner ==="
apksigner sign --ks /tmp/debug.keystore --ks-pass pass:android --key-pass pass:android /app/applet/public/LudoRoyal.apk
apksigner verify -v /app/applet/public/LudoRoyal.apk

echo "=== APK Successfully Created at /app/applet/public/LudoRoyal.apk ==="
ls -lh /app/applet/public/LudoRoyal.apk
