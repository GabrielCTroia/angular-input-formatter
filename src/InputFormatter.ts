'use strict';

module InputFormatter {

  // TODO: refactor this!
  export class Formatter {

    private static PATTERN_KEYS = {
      '9': /[0-9]/,
      'a': /[A-Za-z]/,
      '*': /[A-Za-z0-9]/
    };

    private _patternGroups: string[];
    private _splitters: string[];

    private _startWithSplitter: boolean;

    private _rawPatternKeys: string;

    private _input: string;

    constructor(private _pattern: string) {
      if (!_pattern) {
        throw Error('Formatter.construct(): A pattern must be given!');
      }

      this._patternGroups = this.getPatternGroups() || [];

      this._splitters = this.getSplitters() || [];

      this._startWithSplitter = this._startsWithSplitter();

      this._input          = '';
      this._rawPatternKeys = this._patternGroups.join('');
    }

    public updateInput(input) {
      this._input = input.slice(0, this.getValidIndex(input));
    }

    public getValidIndex(input): number {
      var length = Math.min(input.length, this._rawPatternKeys.length);

      for (var i = 0; i < length; i++) {
        if (!Formatter.PATTERN_KEYS[this._rawPatternKeys[i]].test(input[i])) {
          break;
        }
      }

      return i;
    }

    public clean(input): string {
      return input
          .replace(/[^A-Za-z0-9]/gi, '') // remove the splitters
          .slice(0, this._rawPatternKeys.length); // limit the input length
    }

    public make(input): string {
      var cleanInput = this.clean(input);

      this.updateInput(cleanInput);

      var chunks = this.getInputChunks(this._input);

      var output        = '';
      var splitterIndex = (this._startWithSplitter) ? 1 : 0;
      for (var i = 0; i < chunks.length; i++) {
        if (typeof this._splitters[splitterIndex - 1] !== 'undefined') {
          output += this._splitters[splitterIndex - 1];
        }
        output += chunks[i];
        splitterIndex++;
      }


      if (this.isExhausted()
          && typeof this._splitters[splitterIndex - 1] !== 'undefined') {
        output += this._splitters[splitterIndex - 1];
      }

      return output;
    }

    public isExhausted() {
      return this._input.length === this._rawPatternKeys.length;
    }

    public getPatternGroups(): string[] {
      return this._pattern.match(/[9a*]+/gi);
    }

    public getSplitters(): string[] {
      return this._pattern.match(/[^9a*]+/gi);
    }

    private _startsWithSplitter(): boolean {
      return /[^9a*]+/gi.test(this._pattern.slice(0, 1));
    }

    public getInputChunks(input): string[] {
      var inputChunks = [];
      var inputIndex  = 0;

      for (var i = 0; i < this._patternGroups.length; i++) {
        inputIndex += (i > 0) ? this._patternGroups[i - 1].length : 0;

        var chunk = input.slice(inputIndex, inputIndex +
            this._patternGroups[i].length);

        if (!chunk) {
          break;
        }

        inputChunks[i] = chunk;
      }

      return inputChunks;
    }
  }

}
