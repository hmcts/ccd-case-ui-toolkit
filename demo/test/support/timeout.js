// timeout.js
const minimist = require('minimist');
const { setDefaultTimeout } = require('cucumber');

const argv = minimist(process.argv.slice(2));

if (argv.dev) {
    setDefaultTimeout(30*60 * 1000);

} else {
    setDefaultTimeout(180 * 1000);
}
