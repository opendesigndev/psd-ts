// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

import {Lexer, Parser} from "../engineData";
import {EngineData} from "../interfaces";
import {Cursor} from "../utils";

export function parseEngineData(raw: Uint8Array): EngineData {
  const value = new Parser(
    new Lexer(new Cursor(new DataView(raw.buffer, raw.byteOffset))).tokens()
  ).parse();
  // TODO: validate props
  return value as any as EngineData;
}
