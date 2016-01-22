(function() {
  var args, convert, htmlStream, stream;

  args = require('karg')("ansi-to-html\n    file  . ? the file to display or stdin . *    \nversion   " + (require(__dirname + "/../package.json").version));

  convert = new (require('../'))();

  htmlStream = function(stream) {
    return stream.on('data', function(chunk) {
      return process.stdout.write(convert.toHtml(chunk));
    });
  };

  if (args.file) {
    stream = require('fs').createReadStream(args.file, {
      encoding: 'utf8'
    });
    htmlStream(stream);
  } else {
    process.stdin.setEncoding('utf8');
    htmlStream(process.stdin);
  }

}).call(this);
