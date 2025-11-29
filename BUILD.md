# NEURONIC Build Instructions

## Prerequisites

1. **Node.js** (v18 or later)
2. **EAS CLI** installed globally:
   ```bash
   npm install -g eas-cli
   ```
3. **Expo account** - Sign up at https://expo.dev
4. **Android Studio** (for local builds) with:
   - Android SDK
   - NDK (for native modules)
   - Java 17+

## First-Time Setup

1. **Login to EAS:**
   ```bash
   eas login
   ```

2. **Initialize EAS project (if not already done):**
   ```bash
   eas init
   ```
   - Select "Create a new EAS project" when prompted
   - This will link your project to Expo's build service

## Building the Android APK

### Option 1: EAS Cloud Build (Recommended)

#### Preview Build (Unsigned APK for Testing)
```bash
npm run build:android
# or
eas build -p android --profile preview
```

#### Signed Preview Build
```bash
eas build -p android --profile preview-signed
```
This will prompt you to generate a keystore on first run.

#### Production Build
```bash
npm run build:android:prod
# or
eas build -p android --profile production
```

### Option 2: Local Build (Recommended for Native Modules)

Since NEURONIC uses `cactus-react-native` with native AI modules, local builds may be more reliable:

1. **Prebuild the native project:**
   ```bash
   npx expo prebuild --platform android --clean
   ```

2. **Build the APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

   Or for debug build:
   ```bash
   ./gradlew assembleDebug
   ```

3. **Find the APK:**
   - Release: `android/app/build/outputs/apk/release/app-release.apk`
   - Debug: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 3: Using npm script
```bash
npm run build:local
```

## Build Configuration

The build is configured in `eas.json`:

| Profile | Type | Use Case |
|---------|------|----------|
| `preview` | APK (unsigned) | Quick testing |
| `preview-signed` | APK (signed) | Internal distribution |
| `development` | APK (debug) | Development with dev client |
| `production` | AAB | Play Store submission |

## APK Size Target

**Target: Under 150MB**

The app includes:
- Expo runtime (~15MB)
- React Native (~10MB)
- Cactus SDK native libraries (~20MB)
- SQLite database (~2MB)
- NativeWind/Tailwind (~1MB)
- App code and assets (~5MB)

**Note:** AI models (Qwen, Whisper, Vision) are downloaded on first app launch, not bundled in the APK. This keeps the initial APK size small.

## Native Module Configuration

NEURONIC uses these native modules that require special handling:

1. **cactus-react-native** - On-device AI inference
2. **react-native-nitro-modules** - Native module bridge
3. **expo-av** - Audio recording
4. **expo-image-picker** - Camera/gallery access
5. **expo-sqlite** - Local database

These are configured in `app.json` under the `plugins` array.

## Troubleshooting

### Build fails with "EAS project not configured"
```bash
eas init
```

### Build fails with native module errors
Try local build instead:
```bash
npx expo prebuild --platform android --clean
cd android && ./gradlew assembleRelease
```

### Build fails with permission errors
```bash
eas whoami  # Check if logged in
eas login   # Login if needed
```

### APK too large
- Run `npx expo-doctor` to check for issues
- Remove unused dependencies from package.json
- Ensure images are optimized (use WebP format)
- Enable ProGuard in `android/app/build.gradle`

### Cactus SDK build issues
Ensure you have:
- NDK installed in Android Studio
- CMake installed
- Proper ANDROID_HOME environment variable

## Testing the APK

1. **Install on device:**
   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```

2. **Or transfer APK manually:**
   - Copy APK to device
   - Enable "Install from unknown sources"
   - Install the APK

3. **Verify all features:**
   - [ ] App launches and shows model download screen
   - [ ] Models download successfully
   - [ ] Text memory creation works
   - [ ] Voice recording and transcription works
   - [ ] Image capture and analysis works
   - [ ] Semantic search returns relevant results
   - [ ] Daily consolidation generates summaries
   - [ ] Related memories are displayed

## CI/CD Integration

For automated builds, add to your CI pipeline:

```yaml
# GitHub Actions example
- name: Build Android
  run: |
    npm ci
    npx eas build -p android --profile preview --non-interactive
```

Note: You'll need to configure EAS credentials as secrets.
