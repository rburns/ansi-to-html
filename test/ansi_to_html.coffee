Filter = require '../lib/ansi_to_html.js'
expect = require('chai').expect

test = (text, result, done) ->
	f = new Filter()
	expect(f.toHtml(text)).to.equal(result)
	done()

describe 'ansi to html', () ->

	it "doesn't modify the input string", (done) ->
		text = 'some text'
		new Filter().toHtml(text)
		expect(text).to.equal('some text')
		done()

	it 'returns plain text when given plain text', (done) ->
		text = 'test\ntest\n'
		result = 'test\ntest\n'
		test(text, result, done)

	it 'renders foreground colors', (done) ->
		text = "colors: \x1b[30mblack\x1b[37mwhite"
		result = 'colors: <span style="color:#000">black<span style="color:#AAA">white</span></span>'
		test(text, result, done)

	it 'renders light foreground colors', (done) ->
		text = 'colors: \x1b[90mblack\x1b[97mwhite'
		result = 'colors: <span style="color:#555">black<span style="color:#FFF">white</span></span>'
		test(text, result, done)

	it 'renders background colors', (done) ->
		text = 'colors: \x1b[40mblack\x1b[47mwhite'
		result = 'colors: <span style="background-color:#000">black<span style="background-color:#AAA">white</span></span>'
		test(text, result, done)

	it 'renders light background colors', (done) ->
		text = 'colors: \x1b[100mblack\x1b[107mwhite'
		result = 'colors: <span style="background-color:#555">black<span style="background-color:#FFF">white</span></span>'
		test(text, result, done)

	it 'renders strikethrough', (done) ->
		text = 'strike: \x1b[9mthat'
		result = 'strike: <strike>that</strike>'
		test(text, result, done)

	it 'renders blink', (done) ->
		text = 'blink: \x1b[5mwhat'
		result = 'blink: <blink>what</blink>'
		test(text, result, done)

	it 'renders underline', (done) ->
		text = 'underline: \x1b[3mstuff'
		result = 'underline: <u>stuff</u>'
		test(text, result, done)

	it 'renders bold', (done) ->
		text = 'bold: \x1b[1mstuff'
		result = 'bold: <b>stuff</b>'
		test(text, result, done)

	it 'handles ressets', (done) ->
		text = '\x1b[1mthis is bold\x1b[0m, but this isn\'t'
		result = '<b>this is bold</b>, but this isn\'t'
		test(text, result, done)

	it 'handles multiple resets', (done) ->
		text = 'normal, \x1b[1mbold, \x1b[3munderline, \x1b[31mred\x1b[0m, normal'
		result = 'normal, <b>bold, <u>underline, <span style="color:#A00">red</span></u></b>, normal'
		test(text, result, done)

	it 'handles resets with implicit 0', (done) ->
		text = '\x1b[1mthis is bold\x1b[m, but this isn\'t'
		result = '<b>this is bold</b>, but this isn\'t'
		test(text, result, done)

	it 'renders multi-attribute sequences', (done) ->
		text = 'normal, \x1b[1;3;31mbold, underline, and red\x1b[0m, normal'
		result = 'normal, <b><u><span style="color:#A00">bold, underline, and red</span></u></b>, normal'
		test(text, result, done)

	it 'renders multi-attribute sequences with a semi-colon', (done) ->
		text = 'normal, \x1b[1;3;31;mbold, underline, and red\x1b[0m, normal'
		result = 'normal, <b><u><span style="color:#A00">bold, underline, and red</span></u></b>, normal'
		test(text, result, done)

	it 'eats malformed sequences', (done) ->
		text = '\x1b[25oops forgot the \'m\''
		result = 'oops forgot the \'m\''
		test(text, result, done)

	it 'renders xterm 256 sequences', (done) ->
		text = '\x1b[38;5;196mhello'
		result = '<span style="color:#ff0000">hello</span>'
		test(text, result, done)

	it 'handles resetting to default foreground color', (done) ->
		text = '\x1b[30mblack\x1b[39mdefault'
		result = '<span style="color:#000">black<span style="color:#FFF">default</span></span>'
		test(text, result, done)

	it 'handles resetting to default background color', (done) ->
		text = '\x1b[100mblack\x1b[49mdefault'
		result = '<span style="background-color:#555">black<span style="background-color:#000">default</span></span>'
		test(text, result, done)

	it 'is able to disable underline', (done) ->
		text = 'underline: \x1b[4mstuff\x1b[24mthings'
		result = 'underline: <u>stuff</u>things'
		test(text, result, done)

	it 'renders newlines when the newline option is true', (done) ->
		text = 'test\ntest\n'
		result = 'test<br/>test<br/>'
		f = new Filter(newline: true)
		expect(f.toHtml(text)).to.equal(result)
		done()

	it 'renders two escape sequences in sequence', (done) ->
		text = 'months remaining\x1b[1;31mtimes\x1b[m\x1b[1;32mmultiplied by\x1b[m $10'
		result = 'months remaining<b><span style="color:#A00">times</span></b><b><span style="color:#0A0">multiplied by</span></b> $10'
		f = new Filter()
		expect(f.toHtml(text)).to.equal(result)
		done()

	it 'continues colors between render invocations', (done) ->
		firstText = '\x1b[31mred'
		secondText = 'also red'
		result = '<span style="color:#A00">red</span><span style="color:#A00">also red</span>'
		// If possible this would be better
		//result = '<span style="color:#A00">redalso red</span>'
		f = new Filter()
		expect(f.toHtml(firstText) + f.toHtml(secondText)).to.equal(result)
		done()
