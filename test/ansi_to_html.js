'use strict';
const {expect} = require('chai');
const Filter = require('../lib/ansi_to_html.js');

function test(text, result, done, opts) {
    if (!opts) {
        opts = {};
    }

    const f = new Filter(opts);

    function filtered(memo, t) {
        return memo + f.toHtml(t);
    }

    text = typeof text.reduce === 'function' ? text : [text];
    expect(text.reduce(filtered, '')).to.equal(result);

    return done();
}

describe('ansi to html', function () {
    describe('constructed with no options', function () {
        it('doesn\'t modify the input string', function (done) {
            const text = 'some text';
            const result = 'some text';

            return test(text, result, done);
        });

        it('returns plain text when given plain text with LF', function (done) {
            const text = 'test\ntest\n';
            const result = 'test\ntest\n';

            return test(text, result, done);
        });

        it('returns plain text when given plain text with multiple LF', function (done) {
            const text = 'test\n\n\ntest\n';
            const result = 'test\n\n\ntest\n';

            return test(text, result, done);
        });

        it('returns plain text when given plain text with CR', function (done) {
            const text = 'testCRLF\rtest';
            const result = 'testCRLF\rtest';

            return test(text, result, done);
        });

        it('returns plain text when given plain text with multiple CR', function (done) {
            const text = 'testCRLF\r\r\rtest';
            const result = 'testCRLF\r\r\rtest';

            return test(text, result, done);
        });

        it('returns plain text when given plain text with CR & LF', function (done) {
            const text = 'testCRLF\r\ntest';
            const result = 'testCRLF\r\ntest';

            return test(text, result, done);
        });

        it('returns plain text when given plain text with multiple CR & LF', function (done) {
            const text = 'testCRLF\r\n\r\ntest';
            const result = 'testCRLF\r\n\r\ntest';

            return test(text, result, done);
        });

        it('renders foreground colors', function (done) {
            const text = 'colors: \x1b[30mblack\x1b[37mwhite';
            const result = 'colors: <span style="color:#000">black<span style="color:#AAA">white</span></span>';

            return test(text, result, done);
        });

        it('renders light foreground colors', function (done) {
            const text = 'colors: \x1b[90mblack\x1b[97mwhite';
            const result = 'colors: <span style="color:#555">black<span style="color:#FFF">white</span></span>';

            return test(text, result, done);
        });

        it('renders background colors', function (done) {
            const text = 'colors: \x1b[40mblack\x1b[47mwhite';
            const result = 'colors: <span style="background-color:#000">black<span style="background-color:#AAA">white</span></span>';

            return test(text, result, done);
        });

        it('renders light background colors', function (done) {
            const text = 'colors: \x1b[100mblack\x1b[107mwhite';
            const result = 'colors: <span style="background-color:#555">black<span style="background-color:#FFF">white</span></span>';

            return test(text, result, done);
        });

        it('renders strikethrough on', function (done) {
            const text = 'strike: \x1b[9mthat';
            const result = 'strike: <span style="text-decoration:line-through;">that</span>';

            return test(text, result, done);
        });

        it('renders strikethrough off', function (done) {
            const text = 'strike: \x1b[9mthat\x1b[29m, no';
            const result = 'strike: <span style="text-decoration:line-through;">that<span style="text-decoration:none;">, no</span></span>';

            return test(text, result, done);
        });

        it('renders slow blink', function (done) {
            const text = 'blink: \x1b[5mwhat';
            const result = 'blink: <span style="animation:blink 1s linear infinite;">what</span>';

            return test(text, result, done);
        });

        it('renders rapid blink', function (done) {
            const text = 'blink: \x1b[6mwhat';
            const result = 'blink: <span style="animation:blink 0.3s linear infinite;">what</span>';

            return test(text, result, done);
        });

        it('renders underline', function (done) {
            const text = 'underline: \x1b[4mstuff';
            const result = 'underline: <span style="text-decoration:underline;">stuff</span>';

            return test(text, result, done);
        });

        it('renders bold', function (done) {
            const text = 'bold: \x1b[1mstuff';
            const result = 'bold: <span style="font-weight:bold;">stuff</span>';

            return test(text, result, done);
        });

        it('renders lighter', function (done) {
            const text = 'lighter: \x1b[2mstuff';
            const result = 'lighter: <span style="font-weight:lighter;">stuff</span>';

            return test(text, result, done);
        });

        it('renders italic', function (done) {
            const text = 'italic: \x1b[3mstuff';
            const result = 'italic: <span style="font-style:italic;">stuff</span>';

            return test(text, result, done);
        });

        it('renders conceal', function (done) {
            const text = 'conceal: \x1b[8mstuff';
            const result = 'conceal: <span style="display:none;">stuff</span>';

            return test(text, result, done);
        });

        it('renders initial', function (done) {
            const text = 'initial: \x1b[10mstuff';
            const result = 'initial: <span style="font-family:initial;">stuff</span>';

            return test(text, result, done);
        });

        it('renders double-underline', function (done) {
            const text = 'double-underline: \x1b[21mstuff';
            const result = 'double-underline: <span style="text-decoration:underline double;">stuff</span>';

            return test(text, result, done);
        });

        it('renders bold-off', function (done) {
            const text = 'bold-off: \x1b[21mstuff';
            const result = 'bold-off: <span style="font-weight:normal;">stuff</span>';

            return test(text, result, done, {21: 'bold-off'});
        });

        it('renders blink-off', function (done) {
            const text = 'blink-off: \x1b[25mstuff';
            const result = 'blink-off: <span style="animation:none;">stuff</span>';

            return test(text, result, done);
        });

        it('renders reveal', function (done) {
            const text = 'reveal: \x1b[28mstuff';
            const result = 'reveal: <span style="display:inline;">stuff</span>';

            return test(text, result, done);
        });


        it('handles resets', function (done) {
            const text = '\x1b[1mthis is bold\x1b[0m, but this isn\'t';
            const result = '<span style="font-weight:bold;">this is bold</span>, but this isn\'t';

            return test(text, result, done);
        });

        it('handles multiple resets', function (done) {
            const text = 'normal, \x1b[1mbold, \x1b[4munderline, \x1b[31mred\x1b[0m, normal';
            const result = 'normal, <span style="font-weight:bold;">bold, <span style="text-decoration:underline;">underline, <span style="color:' + '#A00">red</span></span></span>, normal';

            return test(text, result, done);
        });

        it('handles resets with implicit 0', function (done) {
            const text = '\x1b[1mthis is bold\x1b[m, but this isn\'t';
            const result = '<span style="font-weight:bold;">this is bold</span>, but this isn\'t';

            return test(text, result, done);
        });

        it('renders multi-attribute sequences', function (done) {
            const text = 'normal, \x1b[1;4;31mbold, underline, and red\x1b[0m, normal';
            const result = 'normal, <span style="font-weight:bold;"><span style="text-decoration:underline;"><span style="color:#A00">bold, underline,' + ' and red</span></span></span>, normal';

            return test(text, result, done);
        });

        it('renders multi-attribute sequences with a semi-colon', function (done) {
            const text = 'normal, \x1b[1;4;31;mbold, underline, and red\x1b[0m, normal';
            const result = 'normal, <span style="font-weight:bold;"><span style="text-decoration:underline;"><span style="color:#A00">bold, underline, and red</span></span></span>, normal';

            return test(text, result, done);
        });

        it('eats malformed sequences', function (done) {
            const text = '\x1b[25oops forgot the \'m\'';
            const result = 'oops forgot the \'m\'';

            return test(text, result, done);
        });

        it('renders xterm 256 foreground sequences', function (done) {
            const text = '\x1b[38;5;196mhello';
            const result = '<span style="color:#ff0000">hello</span>';

            return test(text, result, done);
        });

        it('renders xterm 256 background sequences', function (done) {
            const text = '\x1b[48;5;196mhello';
            const result = '<span style="background-color:#ff0000">hello</span>';

            return test(text, result, done);
        });

        it('renders foreground rgb sequences', function (done) {
            const text = '\x1b[38;2;210;60;114mhello';
            const result = '<span style="color:#d23c72">hello</span>';

            return test(text, result, done);
        });

        it('renders background rgb sequences', function (done) {
            const text = '\x1b[48;2;155;42;45mhello';
            const result = '<span style="background-color:#9b2a2d">hello</span>';

            return test(text, result, done);
        });

        it('handles resetting to default foreground color', function (done) {
            const text = '\x1b[30mblack\x1b[39mdefault';
            const result = '<span style="color:#000">black<span style="color:#FFF">default</span></span>';

            return test(text, result, done);
        });

        it('handles resetting to default background color', function (done) {
            const text = '\x1b[100mblack\x1b[49mdefault';
            const result = '<span style="background-color:#555">black<span style="background-color:#000">default</span></span>';

            return test(text, result, done);
        });

        it('is able to disable underline', function (done) {
            const text = 'underline: \x1b[4mstuff\x1b[24mthings';
            const result = 'underline: <span style="text-decoration:underline;">stuff<span style="text-decoration:none;">things</span></span>';

            return test(text, result, done);
        });

        it('disables underline', function (done) {
            const text = 'not underline: stuff\x1b[24mthings';
            const result = 'not underline: stuff<span style="text-decoration:none;">things</span>';

            return test(text, result, done);
        });

        it('renders two escape sequences in sequence', function (done) {
            const text = 'months remaining\x1b[1;31mtimes\x1b[m\x1b[1;32mmultiplied by\x1b[m $10';
            const result = 'months remaining<span style="font-weight:bold;"><span style="color:#A00">times</span></span><span style="font-weight:bold;"><span style="color:#0A0">multiplied by</span></span> $10';

            return test(text, result, done);
        });

        it('drops EL code with no parameter', function (done) {
            const text = '\x1b[Khello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops EL code with 0 parameter', function (done) {
            const text = '\x1b[0Khello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops EL code with 0 parameter after new line character', function (done) {
            const text = 'HELLO\n\x1b[0K\u001b[33;1mWORLD\u001b[0m\n';
            const result = 'HELLO\n<span style="color:#A50"><span style="font-weight:bold;">WORLD</span></span>\n';

            return test(text, result, done);
        });

        it('drops EL code with 1 parameter', function (done) {
            const text = '\x1b[1Khello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops EL code with 2 parameter', function (done) {
            const text = '\x1b[2Khello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops ED code with 0 parameter', function (done) {
            const text = '\x1b[Jhello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops ED code with 1 parameter', function (done) {
            const text = '\x1b[1Jhello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops HVP code with 0 parameter', function (done) {
            const text = '\x1b[;fhello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops HVP code with 1 parameter', function (done) {
            const text = '\x1b[123;fhello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops HVP code with 2 parameter', function (done) {
            const text = '\x1b[123;456fhello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops setusg0 sequence', function (done) {
            const text = '\x1b[(Bhello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('renders un-italic code appropriately', function (done) {
            const text = '\x1b[3mHello\x1b[23m World';
            const result = '<span style="font-style:italic;">Hello<span style="font-style:normal;"> World</span></span>';

            return test(text, result, done);
        });

        it('rendering un-italic code appropriately', function (done) {
            const text = 'Hello\x1b[23m World';
            const result = 'Hello<span style="font-style:normal;"> World</span>';

            return test(text, result, done);
        });

        it('renders overline on', function (done) {
            const text = '\x1b[53mHello World';
            const result = '<span style="text-decoration:overline;">Hello World</span>';

            return test(text, result, done);
        });

        it('renders overline off', function (done) {
            const text = '\x1b[53mHello \x1b[55mWorld';
            const result = '<span style="text-decoration:overline;">Hello <span style="text-decoration:none;">World</span></span>';

            return test(text, result, done);
        });

        it('renders normal text', function (done) {
            const text = '\x1b[22mnormal text';
            const result = '<span style="font-weight:normal;text-decoration:none;font-style:normal;">normal text</span>';

            return test(text, result, done);
        });

        it('renders text following carriage return (CR, mac style line break)', function (done) {
            const text = 'ANSI Hello\rWorld';
            const result = 'ANSI Hello\rWorld';

            return test(text, result, done);
        });
    });

    describe('with escapeXML option enabled', function () {
        it('escapes XML entities', function (done) {
            const text = 'normal, \x1b[1;4;31;mbold, <underline>, and red\x1b[0m, normal';
            const result = 'normal, <span style="font-weight:bold;"><span style="text-decoration:underline;"><span style="color:#A00">bold, &lt;underline&gt;, and red</span></span></span>, normal';

            return test(text, result, done, {escapeXML: true});
        });
    });

    describe('with newline option enabled', function () {
        it('renders line breaks', function (done) {
            const text = 'test\ntest\n';
            const result = 'test<br/>test<br/>';

            return test(text, result, done, {newline: true});
        });

        it('renders multiple line breaks', function (done) {
            const text = 'test\n\ntest\n';
            const result = 'test<br/><br/>test<br/>';

            return test(text, result, done, {newline: true});
        });

        it('renders mac styled line breaks (CR)', function (done) {
            const text = 'test\rtest\r';
            const result = 'test<br/>test<br/>';

            return test(text, result, done, {newline: true});
        });

        it('renders multiple mac styled line breaks (CR)', function (done) {
            const text = 'test\r\rtest\r';
            const result = 'test<br/><br/>test<br/>';

            return test(text, result, done, {newline: true});
        });

        it('renders windows styled line breaks (CR+LF)', function (done) {
            const text = 'testCRLF\r\ntestLF';
            const result = 'testCRLF<br/>testLF';

            return test(text, result, done, {newline: true});
        });

        it('renders windows styled line breaks (multi CR+LF)', function (done) {
            const text = 'testCRLF\r\n\r\ntestLF';
            const result = 'testCRLF<br/><br/>testLF';

            return test(text, result, done, {newline: true});
        });

    });

    describe('with `space` option enabled', function () {
        it('renders multiple spaces', function (done) {
            const text = 'test  test  ';
            const result = 'test &#xa0;test &#xa0;';

            return test(text, result, done, {space: true});
        });
    });

    describe('with `tabs` option enabled', function () {
        it('renders multiple tabs', function (done) {
            const text = 'test\ttest\t';
            const result = 'test&#xa0;&#xa0;&#xa0;test&#xa0;&#xa0;&#xa0;';

            return test(text, result, done, {tabs: 3});
        });
    });

    describe('with stream option enabled', function () {
        it('persists styles between toHtml() invocations', function (done) {
            const text = ['\x1b[31mred', 'also red'];
            const result = '<span style="color:#A00">red</span><span style="color:#A00">also red</span>';

            return test(text, result, done, {stream: true});
        });

        it('persists styles between more than two toHtml() invocations', function (done) {
            const text = ['\x1b[31mred', 'also red', 'and red'];
            const result = '<span style="color:#A00">red</span><span style="color:#A00">also red</span><span style="color:#A00">and red</span>';

            return test(text, result, done, {stream: true});
        });

        it('does not persist styles beyond their usefulness', function (done) {
            const text = ['\x1b[31mred', 'also red', '\x1b[30mblack', 'and black'];
            const result = '<span style="color:#A00">red</span><span style="color:#A00">also red</span><span style="color:#A00"><span style="color:#000">black</span></span><span style="color:#000">and black</span>';

            return test(text, result, done, {stream: true});
        });

        it('removes one state when encountering a reset', function (done) {
            const text = ['\x1b[1mthis is bold\x1b[0m, but this isn\'t', ' nor is this'];
            const result = '<span style="font-weight:bold;">this is bold</span>, but this isn\'t nor is this';

            return test(text, result, done, {stream: true});
        });

        it('removes multiple state when encountering a reset', function (done) {
            const text = ['\x1b[1mthis \x1b[9mis bold\x1b[0m, but this isn\'t', ' nor is this'];
            const result = '<span style="font-weight:bold;">this <span style="text-decoration:line-through;">is bold</span></span>, but this isn\'t nor is this';

            return test(text, result, done, {stream: true});
        });
    });

    describe('with custom colors enabled', function () {
        it('renders basic colors', function (done) {
            const text = ['\x1b[31mblue', 'not blue'];
            const result = '<span style="color:#00A">blue</span>not blue';

            return test(text, result, done, {colors: {1: '#00A'}});
        });

        it('renders basic colors with streaming', function (done) {
            const text = ['\x1b[31mblue', 'also blue'];
            const result = '<span style="color:#00A">blue</span><span style="color:#00A">also blue</span>';

            return test(text, result, done, {stream: true, colors: {1: '#00A'}});
        });

        it('renders custom colors and default colors', function (done) {
            const text = ['\x1b[31mblue', 'not blue', '\x1b[94mlight blue', 'not colored'];
            const result = '<span style="color:#00A">blue</span>not blue<span style="color:#55F">light blue</span>not colored';

            return test(text, result, done, {colors: {1: '#00A'}});
        });

        it('renders custom colors and default colors together', function (done) {
            const text = ['\x1b[31mblue', 'not blue', '\x1b[94mlight blue', 'not colored'];
            const result = '<span style="color:#00A">blue</span>not blue<span style="color:#55F">light blue</span>not colored';

            return test(text, result, done, {colors: {1: '#00A'}});
        });

        it('renders custom 8/ 16 colors', function (done) {
            // code - 90 + 8 = color
            // so 94 - 90 + 8 = 12
            const text = ['\x1b[94mlighter blue'];
            const result = '<span style="color:#33F">lighter blue</span>';

            return test(text, result, done, {colors: {12: '#33F'}});
        });

        it('renders custom 256 colors', function (done) {
            // code - 90 + 8 = color
            // so 94 - 90 + 8 = 12
            const text = ['\x1b[38;5;125mdark red', 'then \x1b[38;5;126msome other color'];
            const result = '<span style="color:#af005f">dark red</span>then <span style="color:#af225f">some other color</span>';

            return test(text, result, done, {colors: {126: '#af225f'}});
        });
    });
});
