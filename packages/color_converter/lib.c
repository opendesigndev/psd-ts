#include "emscripten.h"
#include "lcms2.h"

/*
 * https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#interacting-with-an-api-written-in-c-c-from-nodejs
*/

EMSCRIPTEN_KEEPALIVE
/* cmsOpenProfileFromMem */
cmsHPROFILE OpenProfileFromMem(const void * MemPtr, cmsUInt32Number dwSize) {
  return cmsOpenProfileFromMem(MemPtr, dwSize);

}

EMSCRIPTEN_KEEPALIVE
/* cmsOpenProfileFromFile */
cmsHPROFILE OpenProfileFromFile(const char *ICCProfile, const char *sAccess) {
    return cmsOpenProfileFromFile(ICCProfile, sAccess);
}

EMSCRIPTEN_KEEPALIVE
/* cmsCreateTransform */
cmsHTRANSFORM CreateTransform(cmsHPROFILE Input,
                              cmsUInt32Number InputFormat,
                              cmsHPROFILE Output,
                              cmsUInt32Number OutputFormat,
                              cmsUInt32Number Intent,
                              cmsUInt32Number dwFlags) {
  return cmsCreateTransform(Input,
                            InputFormat,
                            Output,
                            OutputFormat,
                            Intent,
                            dwFlags);
}


EMSCRIPTEN_KEEPALIVE
/* cmsCloseProfile */
cmsBool CloseProfile(cmsHPROFILE hProfile) {
  return cmsCloseProfile(hProfile);
}

EMSCRIPTEN_KEEPALIVE
/* cmsDoTransform */
void DoTransform(cmsHTRANSFORM Transform,
                 const void * InputBuffer,
                 void * OutputBuffer,
                 cmsUInt32Number Size) {
    cmsDoTransform(Transform,
                   InputBuffer,
                   OutputBuffer,
                   Size);
}

EMSCRIPTEN_KEEPALIVE
/* cmsDeleteTransform */
void DeleteTransform(cmsHTRANSFORM hTransform) {
    cmsDeleteTransform(hTransform);
}
