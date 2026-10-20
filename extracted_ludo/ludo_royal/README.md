# Ludo Royal — Flutter Android starter

Premium dark-and-gold Ludo UI, offline turn-based game for 2–4 players, simple computer opponents, animated dice, editable display name, and emoji reactions. Includes Firebase anonymous-auth + Realtime Database room creation/joining scaffolding.

## Important scope note
This is a runnable **starter project**, not a finished commercial multiplayer game. The board is a stylized 3D-inspired presentation and the offline rules are intentionally simplified: token progress uses a circular track abstraction, with no official safe-square/capture/colored home-lane rules. Online room creation and joining work after Firebase setup, but synchronized online turns, in-room chat UI, matchmaking, reconnection, anti-cheat validation, and production security rules still need implementation. Do not publish it as a complete online game yet.

## Requirements
- Flutter stable (Dart 3.3+)
- Android Studio with Android SDK and an Android emulator or device
- For online room scaffolding: a Firebase project

## Run locally
1. Install Flutter and Android Studio; run `flutter doctor`.
2. Unzip the project and open the `ludo_royal` folder.
3. Run `flutter pub get`.
4. For offline play, run `flutter run` immediately. Firebase is optional for offline mode.
5. To create an APK: `flutter build apk --debug` (debug) or `flutter build apk --release` (release). Output is normally `build/app/outputs/flutter-apk/app-release.apk`.

If Android Gradle files are missing because this is a source starter, generate the platform wrapper once from this directory:
```bash
flutter create --platforms=android .
flutter pub get
flutter run
```

## Enable Firebase online room creation
1. Create a project in Firebase Console and add an Android app using your package ID (set/check it in `android/app/build.gradle` after running `flutter create`; use a unique ID such as `com.example.ludoroyal`).
2. Install FlutterFire CLI and run `dart pub global activate flutterfire_cli`.
3. Run `flutterfire configure` from the project root and choose Android. This generates `lib/firebase_options.dart`.
4. In `lib/main.dart`, import `firebase_options.dart` and uncomment/replace startup with:
```dart
await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);
```
5. In Firebase Console enable **Authentication → Sign-in method → Anonymous**.
6. Create **Realtime Database**. Configure rules before testing. Never deploy open read/write rules in production.
7. Run `flutter run`. Use Online room → Create room, then share the displayed room code. Another client can enter it and tap Join room.

### Example development-only database rules
Use only for a private test project and replace with strict membership validation before release:
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```
These rules are permissive and **not production safe**. Production rules should validate room membership, allowed fields, turn ownership, dice results, and chat length, ideally backed by trusted server logic/Cloud Functions.

## Project structure
```text
ludo_royal/
  lib/main.dart
  pubspec.yaml
  README.md
```

## Feature roadmap for production
- Replace circular track abstraction with standard 15×15 Ludo board, safe cells, captures, home lanes and exact finish rules.
- Store authoritative game state in `/rooms/{roomId}/state`; subscribe with Firebase `onValue`; validate moves on trusted backend.
- Build chat stream from `/rooms/{roomId}/chat`, limit message length, and filter abuse.
- Add profile persistence, avatar selection, sound, haptics, accessibility and automated tests.
- Add room capacity, presence, reconnect flow, abandoned-room cleanup and moderation.
