## Ansi to Html

This is a port of the ansi to html converter from [bcat](https://github.com/rtomayko/bcat/blob/master/lib/bcat/ansi.rb) to Javascript.

It has a few additions:

* The API has been altered to accept options in the constructor, and input in <code>toHtml()</code>.
* ANSI codes for setting the foreground or background color to default are handled. Default foreground and background colors can be set with the <code>fg</code> and <code>bg</code> options.
* Newlines are converted to <code>&lt;br/&gt;</code> if the <code>newline</code> option is <code>true</code>
* HTML/XML entitites are generated if the <code>escapeXML</code> option is <code>true</true>
* the 'erase in line' escape code (\x1b[K) is dropped from the output.

## Installation

	npm install ansi-to-html

## Usage

	var Convert = require('ansi-to-html');

	var convert = new Convert();

	/*
		Or with options in the constructor
		var convert = new Convert({newLine: true, fg: 'white', bg: 'black'});
	*/

	console.log(convert.toHtml('\x1b[30mblack\x1b[37mwhite'));

	/*
		prints:
		<span style="color:#000">black<span style="color:#AAA">white</span></span>
	*/

## Development

Once you have the git repository cloned, install the dependencies:

	cd ansi-to-html
	npm install

If you don't have it already, install the grunt command-line tool:

	npm install -g grunt-cli

Build and test

	grunt

All the time

	grunt watch

Or separately

	grunt coffee
	grunt simplemocha  # or npm test
