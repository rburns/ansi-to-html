/* globals describe, it*/

const childProcess = require('child_process');
const expect = require('chai').expect;

function getColorCmd(cmd) {
    const cmds = {
        darwin: `CLICOLOR_FORCE="1" ${cmd} | node lib/cli`,
        linux: `CLICOLOR="1" ${cmd} | node lib/cli`,
        win32: `${cmd} | node lib/cli`
    };

    return cmds[process.platform];
}

describe('cli', function () {
    it('converts colors', function (done) {
        const data = 'echo "what\033[0;31m what?"';
        const result = 'what<span style=\"color:#A00\"> what?\n</span>';

        childProcess.exec(getColorCmd(data), {
            timeout: 10000
        }, (err, stdout, stderr) => {
            if (err) {
                return done(err);
            }

            if (stderr) {
                return done(stderr);
            }

            expect(stdout).to.equal(result);

            done();
        });
    });
});
