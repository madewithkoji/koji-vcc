const fs = require('fs')
const path = require('path')

module.exports = () => {
    // puts us in the directory where this is a node module of.
    let dirPath = process.cwd()
    
    // keep walking down the street.
    try {
        while (!fs.readdirSync(dirPath).includes('.koji')) {
            const parentPath = path.dirname(dirPath)
            if (dirPath === parentPath) // noinspection ExceptionCaughtLocallyJS
                throw Error(`Couldn't find ".koji" folder.`)
            dirPath = parentPath
        }
    } catch (err) {
        // give up and do a standard config
        dirPath = process.cwd()
        console.log(`Couldn't find ".koji" folder. Default path was used: "${dirPath}"`)
    }
    
    return dirPath
}
