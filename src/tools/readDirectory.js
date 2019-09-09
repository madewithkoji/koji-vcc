import { execSync } from 'child_process';
import { _YLW, RED, RST } from 'ansi-colors-and-styles';
import path from 'path';

const readDirectoryRelative = (directory) => {
  try {
    let pathList = execSync('git ls-files && git ls-files --exclude-standard --others', { cwd: directory }).toString()
      .replace(/\n$/, '')
      .split('\n');

    // Find the paths of git submodules (not recursive):
    const submodulesInfo = execSync('git submodule status', { cwd: directory }).toString();

    const regExp = /^ [A-Fa-f0-9]{40,64} (.+?) \(.+?\)$/gm; // live: https://regex101.com/r/yUEJNe/2/
    const match = regExp.exec(submodulesInfo);
    // const submoduleInfo = match[0]
    while (match !== null) {
      const submodulePath = match[1];
      // Sample values for above variables:
      //     submoduleInfo: " debd72fe632d7315be8e31fe00c7e767c423a01f sub-repo1 (heads/master)"
      //     submodulePath: "sub-repo1"

      // Exclude submodule directory from the list:
      pathList = pathList.filter((dirPath) => dirPath !== submodulePath);
      // Instead, add paths under the submodule (recursive):
      // Make path relative to `directory`:
      const relativeDirPaths = readDirectoryRelative(path.resolve(directory, submodulePath))
        .map((nestedPath) => path.join(submodulePath, nestedPath));

      pathList.push(...relativeDirPaths);
    }
    return pathList;
  } catch (err) {
    const error = new Error(`
      [@withkoji/vcc] ${err.message}\n${_YLW}${RED}Have you installed "git" and added it to the "PATH"?
      If not, see: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git${RST}\n
    `);
    error.stack = err.stack;
    throw error;
  }
};

// Get all git-indexed paths to find koji files
// Make path absolute:
// Filter out any files that dont meet requirements
const readDirectory = (directory) => readDirectoryRelative(directory)
  .reduce((absoluteDirs, relativePath) => {
    if (!((relativePath.endsWith('koji.json') || relativePath.includes('.koji')) && !relativePath.includes('.koji-resources'))) {
      return absoluteDirs;
    }
    const absolutePath = path.resolve(directory, relativePath);
    absoluteDirs.push(absolutePath);
    return absoluteDirs;
  }, []);

export default readDirectory;
