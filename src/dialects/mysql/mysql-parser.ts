export class MysqlParser {
  data = '';
  index = 0;

  constructor(data: string) {
    this.data = data;
  }

  #consume(character: string) {
    if (this.data[this.index] !== character) {
      throw this.#createSyntaxError();
    }

    this.index++;
  }

  #createSyntaxError() {
    const character = JSON.stringify(this.data[this.index]) ?? 'EOF';
    return new SyntaxError(
      `Unexpected character ${character} at index ${this.index}`,
    );
  }

  #parseEnumBody() {
    const enums: string[] = [];

    while (this.index < this.data.length && this.data[this.index] !== ')') {
      if (enums.length) {
        this.#consume(',');
      }

      const value = this.#parseEnumValue();
      enums.push(value);
    }

    return enums;
  }

  #parseEnumValue() {
    let value = '';

    this.#consume("'");

    while (this.index < this.data.length) {
      if (this.data[this.index] === "'") {
        this.index++;

        if (this.data[this.index] === "'") {
          value += this.data[this.index++];
        } else {
          break;
        }
      } else {
        value += this.data[this.index++];
      }
    }

    return value;
  }

  parseEnum() {
    this.#consume('e');
    this.#consume('n');
    this.#consume('u');
    this.#consume('m');
    this.#consume('(');

    const enums = this.#parseEnumBody();

    this.#consume(')');

    return enums;
  }
}
