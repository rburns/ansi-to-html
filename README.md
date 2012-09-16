## Ansi to Html

This is a port of the ansi to html converter from [bcat](https://github.com/rtomayko/bcat/blob/master/lib/bcat/ansi.rb) to Javascript.

It has a few additions:

* The API has been altered to accept options in the constructor, and input in <code>toHtml()</code>.
* ANSI codes for setting the foreground or background color to default are handled. Default foreground and background colors can be set with the <code>fg</code> and <code>bg</code> options.
* Newlines are converted to <code>&lt;br/&gt;</code> if the <code>newline</code> option is <code>true</code>

## Installation

	npm install ansi-to-html

## Usage

	var Convert = require('ansi-to-html');

	var convert = new Convert()

	console.log(convert.toHtml('\x1b[30mblack\x1b[37mwhite'));

	/*
		prints:
		<span style="color:#000">black<span style="color:#AAA">white</span></span>
	*/
