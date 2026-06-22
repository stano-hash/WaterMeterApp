@echo off
"C:\\Program Files\\Microsoft\\jdk-17.0.19.10-hotspot\\bin\\java" ^
  --class-path ^
  "C:\\Users\\user\\.gradle\\caches\\modules-2\\files-2.1\\com.google.prefab\\cli\\2.0.0\\f2702b5ca13df54e3ca92f29d6b403fb6285d8df\\cli-2.0.0-all.jar" ^
  com.google.prefab.cli.AppKt ^
  --build-system ^
  cmake ^
  --platform ^
  android ^
  --abi ^
  arm64-v8a ^
  --os-version ^
  24 ^
  --stl ^
  c++_shared ^
  --ndk-version ^
  27 ^
  --output ^
  "C:\\Users\\user\\AppData\\Local\\Temp\\agp-prefab-staging15997873790724366941\\staged-cli-output" ^
  "C:\\Users\\user\\.gradle\\caches\\8.14\\transforms\\8a13960de8e6fe2f78c8c2d824562bb1\\transformed\\react-android-0.73.4-debug\\prefab" ^
  "C:\\Users\\user\\.gradle\\caches\\8.14\\transforms\\c1ef3763cf49bc85d8fff96bb6fe131d\\transformed\\fbjni-0.5.1\\prefab" ^
  "C:\\Users\\user\\.gradle\\caches\\8.14\\transforms\\6b9bebe1b5dc89cb90f7fae0a4b75204\\transformed\\hermes-android-0.73.4-debug\\prefab"
