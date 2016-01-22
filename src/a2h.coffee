
args = require('karg') """
ansi-to-html
    file  . ? the file to display or stdin . *    
version   #{require("#{__dirname}/../package.json").version}"""

convert = new (require '../')()
htmlStream = (stream) ->
    stream.on 'data', (chunk) ->
        process.stdout.write convert.toHtml chunk

if args.file
    stream = require('fs').createReadStream args.file, encoding: 'utf8'
    htmlStream stream
else
    process.stdin.setEncoding 'utf8'
    htmlStream process.stdin
