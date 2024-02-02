import { Parser } from '../parser.js';

export class PostgresParser extends Parser {
  static parseEnumCheck(data: string) {
    return new PostgresParser(data).parseEnumCheck();
  }

  #parseCastExpression() {
    const string = this.#parseString();

    if (!this.matches(':')) {
      return string;
    }

    this.consume(':');
    this.consume(':');
    this.#parseUnquotedIdentifier();
    return string;
  }

  #parseEnumCheckBody() {
    this.#parseQuotedIdentifier();
    this.parseSpaces();
    this.consume('=');
    this.parseSpaces();
    this.consume(/a/i);
    this.consume(/n/i);
    this.consume(/y/i);
    this.parseSpaces();
    this.consume('(');
    this.consume(/a/i);
    this.consume(/r/i);
    this.consume(/r/i);
    this.consume(/a/i);
    this.consume(/y/i);
    this.consume('[');
    const values = this.#parseExpressionList();
    this.consume(']');
    this.consume(')');
    return values;
  }

  #parseExpressionList() {
    const values: string[] = [];

    do {
      if (values.length > 0) {
        this.consume(',');
        this.parseSpaces();
      }

      values.push(this.#parseGroupExpression());
      this.parseSpaces();
    } while (this.matches(','));

    return values;
  }

  #parseGroupExpression(): string {
    if (!this.matches('(')) {
      return this.#parseCastExpression();
    }

    this.consume('(');
    this.parseSpaces();
    const value = this.#parseGroupExpression();
    this.parseSpaces();
    this.consume(')');
    return value;
  }

  #parseQuotedIdentifier() {
    let value = '';
    this.consume('"');

    while (!this.done()) {
      if (this.matches('"')) {
        this.consume();

        if (this.matches('"')) {
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

  #parseUnquotedIdentifier() {
    const varcharMatch = this.data
      .slice(this.index)
      .match(/^character\s+varying/i);
    if (varcharMatch) {
      this.index += varcharMatch[0].length;
      return 'character varying';
    }

    let value = '';

    while (this.matches(/\w/i)) {
      value += this.consume();
    }

    return value;
  }

  parseEnumCheck() {
    this.consume(/c/i);
    this.consume(/h/i);
    this.consume(/e/i);
    this.consume(/c/i);
    this.consume(/k/i);
    this.parseSpaces();
    this.consume('(');
    this.consume('(');
    this.parseSpaces();
    const enumValues = this.#parseEnumCheckBody();
    this.parseSpaces();
    this.consume(')');
    this.consume(')');
    return enumValues;
  }
}
