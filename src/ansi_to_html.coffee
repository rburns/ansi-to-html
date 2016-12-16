# Converts ANSI color sequences to HTML.
#
# The ansi_to_html module is based on code from
# https://github.com/rtomayko/bcat/blob/master/lib/bcat/ansi.rb

entities = require "entities"

STYLES =
	'ef0':	'color:#000'
	'ef1':	'color:#A00'
	'ef2':	'color:#0A0'
	'ef3':	'color:#A50'
	'ef4':	'color:#00A'
	'ef5':	'color:#A0A'
	'ef6':	'color:#0AA'
	'ef7':	'color:#AAA'
	'ef8':	'color:#555'
	'ef9':	'color:#F55'
	'ef10':	'color:#5F5'
	'ef11':	'color:#FF5'
	'ef12':	'color:#55F'
	'ef13':	'color:#F5F'
	'ef14':	'color:#5FF'
	'ef15':	'color:#FFF'
	'eb0':	'background-color:#000'
	'eb1':	'background-color:#A00'
	'eb2':	'background-color:#0A0'
	'eb3':	'background-color:#A50'
	'eb4':	'background-color:#00A'
	'eb5':	'background-color:#A0A'
	'eb6':	'background-color:#0AA'
	'eb7':	'background-color:#AAA'
	'eb8':	'background-color:#555'
	'eb9':	'background-color:#F55'
	'eb10':	'background-color:#5F5'
	'eb11':	'background-color:#FF5'
	'eb12':	'background-color:#55F'
	'eb13':	'background-color:#F5F'
	'eb14':	'background-color:#5FF'
	'eb15':	'background-color:#FFF'

toHexString = (num) ->
	num = num.toString(16)
	while num.length < 2 then num = "0#{num}"
	num

[0..5].forEach (red) ->
	[0..5].forEach (green) ->
		[0..5].forEach (blue) ->
			c = 16 + (red * 36) + (green * 6) + blue
			r = if red   > 0 then red   * 40 + 55 else 0
			g = if green > 0 then green * 40 + 55 else 0
			b = if blue  > 0 then blue  * 40 + 55 else 0
			rgb = (toHexString(n) for n in [r, g, b]).join('')
			STYLES["ef#{c}"] = "color:##{rgb}"
			STYLES["eb#{c}"] = "background-color:##{rgb}"


[0..23].forEach (gray) ->
	c = gray+232
	l = toHexString(gray*10 + 8)
	STYLES["ef#{c}"] = "color:##{l}#{l}#{l}"
	STYLES["eb#{c}"] = "background-color:##{l}#{l}#{l}"

extend = (dest, objs...) ->
	for obj in objs
		dest[k] = v for k, v of obj
	dest

defaults =
	fg: '#FFF'
	bg: '#000'
	newline: false
	escapeXML: false
	stream: false

class Filter
	constructor: (options = {}) ->
		@opts = extend({}, defaults, options)
		@input = []
		@stack = []
		@stickyStack = []

	toHtml: (input) ->
		@input = if typeof input is 'string' then [input] else input
		buf = []
		@stickyStack.forEach (element) =>
			@generateOutput(element.token, element.data, (chunk) -> buf.push chunk)
		@forEach (chunk) -> buf.push chunk
		@input = []
		buf.join('')

	forEach: (callback) ->
		buf = ''

		@input.forEach (chunk) =>
			buf += chunk
			@tokenize buf, (token, data) =>
				@generateOutput(token, data, callback)
				@updateStickyStack(token, data) if @opts.stream

		callback @resetStyles() if @stack.length

	generateOutput: (token, data, callback) ->
		switch token
			when 'text' then callback @pushText(data)
			when 'display' then @handleDisplay(data, callback)
			when 'xterm256' then callback @pushStyle("ef#{data}")

	updateStickyStack: (token, data) ->
		notCategory = (category) -> (e) ->
			(category is null or e.category != category) and category isnt 'all'

		if token isnt 'text'
			@stickyStack = @stickyStack.filter(notCategory(@categoryForCode(data)))
			@stickyStack.push({token: token, data: data, category: @categoryForCode(data)})

	handleDisplay: (code, callback) ->
		code = parseInt code, 10
		if code is -1 then callback '<br/>'
		if code is 0 then callback @resetStyles() if @stack.length
		if code is 1 then callback @pushTag('b')
		if code is 2 then
		if 2 < code < 5 then callback @pushTag('u')
		if 4 < code < 7 then callback @pushTag('blink')
		if code is 7 then
		if code is 8 then callback @pushStyle('display:none')
		if code is 9 then callback @pushTag('strike')
		if code is 24 then callback @closeTag('u')
		if 29 < code < 38 then callback @pushStyle("ef#{code - 30}")
		if code is 39 then callback @pushStyle("color:#{@opts.fg}")
		if 39 < code < 48 then callback @pushStyle("eb#{code - 40}")
		if code is 49 then callback @pushStyle("background-color:#{@opts.bg}")
		if 89 < code < 98 then callback @pushStyle("ef#{8 + (code - 90)}")
		if 99 < code < 108 then callback @pushStyle("eb#{8 + (code - 100)}")

	categoryForCode: (code) ->
		code = parseInt code, 10
		if code is 0 then 'all'
		else if code is 1 then 'bold'
		else if 2 < code < 5 then 'underline'
		else if 4 < code < 7 then 'blink'
		else if code is 8 then 'hide'
		else if code is 9 then 'strike'
		else if 29 < code < 38 or code is 39 or 89 < code < 98
			'foreground-color'
		else if 39 < code < 48 or code is 49 or 99 < code < 108
			'background-color'
		else null

	pushTag: (tag, style = '') ->
		style = STYLES[style] if style.length && style.indexOf(':') == -1
		@stack.push tag
		["<#{tag}", (" style=\"#{style}\"" if style), ">"].join('')

	pushText: (text) ->
		if @opts.escapeXML then entities.encodeXML(text)
		else text

	pushStyle: (style) ->
		@pushTag "span", style

	closeTag: (style) ->
		last = @stack.pop() if @stack.slice(-1)[0] is style
		"</#{style}>" if last?

	resetStyles: () ->
		[stack, @stack] = [@stack, []]
		stack.reverse().map((tag) -> "</#{tag}>").join('')

	tokenize: (text, callback) ->

		ansiMatch = false
		ansiHandler = 3

		remove = (m) -> ''

		removeXterm256 = (m, g1) ->
			callback('xterm256', g1)
			''

		newline = (m) =>
			if @opts.newline then callback 'display', -1
			else callback 'text', m
			''

		ansiMess = (m, g1) ->
			ansiMatch = true
			g1 = '0' if g1.trim().length is 0
			g1 = g1.trimRight(';').split(';')
			callback('display', code) for code in g1
			''

		realText = (m) ->
			callback 'text', m
			''

		tokens = [
			# characters to remove completely
			{pattern: /^\x08+/, sub: remove}
			{pattern: /^\x1b\[[012]?K/, sub: remove}
			{pattern: /^\x1b\[38;5;(\d+)m/, sub: removeXterm256}

			# newlines
			{pattern: /^\n/, sub: newline}

			# ansi escape sequences that mess with the display
			{pattern: /^\x1b\[((?:\d{1,3};?)+|)m/, sub: ansiMess}

			# malformed sequences
			{pattern: /^\x1b\[?[\d;]{0,3}/, sub: remove}

			# real text
			{pattern: /^([^\x1b\x08\n]+)/, sub: realText}
 		]

		process = (handler, i) ->
			# give ansiHandler another chance if it matches
			if i > ansiHandler and ansiMatch then return else ansiMatch = false
			matches = text.match(handler.pattern)
			text = text.replace(handler.pattern, handler.sub)
			return if !matches?

		while (length = text.length) > 0
			process(handler, i) for handler, i in tokens
			break if text.length == length

module.exports = Filter
