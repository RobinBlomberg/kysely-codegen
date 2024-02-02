export class Parser {
  data = '';
  index = 0;

  constructor(data: string) {
    this.data = data;
  }

  #createSyntaxError() {
    const character = JSON.stringify(this.character()) ?? 'EOF';
    return new SyntaxError(
      `Unexpected character ${character} at index ${this.index}`,
    );
  }

  protected character() {
    return this.data[this.index];
  }

  protected consume(pattern?: string | RegExp) {
    if (pattern !== undefined && !this.matches(pattern)) {
      throw this.#createSyntaxError();
    }

    const character = this.character();
    this.index++;
    return character;
  }

  protected done() {
    return this.index >= this.data.length;
  }

  protected matches(pattern: string | RegExp) {
    const character = this.character();
    return typeof pattern === 'string'
      ? character === pattern
      : !!character && pattern.test(character);
  }

  protected parseSpaces() {
    while (this.matches(' ')) {
      this.consume();
    }
  }
}
