// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {describe, expect, it} from "vitest";

import { parseEngineData } from "../../src/methods/engineData";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe("parseEngineData",() => {
    it("should work for empty array", () => {
        expect(parseEngineData(new Uint8Array())).toBe({
            DocumentResources: {},
            EngineDict: {},
            ResourceDict:{},
        })
    })

    it("should parse complex file", () => {
        const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "engineData.psd"));
        expect(parseEngineData(data)).toBe({
            DocumentResources: {},
            EngineDict: {},
            ResourceDict:{},
        })
    })
})
