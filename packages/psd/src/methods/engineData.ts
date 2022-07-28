import { EngineData } from "../interfaces";

export function parseEngineData(_raw: Uint8Array): EngineData {
    // tokenize -> parse -> check required properties
    // NOTE: use TextDecoder('utf-16be') and TextDecoder('utf-16le') w/ manual detection of BOM
    // BOM is https://en.wikipedia.org/wiki/Byte_order_mark#UTF-16
    return {
        DocumentResources: {},
        EngineDict: {},
        ResourceDict:{},
    }
}
