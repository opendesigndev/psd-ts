import { Cursor } from "../utils"

export enum TokenType {
    String,
    DictBeg,
    DictEnd,
    ArrBeg,
    ArrEnd,
}

export type Token =
    | { type: TokenType.String, value: string }
    | { type: TokenType.DictBeg }
    | { type: TokenType.DictEnd }
    | { type: TokenType.ArrBeg }
    | { type: TokenType.ArrEnd }

const WhitespaceCharacters = new Set(
    [0,
     9,
     12,
     32, // ' '
     10, // \n
     13, // \r
    ])

const Delimiters = {
    "(": 40,
    ")": 41,
    "<": 60,
    ">": 62,
    "[": 91,
    "]": 93,
    "{": 123,
    "}": 125,
    "/": 47,
    "%": 37,
    "\\": 92,
 }

const DelimiterCharacters = new Set(Object.values(Delimiters))

export class Lexer {
    constructor(private cursor: Cursor) {}

    *tokens(): Generator<Token> {
        while(!this.done()) {
            const val = this.cursor.read('u8')

            if (WhitespaceCharacters.has(val)) {
                while (!this.done() && WhitespaceCharacters.has(this.cursor.peek())) this.cursor.pass(1)
                continue
            }
            if (DelimiterCharacters.has(val)) {
                if (val === Delimiters["("]) {
                    yield { type: TokenType.String, value: this.text() }
                    continue
                }
                if (val === Delimiters["["]) {
                    yield { type: TokenType.ArrBeg }
                    continue
                }
                if (val === Delimiters["]"]) {
                    yield { type: TokenType.ArrEnd }
                    continue
                }
                if (val === Delimiters["<"]) {
                    // NOTE: assert that it is < indeed?
                    this.cursor.pass(1)
                    yield { type: TokenType.DictBeg }
                    continue
                }
                if (val === Delimiters[">"]) {
                    // NOTE: assert that it is > indeed?
                    this.cursor.pass(1)
                    yield { type: TokenType.DictEnd }
                    continue
                }
                continue
            }
        }
    }

    private done(): boolean {
        return this.cursor.position >= this.cursor.length
    }

    private text(): string {
        const firstByte = this.cursor.peek()
        if (firstByte === Delimiters[")"]) {
            this.cursor.pass(1)
            return ""
        }
        const hasBom = firstByte === 0xff || firstByte === 0xfe
        let decoder = new TextDecoder("utf-16be")
        if (hasBom) {
            decoder = this.textDecoderFromBOM()
        }
        const readAhead = this.cursor.clone()
        while (readAhead.peek() !== Delimiters[")"]) {
            readAhead.pass(1)
            // NOTE: do we need to decode escape sequences?
            if (readAhead.peek() === Delimiters["\\"])
                readAhead.pass(1)
         }
        const text = decoder.decode(this.cursor.take(readAhead.position - this.cursor.position - 1))
        this.cursor.pass(1) // final )
        return text
    }

    private textDecoderFromBOM(): TextDecoder {
        const firstBomPart = this.cursor.read('u8')
        const sndBomPart = this.cursor.read('u8')
        if (firstBomPart === 0xff && sndBomPart === 0xfe)
            return new TextDecoder("utf-16le")
        // NOTE: should we validate there's no garbage otherwise?
        return new TextDecoder("utf-16be")
    }
}
