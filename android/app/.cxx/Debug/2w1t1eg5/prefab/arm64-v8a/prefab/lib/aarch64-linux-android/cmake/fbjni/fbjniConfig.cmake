if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "C:/Users/user/.gradle/caches/8.14/transforms/c1ef3763cf49bc85d8fff96bb6fe131d/transformed/fbjni-0.5.1/prefab/modules/fbjni/libs/android.arm64-v8a/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/user/.gradle/caches/8.14/transforms/c1ef3763cf49bc85d8fff96bb6fe131d/transformed/fbjni-0.5.1/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

