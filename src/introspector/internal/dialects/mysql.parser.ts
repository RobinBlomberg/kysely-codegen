import { Parser } from '../parser.js';

export class MysqlParser extends Parser {
  static parseEnum(data: string) {
    return new MysqlParser(data).parseEnum();
  }

  #parseEnumBody() {
    const enums: string[] = [];

    while (!this.done() && !this.matches(')')) {
      if (enums.length > 0) {
        this.consume(',');
        this.parseSpaces();
      }

      const value = this.#parseString();
      enums.push(value);
    }

    return enums;
  }

  #parseString() {
    let value = '';

    this.consume("'");

    while (!this.done()) {
      if (this.matches("'")) {
        this.consume();

        if (this.matches("'")) {
          value += this.consume();
        } else {
          break;
        }
      } else {
        value += this.consume();
      }
    }

    return value;
  }

  parseEnum() {
    this.consume(/e/i);
    this.consume(/n/i);
    this.consume(/u/i);
    this.consume(/m/i);
    this.parseSpaces();
    this.consume('(');
    this.parseSpaces();
    const enumValues = this.#parseEnumBody();
    this.parseSpaces();
    this.consume(')');
    return enumValues;
  }
}
