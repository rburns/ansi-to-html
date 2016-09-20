
help = """

uasge: ansi-to-html [options] [file]
    
file:  The file to display or stdin
    
options:    
    
    -f, --fg         The background color used for resets (#000)
    -b, --bg         The foreground color used for resets (#FFF)
    -n, --newline    Convert newline characters to <br/>  (false)
    -x, --escapeXML  Generate XML entities                (false)
    -v, --version    Print version
    -h, --help       Print help
    
"""

file = null
skip = false
args = stream: true
for i in [2...process.argv.length]
    if skip
        skip = false
        continue
    switch process.argv[i]
        when '-n', '--newline'   then args.newline = true
        when '-x', '--escapeXML' then args.escapeXML = true
        when '-f', '--fg'        
            args.fg = process.argv[i+1]
            skip = true
        when '-b', '--bg'        
            args.bg = process.argv[i+1]
            skip = true
        when '-v', '--version'   
            console.log require("#{__dirname}/../package.json").version
            process.exit 0
        when '-h', '--help'
            console.log help
            process.exit 0
        else 
            file = process.argv[i]
    
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
