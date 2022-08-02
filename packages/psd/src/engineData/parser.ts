import { Token, TokenType } from "./lexer";

export type RawEngineData = {
    [key: string]: RawEngineValue
}
export type RawEngineValue = string | number | boolean | RawEngineValue[] | RawEngineData

export class Parser {
    // private done: boolean = false
    constructor(private tokens: Generator<Token>) {}

    parse(): RawEngineData {
        const value = this.value()
        // TODO: for this to be true we'd need to force lexer somehow
        // console.assert(this.done, "not all tokens from engine data were consumed")
        if (typeof value === 'object' && !Array.isArray(value)) {
            return value
        }
        // TODO: create new error type
        throw new Error(`EngineData top-level value is not a dict; is ${typeof value}`)
    }

    private value(it?: Token): RawEngineValue {
        /**
        * NOTE: this is recursive descent parser - simplest solution in terms of code complexity
        * In case we ever start to run into stack-depth issues (stack overflow) due to
        * parsing data that's too big, this can be re-written into stack-based one.
        * That's because EngineData can be thought about as reverse-polish notation:
        * ] - end of array requires popping values from stack until you hit [
        *  (and pushing new value - an array - onto stack)
        * same for << and >>.
        */
        if (!it) {
            it = this.advance()
        }
        if (!it) {
            // TODO: create new error type
            throw new Error("End of stream")
        }
        switch(it.type) {
                case TokenType.Name:
                case TokenType.Number:
                case TokenType.Boolean:
                case TokenType.String:
                  return it.value
                case TokenType.DictBeg:
                  return this.dict()
                case TokenType.ArrBeg:
                  return this.arr()
        }
        // TODO: create new error type
        throw new Error(`Unexpected token: ${TokenType[it.type]}`)
    }

    private advance(): Token {
        const it = this.tokens.next()
        // this.done = Boolean(it.done);
        return it.value;
    }

    private dict(): RawEngineData {
        const val = {} as RawEngineData
        while(true) {
            const it = this.advance()
            if (it.type === TokenType.DictEnd) {
                return val
            }
            if (it.type !== TokenType.Name) {
                // TODO: create new error type
                throw new Error(`Dict key is not Name; is ${TokenType[it.type]}`)
            }
            const value = this.value()
            val[it.value] = value
        }
    }

    private arr(): RawEngineValue[] {
        const val = [] as RawEngineValue[]
        while(true) {
            const it = this.advance()
            if (it.type === TokenType.ArrEnd) {
                return val
            }
            const value = this.value(it)
            val.push(value)
        }
    }
}
