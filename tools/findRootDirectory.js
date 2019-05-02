var fs = require('fs');

module.exports = () => {
    // puts us in the directory where this is a node module of.
    let path = `${__dirname}/../../..`;

    // keep walking down the street.
    try {
        while(!fs.readdirSync(path).includes('.koji')) {
            path += '/..';
        }
    } catch(err) {
        // give up and do a standard config
        path = `${__dirname}/../../../..`
    }

    return path;
}
