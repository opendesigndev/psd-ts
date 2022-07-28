// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import * as fs from "fs";
import * as path from "path";
import { beforeAll, describe, expect, it } from "vitest";

import type Psd from "../../src/index";
import PSD from "../../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

describe(`@webtoon/psd reads EngineData`, () => {
  let data: ArrayBuffer;
  let psd: Psd;

  beforeAll(() => {
    data = fs.readFileSync(path.resolve(FIXTURE_DIR, "engineData.psd")).buffer;
  });

  it(`should parse the file successfully`, () => {
    psd = PSD.parse(data);

    // TODO: assert property values in a separate test
    expect(psd.layers[1].textProperties).toStrictEqual({
        DocumentResources: {},
        EngineDict: {},
        ResourceDict:{},
    });
  });
});
