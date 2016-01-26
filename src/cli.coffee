
args = require('karg') """

ansi-to-html
    file       . ? the file to display or stdin . *    
    
    fg         . ? The background color used for resets . = #000
    bg         . ? The foreground color used for resets . = #FFF
    newline    . ? Convert newline characters to <br/>  . = false
    escapeXML  . ? Generate XML entities                . = false . - x
    
version   #{require("#{__dirname}/../package.json").version}"""

file = args.file
delete args.file
args.stream = true

convert = new (require '../')(args)

htmlStream = (stream) ->
    stream.on 'data', (chunk) ->
        process.stdout.write convert.toHtml chunk
if file
    stream = require('fs').createReadStream file, encoding: 'utf8'
    htmlStream stream
else
    process.stdin.setEncoding 'utf8'
    htmlStream process.stdin
