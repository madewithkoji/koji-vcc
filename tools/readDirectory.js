const {execSync} = require('child_process')
const {_YLW, RED, RST} = require('ansi-colors-and-styles')
const path = require('path')

// Get all git-indexed paths to find koji files
module.exports = directory => {
   try {
      return execSync('git ls-files', {cwd: directory}).toString()
            .replace(/\n$/, '')
            .split('\n')
            .map(relativePath => path.resolve(directory, relativePath))
   } catch (error) {
      throw Error(error.message +
            `${_YLW}${RED}Have you installed "git" and added it to the "PATH"? If no see: ` +
            `https://git-scm.com/book/en/v2/Getting-Started-Installing-Git${RST}\n`
      )
   }
}
