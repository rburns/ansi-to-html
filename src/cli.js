'use strict';
/* eslint no-console:0 */
const help = `
usage: ansi-to-html [options] [file]

file:  The file to display or stdin

options:

    -f, --fg         The background color used for resets (#000)
    -b, --bg         The foreground color used for resets (#FFF)
    -n, --newline    Convert newline characters to <br/>  (false)
    -x, --escapeXML  Generate XML entities                (false)
    -v, --version    Print version
    -h, --help       Print help
`;

const args = {
    stream: true
};
let file = null,
    skip = false;

const argv = process.argv.slice(2);
for (
    let i = 0, len = argv.length;
    i < len;
    ++i
) {
    if (skip) {
        skip = false;
        continue;
    }
    switch (argv[i]) {
        case '-n':
        case '--newline':
            args.newline = true;
            break;
        case '-x':
        case '--escapeXML':
            args.escapeXML = true;
            break;
        case '-f':
        case '--fg':
            args.fg = argv[i + 1];
            skip = true;
            break;
        case '-b':
        case '--bg':
            args.bg = argv[i + 1];
            skip = true;
            break;
        case '-v':
        case '--version':
            console.log(require(__dirname + '/../package.json').version);
            process.exit(0);
            // istanbul ignore next
            break;
        case '-h':
        case '--help':
            console.log(help);
            process.exit(0);
            // istanbul ignore next
            break;
        default:
            file = argv[i];
    }
}

const convert = new (require('./ansi_to_html.js'))(args);

const htmlStream = function (stream) {
    return stream.on('data', function (chunk) {
        return process.stdout.write(convert.toHtml(chunk));
    });
};

if (file) {
    const stream = require('fs').createReadStream(file, {encoding: 'utf8'});
    htmlStream(stream);
} else {
    process.stdin.setEncoding('utf8');
    htmlStream(process.stdin);
}
