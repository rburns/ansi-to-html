const entities = require('entities'),
  STYLES = {
    'ef0': 'color:#000',
    'ef1': 'color:#A00',
    'ef2': 'color:#0A0',
    'ef3': 'color:#A50',
    'ef4': 'color:#00A',
    'ef5': 'color:#A0A',
    'ef6': 'color:#0AA',
    'ef7': 'color:#AAA',
    'ef8': 'color:#555',
    'ef9': 'color:#F55',
    'ef10': 'color:#5F5',
    'ef11': 'color:#FF5',
    'ef12': 'color:#55F',
    'ef13': 'color:#F5F',
    'ef14': 'color:#5FF',
    'ef15': 'color:#FFF',
    'eb0': 'background-color:#000',
    'eb1': 'background-color:#A00',
    'eb2': 'background-color:#0A0',
    'eb3': 'background-color:#A50',
    'eb4': 'background-color:#00A',
    'eb5': 'background-color:#A0A',
    'eb6': 'background-color:#0AA',
    'eb7': 'background-color:#AAA',
    'eb8': 'background-color:#555',
    'eb9': 'background-color:#F55',
    'eb10': 'background-color:#5F5',
    'eb11': 'background-color:#FF5',
    'eb12': 'background-color:#55F',
    'eb13': 'background-color:#F5F',
    'eb14': 'background-color:#5FF',
    'eb15': 'background-color:#FFF'
  },
  defaults = {
    fg: '#FFF',
    bg: '#000',
    newline: false,
    escapeXML: false,
    stream: false
  };

/**
 * Converts from a number like 15 to a hex string like 'F'
 * @param {number} num
 * @returns {string}
 */
function toHexString(num) {
  num = num.toString(16);
  while (num.length < 2) {
    num = '0' + num;
  }
  return num;
}

/**
 * Converts from an array of numbers like [15, 15, 15] to a hex string like 'FFF'
 * @param {[red, green, blue]} ref
 * @returns {string}
 */
function toColorHexString(ref) {
  let results = [];

  for (let j = 0, len = ref.length; j < len; j++) {
    results.push(toHexString(ref[j]));
  }

  return results.join('');
}

/**
 * Creates an array of numbers ranging from low to high
 * @param {number} low
 * @param {number} high
 * @returns {Array}
 * @example range(3, 7); // creates [3, 4, 5, 6, 7]
 */
function range(low, high) {
  const results = [];

  for (let j = low; j <= high; j++) {
    results.push(j);
  }

  return results;
}

/**
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 */
function setStyleColor(red, green, blue) {
  const c = 16 + (red * 36) + (green * 6) + blue,
    r = red > 0 ? red * 40 + 55 : 0,
    g = green > 0 ? green * 40 + 55 : 0,
    b = blue > 0 ? blue * 40 + 55 : 0,
    rgb = toColorHexString([r, g, b]);

  STYLES['ef' + c] = 'color:#' + rgb;
  STYLES['eb' + c] = 'background-color:#' + rgb;
}

// fill in standard colors
range(0, 5).forEach(red => {
  range(0, 5).forEach(green => {
    range(0, 5).forEach(blue => setStyleColor(red, green, blue));
  });
});

range(0, 23).forEach(function (gray) {
  const c = gray + 232,
    l = toHexString(gray * 10 + 8);

  STYLES['ef' + c] = 'color:#' + l + l + l;
  STYLES['eb' + c] = 'background-color:#' + l + l + l;
});

/**
 * Returns a new function that is true if value is NOT the same category
 * @param {string} category
 * @returns {function}
 */
function notCategory(category) {
  return function (e) {
    return (category === null || e.category !== category) && category !== 'all';
  };
}

/**
 * Converts a code into an ansi token type
 * @param {number} code
 * @returns {string}
 */
function categoryForCode(code) {
  code = parseInt(code, 10);
  if (code === 0) {
    return 'all';
  } else if (code === 1) {
    return 'bold';
  } else if ((2 < code && code < 5)) {
    return 'underline';
  } else if ((4 < code && code < 7)) {
    return 'blink';
  } else if (code === 8) {
    return 'hide';
  } else if (code === 9) {
    return 'strike';
  } else if ((29 < code && code < 38) || code === 39 || (89 < code && code < 98)) {
    return 'foreground-color';
  } else if ((39 < code && code < 48) || code === 49 || (99 < code && code < 108)) {
    return 'background-color';
  } else {
    return null;
  }
}

/**
 * @param {string} text
 * @param {object} options
 * @returns {string}
 */
function pushText(text, options) {
  if (options.escapeXML) {
    return entities.encodeXML(text);
  } else {
    return text;
  }
}

/**
 * @param {Array} stack
 * @param {string} tag
 * @param {string} [style='']
 * @returns {string}
 */
function pushTag(stack, tag, style) {
  if (!style) {
    style = '';
  }

  if (style.length && style.indexOf(':') === -1) {
    style = STYLES[style];
  }

  stack.push(tag);

  return ['<' + tag, (style ? ' style="' + style + '"' : void 0), '>'].join('');
}

/**
 * @param {Array} stack
 * @param {string} style
 * @returns {string}
 */
function pushStyle (stack, style) {
  return pushTag(stack, 'span', style);
}

/**
 * @param {Array} stack
 * @param {string} style
 * @returns {string}
 */
function closeTag(stack, style) {
  let last;

  if (stack.slice(-1)[0] === style) {
    last = stack.pop();
  }

  if (last) {
    return '</' + style + '>';
  }
}

/**
 * @param {string} text
 * @param {object} options
 * @param {function} callback
 * @returns {Array}
 */
function tokenize(text, options, callback) {
  let ansiMatch = false,
    ansiHandler = 3;

  function remove() {
    return '';
  }

  function removeXterm256(m, g1) {
    callback('xterm256', g1);
    return '';
  }

  function newline(m) {
    if (options.newline) {
      callback('display', -1);
    } else {
      callback('text', m);
    }

    return '';
  }

  function ansiMess(m, g1) {
    ansiMatch = true;
    if (g1.trim().length === 0) {
      g1 = '0';
    }

    g1 = g1.trimRight(';').split(';');

    for (let o = 0, len = g1.length; o < len; o++) {
      callback('display', g1[o]);
    }

    return '';
  }

  function realText(m) {
    callback('text', m);

    return '';
  }

  /* eslint no-control-regex:0 */
  const tokens = [
    {
      pattern: /^\x08+/,
      sub: remove
    }, {
      pattern: /^\x1b\[[012]?K/,
      sub: remove
    }, {
      pattern: /^\x1b\[38;5;(\d+)m/,
      sub: removeXterm256
    }, {
      pattern: /^\n/,
      sub: newline
    }, {
      pattern: /^\x1b\[((?:\d{1,3};?)+|)m/,
      sub: ansiMess
    }, {
      pattern: /^\x1b\[?[\d;]{0,3}/,
      sub: remove
    }, {
      pattern: /^([^\x1b\x08\n]+)/,
      sub: realText
    }
  ];

  function process(handler, i) {
    if (i > ansiHandler && ansiMatch) {
      return;
    }

    ansiMatch = false;

    text = text.replace(handler.pattern, handler.sub);
  }

  let handler,
    results1 = [],
    length = text.length;
  while (length > 0) {
    for (let i = 0, o = 0, len = tokens.length; o < len; i = ++o) {
      handler = tokens[i];
      process(handler, i);
    }

    if (text.length === length) {
      break;
    } else {
      results1.push(0);
    }

    length = text.length;
  }

  return results1;
}

/**
 * If streaming, then the stack is "sticky"
 *
 * @param {Array} stickyStack
 * @param {string} token
 * @param {*} data
 * @returns {Array}
 */
function updateStickyStack(stickyStack, token, data) {
  if (token !== 'text') {
    stickyStack = stickyStack.filter(notCategory(categoryForCode(data)));
    stickyStack.push({token: token, data: data, category: categoryForCode(data)});
  }

  return stickyStack;
}

const Filter = (function () {
  function Filter(options) {
    options = options || {};

    this.opts = Object.assign({}, defaults, options);
    this.stack = [];
    this.stickyStack = [];
  }

  Filter.prototype = {
    toHtml (input) {
      input = typeof input === 'string' ? [input] : input;
      const options = this.opts,
        buf = [];

      this.stickyStack.forEach(element => {
        let output = this.generateOutput(element.token, element.data);

        if (output) {
          buf.push(output);
        }
      });

      this.forEach(input, options, function (chunk) {
        return buf.push(chunk);
      });

      return buf.join('');
    },

    forEach (input, options, callback) {
      let buf = '';

      input.forEach(chunk => {
        buf += chunk;

        return tokenize(buf, options, (token, data) => {
          let output = this.generateOutput(token, data);

          if (output) {
            callback(output);
          }

          if (options.stream) {
            this.stickyStack = updateStickyStack(this.stickyStack, token, data);
          }
        });
      });

      if (this.stack.length) {
        return callback(this.resetStyles());
      }
    },

    /**
     * @param token
     * @param data
     */
    generateOutput (token, data) {
      const options = this.opts,
        stack = this.stack;
      let result;

      if (token === 'text') {
        result = pushText(data, options);
      } else if (token === 'display') {
        result = this.handleDisplay(data);
      } else if (token === 'xterm256') {
        result = pushStyle(stack, 'ef' + data);
      }

      return result;
    },

    /**
     *
     * @param {number} code
     * @returns {*}
     */
    handleDisplay (code) {
      code = parseInt(code, 10);
      let result;
      const stack = this.stack,
        codeMap = {
          '-1': () => '<br/>',
          0: () => this.stack.length && this.resetStyles(),
          1: () => pushTag(stack, 'b'),
          3: () => pushTag(stack, 'i'),
          4: () => pushTag(stack, 'u'),
          8: () => pushStyle(stack, 'display:none'),
          9: () => pushTag(stack, 'strike'),
          22: () => closeTag(stack, 'b'),
          23: () => closeTag(stack, 'i'),
          24: () => closeTag(stack, 'u'),
          39: () =>  pushStyle(stack, 'color:' + this.opts.fg),
          49: () => pushStyle(stack, 'background-color:' + this.opts.bg)
        };

      if (codeMap[code]) {
        result = codeMap[code]();
      } else if (4 < code && code < 7) {
        result = pushTag(stack, 'blink');
      } else if (29 < code && code < 38) {
        result = pushStyle(stack, 'ef' + (code - 30));
      } else if ((39 < code && code < 48)) {
        result = pushStyle(stack, 'eb' + (code - 40));
      } else if ((89 < code && code < 98)) {
        result = pushStyle(stack, 'ef' + (8 + (code - 90)));
      } else if ((99 < code && code < 108)) {
        result = pushStyle(stack, 'eb' + (8 + (code - 100)));
      }

      return result;
    },

    /**
     * Clear all the styles
     * @returns {string}
     */
    resetStyles () {
      let ref = [this.stack, []],
        stack = ref[0];

      this.stack = ref[1];

      return stack.reverse().map(function (tag) {
        return '</' + tag + '>';
      }).join('');
    }
  };

  return Filter;
})();

module.exports = Filter;
