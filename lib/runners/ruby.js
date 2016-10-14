var shovel = require('../shovel'),
    util = require('../util'),
    temp = require('temp');

module.exports.run = function run(opts, cb)
{
    shovel.start(opts, cb, {
        solutionOnly: function (run)
        {
            var code = opts.solution;

            if (opts.setup)
            {
                code = opts.setup + '\n' + code;
            }

            run({name: 'ruby', 'args': ['-e', code]});
        },
        testIntegration: function (run)
        {
            switch (opts.testFramework)
            {
                case 'cw':
                case 'cw-2':
                    return prepareCw2(opts, run);
                case 'rspec':
                    return prepareRSpec(opts, run);

                default:
                    throw 'Test framework is not supported';
            }
        },
        sanitizeStdErr: function(error)
        {
            return error.replace(/[\w/-]*(cw-2.rb):[\d]*:in( `(measure|wrap_error|it|describe)'<:LF:>)?/g, '')
                        .replace(/-e:[\d]*:in/g, '')
                        .replace('  ', ' ')
                        .replace(/<:LF:> `(block in )?(<main>|describe|it)'/g, '')
                        .replace('  ', ' ');
        },
        sanitizeStdOut: function(stdout)
        {
            return this.sanitizeStdErr(stdout);
        }
    });
};

function prepareCw2(opts, run)
{
    var code = ["require('./frameworks/ruby/cw-2')"];

    if (opts.setup)
    {
        code.push(opts.setup);
    }

    code.push(opts.solution);
    code.push(opts.fixture);

    run({name: 'ruby', 'args': ['-e', code.join('\n')]});
}

function prepareRSpec(opts, run)
{
    temp.track();
    var dir = temp.mkdirSync('ruby'),
        code = [opts.solution,opts.fixture];

    if (opts.setup) { code.unshift(opts.setup); }

    var solution = util.codeWriteSync('ruby', code.join('\n'), dir, 'solution.rb');

    run({name: 'rspec', 'args': [solution, '--require', './frameworks/ruby/cwrspecformatter.rb', '--format', 'CwRSpecFormatter']});
}
