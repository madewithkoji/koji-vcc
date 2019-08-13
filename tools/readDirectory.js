const {execSync} = require('child_process')
const {_YLW, RED, RST} = require('ansi-colors-and-styles')
const path = require('path')

// Get all git-indexed paths to find koji files
module.exports = directory => readDirectoryRelative(directory).map(
		// Make path absolute:
		relativePath => path.resolve(directory, relativePath)
)

function readDirectoryRelative(directory) {
	try {
		let list = execSync('git ls-files', {cwd: directory}).toString()
				.replace(/\n$/, '')
				.split('\n')
		
		// Find the paths of git submodules (not recursive):
		const submodulesInfo = execSync('git submodule status', {cwd: directory}).toString()
		
		const regExp = /^ [A-Fa-f0-9]{40,64} (.+?) \(.+?\)$/gm   // live: https://regex101.com/r/yUEJNe/2/
		
		while (true) {
			const match = regExp.exec(submodulesInfo)
			
			if (match === null) break
			
			//const submoduleInfo = match[0]
			const submodulePath = match[1]
			
			// Sample values for above variables:
			//     submoduleInfo: " debd72fe632d7315be8e31fe00c7e767c423a01f sub-repo1 (heads/master)"
			//     submodulePath: "sub-repo1"
			
			// Exclude submodule directory from the list:
			list = list.filter(path => path !== submodulePath)

			// Instead, add paths under the submodule (recursive):
			list.push(...readDirectoryRelative(path.resolve(directory, submodulePath)).map(
					// Make path relative to `directory`:
					nestedPath => path.join(submodulePath, nestedPath))
			)
		}
		
		return list
	} catch (err) {
		const error = new Error(err.message +
				`\n${_YLW}${RED}Have you installed "git" and added it to the "PATH"? If no see: ` +
				`https://git-scm.com/book/en/v2/Getting-Started-Installing-Git${RST}\n`
		)
		error.stack = err.stack
		throw error
	}
}
