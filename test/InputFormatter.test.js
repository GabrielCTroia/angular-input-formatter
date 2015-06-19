'use strict';

var InputFormatter = require('./src/inputFormatter');

describe('Formatter', function () {

  var formatter;

  describe('pattern groups', function () {
    it('gets the pattern groups', function () {
      formatter = new InputFormatter('999-999');

      expect(formatter.getPatternGroups()).toEqual(['999', '999']);
    });

    it('gets the pattern as a group even if single', function () {
      formatter = new InputFormatter('999-999-9|a||*-9');

      expect(formatter.getPatternGroups()).toEqual(['999', '999', '9', 'a', '*', '9']);
    })
  });


  describe('pattern splitters', function () {
    it('gets single pattern splitters', function () {
      formatter = new InputFormatter('999-999/aaa');

      expect(formatter.getSplitters()).toEqual(['-', '/']);
    });

    it('gets multi pattern splitters and groups them together', function () {
      formatter = new InputFormatter('999--999//aaa))))***');

      expect(formatter.getSplitters()).toEqual(['--', '//', '))))']);
    });

    it('gets pattern splitters from start and end', function () {
      formatter = new InputFormatter('||999--999//aaa))))***]]');

      expect(formatter.getSplitters()).toEqual(['||', '--', '//', '))))', ']]']);
    });
  });

  describe('Input chunks', function () {

    //it('does NOT take in account unmatched chars', function() {
    //  formatter = new InputFormatter('999');
    //
    //  expect(formatter.getInputChunks('abc')).toEqual(['']);
    //});

    it('doesnt return a empty chunk if input smaller', function () {
      formatter = new InputFormatter('99|9|^999-9');

      expect(formatter.getInputChunks('123')).toEqual([
        '12', '3']);
    });

    it('works with same pattern, same splitter', function () {
      formatter = new InputFormatter('999-999');

      expect(formatter.getInputChunks('123456')).toEqual(['123', '456']);
    });

    it('works with same pattern key, same splitter key, multiple splitters',
        function () {
          formatter = new InputFormatter('999-999-99-99999-9-9');

          expect(formatter.getInputChunks('123456712345679')).toEqual([
            '123', '456', '71', '23456', '7', '9']);
        });

    it('works with same pattern key, different splitter keys', function () {
      formatter = new InputFormatter('99|9|^999-9');

      expect(formatter.getInputChunks('1234567')).toEqual([
        '12', '3', '456', '7']);
    });

  });

  describe('clean', function () {

    it('cleans the non numerical|alpha characters(splitters)', function () {
      formatter = new InputFormatter('99|9|^999-9');

      expect(formatter.clean('34|8|^123-0')).toBe('3481230');
    });

    it('limits the output to the pattern raw length', function () {
      formatter = new InputFormatter('99999-9999');

      expect(formatter.clean('12345-123456789')).toBe('123451234');
    });
  });

  describe('formatter', function () {

    it('doesnt work with no given pattern', function () {
      expect(function () {
        new InputFormatter()
      }).toThrow('Formatter.construct(): A pattern must be given!');
    });

    it('works with no splitters', function () {
      formatter = new InputFormatter('999');

      expect(formatter.make('348')).toBe('348');
    });

    it('works with the number pattern and multiple splitters', function () {
      formatter = new InputFormatter('99|9|^999-9');

      expect(formatter.make('3481230')).toBe('34|8|^123-0');
    });

    it('works with the alpha pattern and multiple splitters', function () {
      formatter = new InputFormatter('aa|aa|^aaa-a');

      expect(formatter.make('ioncavoi')).toBe('io|nc|^avo-i');
    });

    it('works with the * pattern and multiple splitters', function () {
      formatter = new InputFormatter('**|**|^***-*');

      expect(formatter.make('hf899fe1')).toBe('hf|89|^9fe-1');
    });

    it('works with multiple patterns and multiple splitters', function () {
      formatter = new InputFormatter('*a|9*|^*a9-*');

      expect(formatter.make('cr37yy80')).toBe('cr|37|^yy8-0');
    });

    it('outputs a starting partial valid input', function () {
      formatter = new InputFormatter('*a|9*|^*a9-*');

      expect(formatter.make('ksify38h')).toBe('ks');
    });

    it('works with splitters in the 1st position', function () {
      formatter = new InputFormatter('(999-aaa');

      expect(formatter.make('132sdu')).toBe('(132-sdu');
    });

    it('appends the splitter when in its in last position', function () {
      formatter = new InputFormatter('999-aaa)');

      expect(formatter.make('132sdu')).toBe('132-sdu)');
    });

    it('prepends and appends splitters when in 1st and last positions', function () {
      formatter = new InputFormatter('(999-aaa)');

      expect(formatter.make('132sdu')).toBe('(132-sdu)');
    });

    it('prepends and appends splitters group when in 1st and last positions', function () {
      formatter = new InputFormatter('{[(999-aaa)]}');

      expect(formatter.make('132sdu')).toBe('{[(132-sdu)]}');
    });

    it('doesnt add the next splitter if the input is still shorter than needed', function () {
      formatter = new InputFormatter('{[(999-aaa)]}');

      expect(formatter.make('132')).toBe('{[(132');
    });

    it('limits the output to the pattern raw length', function () {
      formatter = new InputFormatter('99999-9999');

      expect(formatter.make('12345-123456789')).toBe('12345-1234');
    });

    xit('works with numerical splitters', function () {
      formatter = new InputFormatter('+1 (999) 999-9999');

      var output = formatter.make('9');
      output = formatter.make('98');
      output = formatter.make('987');
      output = formatter.make('9876');
      output = formatter.make('98765');
      output = formatter.make('987654');

      expect(formatter.make('+1 (444) 555-7891')).toBe('+1 (123-nnn)');
    });

  });

});
