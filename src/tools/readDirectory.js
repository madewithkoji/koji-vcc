import { execSync } from 'child_process';
import { _YLW, RED, RST } from 'ansi-colors-and-styles';
import path from 'path';

const readDirectoryRelative = (directory) => {
  try {
    let list = execSync('git ls-files && git ls-files --exclude-standard --others', { cwd: directory }).toString()
      .replace(/\n$/, '')
      .split('\n');

    // Find the paths of git submodules (not recursive):
    const submodulesInfo = execSync('git submodule status', { cwd: directory }).toString();

    const regExp = /^ [A-Fa-f0-9]{40,64} (.+?) \(.+?\)$/gm; // live: https://regex101.com/r/yUEJNe/2/

    while (true) {
      const match = regExp.exec(submodulesInfo);

      if (match === null) break;

      // const submoduleInfo = match[0]
      const submodulePath = match[1];

      // Sample values for above variables:
      //     submoduleInfo: " debd72fe632d7315be8e31fe00c7e767c423a01f sub-repo1 (heads/master)"
      //     submodulePath: "sub-repo1"

      // Exclude submodule directory from the list:
      list = list.filter((p) => p !== submodulePath);

      // Instead, add paths under the submodule (recursive):
      // Make path relative to `directory`:
      list.push(...readDirectoryRelative(path.resolve(directory, submodulePath)).map(
        (nestedPath) => path.join(submodulePath, nestedPath),
      ));
    }

    return list;
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
const readDirectory = (directory) => readDirectoryRelative(directory).map(
  (relativePath) => path.resolve(directory, relativePath),
);

export default readDirectory;
