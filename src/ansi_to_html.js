const entities = require('entities');
const defaults = {
    fg: '#FFF',
    bg: '#000',
    newline: false,
    escapeXML: false,
    stream: false,
    colors: getDefaultColors()
};

function getDefaultColors() {
    const colors = {
        0: '#000',
        1: '#A00',
        2: '#0A0',
        3: '#A50',
        4: '#00A',
        5: '#A0A',
        6: '#0AA',
        7: '#AAA',
        8: '#555',
        9: '#F55',
        10: '#5F5',
        11: '#FF5',
        12: '#55F',
        13: '#F5F',
        14: '#5FF',
        15: '#FFF'
    };

    range(0, 5).forEach(red => {
        range(0, 5).forEach(green => {
            range(0, 5).forEach(blue => setStyleColor(red, green, blue, colors));
        });
    });

    range(0, 23).forEach(function (gray) {
        const c = gray + 232;
        const l = toHexString(gray * 10 + 8);

        colors[c] = '#' + l + l + l;
    });

    return colors;
}

/**
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 * @param {object} colors
 */
function setStyleColor(red, green, blue, colors) {
    const c = 16 + (red * 36) + (green * 6) + blue;
    const r = red > 0 ? red * 40 + 55 : 0;
    const g = green > 0 ? green * 40 + 55 : 0;
    const b = blue > 0 ? blue * 40 + 55 : 0;

    colors[c] = toColorHexString([r, g, b]);
}

/**
 * Converts from a number like 15 to a hex string like 'F'
 * @param {number} num
 * @returns {string}
 */
function toHexString(num) {
    var str = num.toString(16);

    while (str.length < 2) {
        str = '0' + str;
    }

    return str;
}

/**
 * Converts from an array of numbers like [15, 15, 15] to a hex string like 'FFF'
 * @param {[red, green, blue]} ref
 * @returns {string}
 */
function toColorHexString(ref) {
    var results = [];

    for (var j = 0, len = ref.length; j < len; j++) {
        results.push(toHexString(ref[j]));
    }

    return '#' + results.join('');
}

/**
 * @param {Array} stack
 * @param {string} token
 * @param {*} data
 * @param {object} options
 */
function generateOutput(stack, token, data, options) {
    var result;

    if (token === 'text') {
        result = pushText(data, options);
    } else if (token === 'display') {
        result = handleDisplay(stack, data, options);
    } else if (token === 'xterm256') {
        result = pushForegroundColor(stack, options.colors[data]);
    } else if (token === 'rgb') {
        result = handleRgb(stack, data);
    }

    return result;
}

/**
 * @param {Array} stack
 * @param {string} data
 * @returns {*}
 */
function handleRgb(stack, data) {
    data = data.substring(2).slice(0, -1);
    const operation = +data.substr(0,2);

    const color = data.substring(5).split(';');
    const rgb = color.map(function(value) {
        return ('0' + Number(value).toString(16)).substr(-2);
    }).join('');

    return pushStyle(stack, (operation === 38 ? 'color:#' : 'background-color:#') + rgb);
}

/**
 * @param {Array} stack
 * @param {number} code
 * @param {object} options
 * @returns {*}
 */
function handleDisplay(stack, code, options) {
    code = parseInt(code, 10);
    var result;

    const codeMap = {
        '-1': () => '<br/>',
        0: () => stack.length && resetStyles(stack),
        1: () => pushStyle(stack, 'font-weight:bold'),
        3: () => pushStyle(stack, 'font-style:italic'),
        4: () => pushStyle(stack, 'text-decoration:underline'),
        8: () => pushStyle(stack, 'display:none'),
        9: () => pushStyle(stack, 'text-decoration:line-through'),
        22: () => pushStyle(stack, 'font-weight:normal;text-decoration:none;font-style:normal'),
        23: () => pushStyle(stack, 'font-style:normal'),
        24: () => pushStyle(stack, 'text-decoration:none'),
        29: () => pushStyle(stack, 'text-decoration:none'),
        39: () => pushForegroundColor(stack, options.fg),
        49: () => pushBackgroundColor(stack, options.bg),
        53: () => pushStyle(stack, 'text-decoration:overline'),
        55: () => pushStyle(stack, 'text-decoration:none')
    };

    if (codeMap[code]) {
        result = codeMap[code]();
    } else if (4 < code && code < 7) {
        result = pushTag(stack, 'blink');
    } else if (29 < code && code < 38) {
        result = pushForegroundColor(stack, options.colors[code - 30]);
    } else if ((39 < code && code < 48)) {
        result = pushBackgroundColor(stack, options.colors[code - 40]);
    } else if ((89 < code && code < 98)) {
        result = pushForegroundColor(stack, options.colors[8 + (code - 90)]);
    } else if ((99 < code && code < 108)) {
        result = pushBackgroundColor(stack, options.colors[8 + (code - 100)]);
    }

    return result;
}

/**
 * Clear all the styles
 * @returns {string}
 */
function resetStyles(stack) {
    var stackClone = stack.slice(0);

    stack.length = 0;

    return stackClone.reverse().map(function (tag) {
        return '</' + tag + '>';
    }).join('');
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

    for (var j = low; j <= high; j++) {
        results.push(j);
    }

    return results;
}



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
    var result = null;

    if (code === 0) {
        result = 'all';
    } else if (code === 1) {
        result = 'bold';
    } else if ((2 < code && code < 5)) {
        result = 'underline';
    } else if ((4 < code && code < 7)) {
        result = 'blink';
    } else if (code === 8) {
        result = 'hide';
    } else if (code === 9) {
        result = 'strike';
    } else if ((29 < code && code < 38) || code === 39 || (89 < code && code < 98)) {
        result = 'foreground-color';
    } else if ((39 < code && code < 48) || code === 49 || (99 < code && code < 108)) {
        result = 'background-color';
    }

    return result;
}

/**
 * @param {string} text
 * @param {object} options
 * @returns {string}
 */
function pushText(text, options) {
    if (options.escapeXML) {
        return entities.encodeXML(text);
    }

    return text;
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

function pushForegroundColor(stack, color) {
    return pushTag(stack, 'span', 'color:' + color);
}

function pushBackgroundColor(stack, color) {
    return pushTag(stack, 'span', 'background-color:' + color);
}

/**
 * @param {string} text
 * @param {object} options
 * @param {function} callback
 * @returns {Array}
 */
function tokenize(text, options, callback) {
    var ansiMatch = false;
    var ansiHandler = 3;

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

        for (var o = 0, len = g1.length; o < len; o++) {
            callback('display', g1[o]);
        }

        return '';
    }

    function realText(m) {
        callback('text', m);

        return '';
    }

    function rgb(m) {
        callback('rgb', m);

        return '';
    }

    /* eslint no-control-regex:0 */
    const tokens = [{
        pattern: /^\x08+/,
        sub: remove
    }, {
        pattern: /^\x1b\[[012]?K/,
        sub: remove
    }, {
        pattern: /^\x1b\[\(B/,
        sub: remove
    }, {
        pattern: /^\x1b\[[34]8;2;\d+;\d+;\d+m/,
        sub: rgb
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
        // CSI n J
        // ED - Erase in Display Clears part of the screen.
        // If n is 0 (or missing), clear from cursor to end of screen.
        // If n is 1, clear from cursor to beginning of the screen.
        // If n is 2, clear entire screen (and moves cursor to upper left on DOS ANSI.SYS).
        // If n is 3, clear entire screen and delete all lines saved in the scrollback buffer
        //   (this feature was added for xterm and is supported by other terminal applications).
        pattern: /^\x1b\[\d?J/,
        sub: remove
    }, {
        // CSI n ; m f
        // HVP - Horizontal Vertical Position Same as CUP
        pattern: /^\x1b\[\d{0,3};\d{0,3}f/,
        sub: remove
    }, {
        // catch-all for CSI sequences?
        pattern: /^\x1b\[?[\d;]{0,3}/,
        sub: remove
    }, {
        pattern: /^([^\x1b\x08\n]+)/,
        sub: realText
    }];

    function process(handler, i) {
        if (i > ansiHandler && ansiMatch) {
            return;
        }

        ansiMatch = false;

        text = text.replace(handler.pattern, handler.sub);
    }

    var handler;
    var results1 = [];
    var length = text.length;

    outer:
    while (length > 0) {
        for (var i = 0, o = 0, len = tokens.length; o < len; i = ++o) {
            handler = tokens[i];
            process(handler, i);

            if (text.length !== length) {
                // We matched a token and removed it from the text. We need to
                // start matching *all* tokens against the new text.
                length = text.length;
                continue outer;
            }
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

function Filter(options) {
    options = options || {};

    if (options.colors) {
        options.colors = Object.assign({}, defaults.colors, options.colors);
    }

    this.opts = Object.assign({}, defaults, options);
    this.stack = [];
    this.stickyStack = [];
}

Filter.prototype = {
    toHtml (input) {
        input = typeof input === 'string' ? [input] : input;
        const stack = this.stack;
        const options = this.opts;
        const buf = [];

        this.stickyStack.forEach(element => {
            var output = generateOutput(stack, element.token, element.data, options);

            if (output) {
                buf.push(output);
            }
        });

        tokenize(input.join(''), options, (token, data) => {
            var output = generateOutput(stack, token, data, options);

            if (output) {
                buf.push(output);
            }

            if (options.stream) {
                this.stickyStack = updateStickyStack(this.stickyStack, token, data);
            }
        });

        if (stack.length) {
            buf.push(resetStyles(stack));
        }

        return buf.join('');
    }
};

module.exports = Filter;
