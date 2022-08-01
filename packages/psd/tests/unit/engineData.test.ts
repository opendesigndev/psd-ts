// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import {describe, expect, it} from "vitest";

import { parseEngineData } from "../../src/methods/parseEngineData";
import { Lexer, TokenType } from "../../src/engineData";
import { Cursor } from "../../src/utils";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe("parseEngineData",() => {
    it("should work for empty array", () => {
        expect(parseEngineData(new Uint8Array())).toStrictEqual({
            DocumentResources: {},
            EngineDict: {},
            ResourceDict:{},
        })
    })

    it("should parse complex file", () => {
        const data = fs.readFileSync(path.resolve(FIXTURE_DIR, "engineData.bin"));
        expect(parseEngineData(data)).toStrictEqual({
            DocumentResources: {},
            EngineDict: {},
            ResourceDict:{},
        })
    })
})

describe("Lexer", () => {
    it("should decode text", () => {
        const data = [
            0x28, // (
            0xfe, // BOM - first marker
            0xff, // BOM - 2nd marker
            0x00, // padding
            0x61, // a
            0x00, // padding
            0x62, // b
            0x00, // padding
            0x63, // c
            0x00, // padding
            0x29, // )
        ]
        const result = new Lexer(new Cursor(new DataView(new Uint8Array(data).buffer))).tokens()
        const tokens = Array.from(result)
        expect(tokens).toStrictEqual([{ type: TokenType.String, value: "abc" }])
    })

    it("should recognize opening and closing of structures", () => {
        const data = [
            0x3c, // <
            0x3c, // <
            0x3e, // >
            0x3e, // >
            0x5b, // [
            0x5d, // ]
        ]
        const result = new Lexer(new Cursor(new DataView(new Uint8Array(data).buffer))).tokens()
        const tokens = Array.from(result)
        expect(tokens).toStrictEqual([
            { type: TokenType.DictBeg },
            { type: TokenType.DictEnd },
            { type: TokenType.ArrBeg },
            { type: TokenType.ArrEnd },
        ])
    })
})
