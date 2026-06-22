if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/user/.gradle/caches/8.14/transforms/6b9bebe1b5dc89cb90f7fae0a4b75204/transformed/hermes-android-0.73.4-debug/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/user/.gradle/caches/8.14/transforms/6b9bebe1b5dc89cb90f7fae0a4b75204/transformed/hermes-android-0.73.4-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

