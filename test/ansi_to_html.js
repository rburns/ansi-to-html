/* globals describe, it*/

const Filter = require('../src/ansi_to_html.js'),
  expect = require('chai').expect;

function test(text, result, done, opts) {
  if (!opts) {
    opts = {};
  }

  let f = new Filter(opts);

  function filtered(memo, t) {
    return memo += f.toHtml(t);
  }

  text = typeof text.reduce === 'function' ? text : [text];
  expect(text.reduce(filtered, '')).to.equal(result);

  return done();
}

describe('ansi to html', function () {
  describe('constructed with no options', function () {
    it('doesn\'t modify the input string', function (done) {
      const text = 'some text',
        result = 'some text';

      return test(text, result, done);
    });

    it('returns plain text when given plain text', function (done) {
      const text = 'test\ntest\n',
        result = 'test\ntest\n';

      return test(text, result, done);
    });

    it('renders foreground colors', function (done) {
      const text = 'colors: \x1b[30mblack\x1b[37mwhite',
        result = 'colors: <span style="color:#000">black<span style="color:#AAA">white</span></span>';

      return test(text, result, done);
    });

    it('renders light foreground colors', function (done) {
      const text = 'colors: \x1b[90mblack\x1b[97mwhite',
        result = 'colors: <span style="color:#555">black<span style="color:#FFF">white</span></span>';

      return test(text, result, done);
    });

    it('renders background colors', function (done) {
      const text = 'colors: \x1b[40mblack\x1b[47mwhite',
        result = 'colors: <span style="background-color:#000">black<span style="background-color:#AAA">white</span></span>';

      return test(text, result, done);
    });

    it('renders light background colors', function (done) {
      const text = 'colors: \x1b[100mblack\x1b[107mwhite',
        result = 'colors: <span style="background-color:#555">black<span style="background-color:#FFF">white</span></span>';

      return test(text, result, done);
    });

    it('renders strikethrough', function (done) {
      const text = 'strike: \x1b[9mthat',
        result = 'strike: <strike>that</strike>';

      return test(text, result, done);
    });

    it('renders blink', function (done) {
      const text = 'blink: \x1b[5mwhat',
        result = 'blink: <blink>what</blink>';

      return test(text, result, done);
    });

    it('renders underline', function (done) {
      const text = 'underline: \x1b[4mstuff',
        result = 'underline: <u>stuff</u>';

      return test(text, result, done);
    });

    it('renders bold', function (done) {
      const text = 'bold: \x1b[1mstuff',
        result = 'bold: <b>stuff</b>';

      return test(text, result, done);
    });

    it('renders italic', function (done) {
      const text = 'italic: \x1b[3mstuff',
        result = 'italic: <i>stuff</i>';

      return test(text, result, done);
    });

    it('handles resets', function (done) {
      const text = '\x1b[1mthis is bold\x1b[0m, but this isn\'t',
        result = '<b>this is bold</b>, but this isn\'t';

      return test(text, result, done);
    });

    it('handles multiple resets', function (done) {
      const text = 'normal, \x1b[1mbold, \x1b[4munderline, \x1b[31mred\x1b[0m, normal',
        result = 'normal, <b>bold, <u>underline, <span style="color:' + '#A00">red</span></u></b>, normal';

      return test(text, result, done);
    });

    it('handles resets with implicit 0', function (done) {
      const text = '\x1b[1mthis is bold\x1b[m, but this isn\'t',
        result = '<b>this is bold</b>, but this isn\'t';

      return test(text, result, done);
    });

    it('renders multi-attribute sequences', function (done) {
      const text = 'normal, \x1b[1;4;31mbold, underline, and red\x1b[0m, normal',
        result = 'normal, <b><u><span style="color:#A00">bold, underline,' + ' and red</span></u></b>, normal';

      return test(text, result, done);
    });

    it('renders multi-attribute sequences with a semi-colon', function (done) {
      const text = 'normal, \x1b[1;4;31;mbold, underline, and red\x1b[0m, normal',
        result = 'normal, <b><u><span style="color:#A00">bold, underline, and red</span></u></b>, normal';

      return test(text, result, done);
    });

    it('eats malformed sequences', function (done) {
      const text = '\x1b[25oops forgot the \'m\'',
        result = 'oops forgot the \'m\'';

      return test(text, result, done);
    });

    it('renders xterm 256 sequences', function (done) {
      const text = '\x1b[38;5;196mhello',
        result = '<span style="color:#ff0000">hello</span>';

      return test(text, result, done);
    });

    it('handles resetting to default foreground color', function (done) {
      const text = '\x1b[30mblack\x1b[39mdefault',
        result = '<span style="color:#000">black<span style="color:#FFF">default</span></span>';

      return test(text, result, done);
    });

    it('handles resetting to default background color', function (done) {
      const text = '\x1b[100mblack\x1b[49mdefault',
        result = '<span style="background-color:#555">black<span style="background-color:#000">default</span></span>';

      return test(text, result, done);
    });

    it('is able to disable underline', function (done) {
      const text = 'underline: \x1b[4mstuff\x1b[24mthings',
        result = 'underline: <u>stuff</u>things';

      return test(text, result, done);
    });

    it('is able to skip disabling underline', function (done) {
      const text = 'not underline: stuff\x1b[24mthings',
        result = 'not underline: stuffthings';
      return test(text, result, done);
    });

    it('renders two escape sequences in sequence', function (done) {
      const text = 'months remaining\x1b[1;31mtimes\x1b[m\x1b[1;32mmultiplied by\x1b[m $10',
        result = 'months remaining<b><span style="color:#A00">times</span></b><b><span style="color:#0A0">multiplied by</span></b> $10';

      return test(text, result, done);
    });

    it('drops EL code with no parameter', function (done) {
      const text = '\x1b[Khello',
        result = 'hello';

      return test(text, result, done);
    });

    it('drops EL code with 0 parameter', function (done) {
      const text = '\x1b[0Khello',
        result = 'hello';

      return test(text, result, done);
    });

    it('drops EL code with 1 parameter', function (done) {
      const text = '\x1b[1Khello',
        result = 'hello';

      return test(text, result, done);
    });

    it('drops EL code with 2 parameter', function (done) {
      const text = '\x1b[2Khello',
        result = 'hello';

      return test(text, result, done);
    });

    it('renders un-bold code appropriately', function (done) {
      const text = '\x1b[1mHello\x1b[22m World',
        result = '<b>Hello</b> World';

      return test(text, result, done);
    });

    it('skips rendering un-bold code appropriately', function (done) {
      const text = 'Hello\x1b[22m World',
        result = 'Hello World';

      return test(text, result, done);
    });

    it('renders un-italic code appropriately', function (done) {
      const text = '\x1b[3mHello\x1b[23m World',
        result = '<i>Hello</i> World';

      return test(text, result, done);
    });

    it('skips rendering un-italic code appropriately', function (done) {
      const text = 'Hello\x1b[23m World',
        result = 'Hello World';

      return test(text, result, done);
    });
  });

  describe('with escapeXML option enabled', function () {
    it('escapes XML entities', function (done) {
      const text = 'normal, \x1b[1;4;31;mbold, <underline>, and red\x1b[0m, normal',
        result = 'normal, <b><u><span style="color:#A00">bold, &lt;underline&gt;, and red</span></u></b>, normal';

      return test(text, result, done, {escapeXML: true});
    });
  });

  describe('with newline option enabled', function () {
    it('renders line breaks', function (done) {
      const text = 'test\ntest\n',
        result = 'test<br/>test<br/>';

      return test(text, result, done, {newline: true});
    });

    it('renders multiple line breaks', function (done) {
      const text = 'test\n\ntest\n',
        result = 'test<br/><br/>test<br/>';

      return test(text, result, done, {newline: true});
    });
  });

  describe('with stream option enabled', function () {
    it('persists styles between toHtml() invocations', function (done) {
      const text = ['\x1b[31mred', 'also red'],
        result = '<span style="color:#A00">red</span><span style="color:#A00">also red</span>';

      return test(text, result, done, {stream: true});
    });

    it('persists styles between more than two toHtml() invocations', function (done) {
      const text = ['\x1b[31mred', 'also red', 'and red'],
        result = '<span style="color:#A00">red</span><span style="color:#A00">also red</span><span style="color:#A00">and red</span>';

      return test(text, result, done, {stream: true});
    });

    it('does not persist styles beyond their usefulness', function (done) {
      const text = ['\x1b[31mred', 'also red', '\x1b[30mblack', 'and black'],
        result = '<span style="color:#A00">red</span><span style="color:#A00">also red</span><span style="color:#A00"><span style="color:#000">black</span></span><span style="color:#000">and black</span>';

      return test(text, result, done, {stream: true});
    });

    it('removes one state when encountering a reset', function (done) {
      const text = ['\x1b[1mthis is bold\x1b[0m, but this isn\'t', ' nor is this'],
        result = '<b>this is bold</b>, but this isn\'t nor is this';

      return test(text, result, done, {stream: true});
    });

    it('removes multiple state when encountering a reset', function (done) {
      const text = ['\x1b[1mthis \x1b[9mis bold\x1b[0m, but this isn\'t', ' nor is this'],
        result = '<b>this <strike>is bold</strike></b>, but this isn\'t nor is this';

      return test(text, result, done, {stream: true});
    });
  });

  describe('with custom colors enabled', function () {
    it('renders basic colors', function (done) {
      const text = ['\x1b[31mblue', 'not blue'],
        result = '<span style="color:#00A">blue</span>not blue';

      return test(text, result, done, {colors: {1: '#00A'}});
    });

    it('renders basic colors with streaming', function (done) {
      const text = ['\x1b[31mblue', 'also blue'],
        result = '<span style="color:#00A">blue</span><span style="color:#00A">also blue</span>';

      return test(text, result, done, {stream: true, colors: {1: '#00A'}});
    });
  });
});
