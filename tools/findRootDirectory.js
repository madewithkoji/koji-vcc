var fs = require('fs');

module.exports = () => {
    // puts us in the directory where this is a node module of.
    let path = `${__dirname}/../../..`;

    // keep walking down the street.
    while(fs.readdir(path, (err, files) => !files.includes('.koji'))) {
        path += '/..';
    }

    return path;
}
