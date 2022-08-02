// @webtoon/psd
// Copyright 2021-present NAVER WEBTOON
// MIT License

// Based on PDF grammar: https://web.archive.org/web/20220226063926/https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf
// Section 7.2 - Lexical Conventions

import {Cursor} from "../utils";

export enum TokenType {
  String,
  DictBeg,
  DictEnd,
  ArrBeg,
  ArrEnd,
  Name,
  Number,
  Boolean,
}

export type Token =
  | {type: TokenType.String; value: string}
  | {type: TokenType.DictBeg}
  | {type: TokenType.DictEnd}
  | {type: TokenType.ArrBeg}
  | {type: TokenType.ArrEnd}
  | {type: TokenType.Name; value: string}
  | {type: TokenType.Number; value: number}
  | {type: TokenType.Boolean; value: boolean};

const WhitespaceCharacters = new Set([
  0,
  9,
  12,
  32, // ' '
  10, // \n
  13, // \r
]);

const BooleanStartCharacters = new Set([
  0x66, // f
  0x74, // t
]);

const Delimiters = {
  "(": 0x28,
  ")": 0x29,
  "<": 0x3c,
  ">": 0x3e,
  "[": 0x5b,
  "]": 0x5d,
  "/": 0x2f,
  "\\": 0x5c,
  // NOTE: These have meaning within PDF. Are they used here?
  // "{": 123,
  // "}": 125,
  // "%": 37,
};

const DelimiterCharacters = new Set(Object.values(Delimiters));

export class Lexer {
  constructor(private cursor: Cursor) {}

  *tokens(): Generator<Token> {
    while (!this.done()) {
      const val = this.cursor.read("u8");

      if (WhitespaceCharacters.has(val)) {
        while (!this.done() && WhitespaceCharacters.has(this.cursor.peek()))
          this.cursor.pass(1);
        continue;
      }
      if (DelimiterCharacters.has(val)) {
        if (val === Delimiters["("]) {
          yield {type: TokenType.String, value: this.text()};
          continue;
        }
        if (val === Delimiters["["]) {
          yield {type: TokenType.ArrBeg};
          continue;
        }
        if (val === Delimiters["]"]) {
          yield {type: TokenType.ArrEnd};
          continue;
        }
        if (val === Delimiters["<"]) {
          // NOTE: assert that it is < indeed?
          this.cursor.pass(1);
          yield {type: TokenType.DictBeg};
          continue;
        }
        if (val === Delimiters[">"]) {
          // NOTE: assert that it is > indeed?
          this.cursor.pass(1);
          yield {type: TokenType.DictEnd};
          continue;
        }
        if (val === Delimiters["/"]) {
          yield {type: TokenType.Name, value: this.string()};
          continue;
        }
        console.assert(
          false,
          "Unhandled delimiter: '%s'",
          String.fromCharCode(val)
        );
        continue;
      }
      // only two types left: number or boolean
      // we need to return val first since it starts value
      this.cursor.unpass(1);
      if (BooleanStartCharacters.has(val)) {
        yield {type: TokenType.Boolean, value: this.boolean()};
      } else {
        yield {type: TokenType.Number, value: this.number()};
      }
    }
  }

  private done(): boolean {
    return this.cursor.position >= this.cursor.length;
  }

  private text(): string {
    const firstByte = this.cursor.peek();
    if (firstByte === Delimiters[")"]) {
      this.cursor.pass(1);
      return "";
    }
    const hasBom = firstByte === 0xff || firstByte === 0xfe;
    let decoder = new TextDecoder("utf-16be");
    if (hasBom) {
      decoder = this.textDecoderFromBOM();
    }
    const textParts = [] as string[];
    const readAhead = this.cursor.clone();
    while (readAhead.peek() !== Delimiters[")"]) {
      readAhead.pass(1);
      if (readAhead.peek() === Delimiters["\\"]) {
        const length = readAhead.position - this.cursor.position;
        let raw = this.cursor.take(length);
        if (raw.at(-1) === 0x00) {
          // Sometimes there's extra padding before - we need to remove it
          raw = raw.subarray(0, -1);
        }
        textParts.push(decoder.decode(raw));
        readAhead.pass(1); // skip over \\
        textParts.push(String.fromCharCode(readAhead.take(1)[0])); // un-escape character
        this.cursor.pass(2); // skip over escaped character to avoid decoding it in subsequent part
      }
    }
    const length = readAhead.position - this.cursor.position;
    const raw = this.cursor.take(length);
    textParts.push(decoder.decode(raw));
    this.cursor.pass(1); // final )
    return textParts.join("");
  }

  private textDecoderFromBOM(): TextDecoder {
    const firstBomPart = this.cursor.read("u8");
    const sndBomPart = this.cursor.read("u8");
    if (firstBomPart === 0xff && sndBomPart === 0xfe)
      return new TextDecoder("utf-16le");
    // NOTE: should we validate there's no garbage otherwise?
    return new TextDecoder("utf-16be");
  }

  private string(): string {
    const decoder = new TextDecoder("ascii");
    const readAhead = this.cursor.clone();
    while (!this.done() && !WhitespaceCharacters.has(this.cursor.peek())) {
      this.cursor.pass(1);
    }
    const text = decoder.decode(
      readAhead.take(this.cursor.position - readAhead.position)
    );
    return text;
  }

  private number(): number {
    const text = this.string();
    const value = Number(text);
    console.assert(!Number.isNaN(value), "parsing '%s' as Number failed", text);
    return value;
  }

  private boolean(): boolean {
    const text = this.string();
    if (text === "true") {
      return true;
    }
    if (text === "false") {
      return false;
    }
    throw new Error(`'${text}' is neither 'true' nor 'false'`);
  }
}
