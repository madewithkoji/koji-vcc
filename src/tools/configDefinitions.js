/**
 * configDefinitions -
 * Automatically generates a definitions file for Koji.config.
 * This helps TypeScript developers have types and context for
 * VCC config files.
 */
import { parse } from "messageformat-parser";

function jsonWalker(json, key, level) {
  function processTokens(tokens) {
    let types = [];
    tokens
      .filter(token => typeof token === "object")
      .forEach(token => {
        switch (token.type) {
          case "argument":
          case "select":
            types.push(`${token.arg}: string`);
            break;
          case "selectordinal":
          case "plural":
            types.push(`${token.arg}: number`);
            break;
        }
        if (token.cases) {
          token.cases.forEach(oneCase => {
            types = types.concat(processTokens(oneCase.tokens));
          });
        }
      });
    return types;
  }
  const that = this;
  const types = Object.entries(json)
    .filter(pair => !commentPattern.test(pair[0]))
    .map(pair => {
      const key = pair[0];
      const value = pair[1];
      const env = {
        key,
        level,
        value
      };
      if (typeof json[key] === "string") {
        const valueType = processTokens(parse(json[key])).join(",");
        if (valueType === "") {
          return that.lineDecorator.call(env, `() => string`);
        } else {
          return that.lineDecorator.call(
            env,
            `(values: { ${valueType} }) => string`
          );
        }
      } else if (
        typeof json[key] === "object" &&
        !(json[key] instanceof Array)
      ) {
        return that.lineDecorator.call(
          env,
          that.innerWalker(json[key], key, level + 1)
        );
      } else {
        throw new Error(
          `Malformed string module ${this.resourcePath} for ID ${key}`
        );
      }
    });
  return that.blockDecorator.call({ key, level }, types);
}

const createJsonDefinitions = (json) => {
  function innerWalker(json, key, level) {
    return jsonWalker.bind({
      lineDecorator: function(type) {
        const comment =
          typeof this.value === "string"
            ? `${"  ".repeat(this.level)}/** Text: ${this.value} */\n`
            : "";
        return `${comment}${"  ".repeat(this.level)}${this.key} : ${type}`;
      },
      innerWalker,
      blockDecorator: function(types) {
        return `{\n${types.join(",\n")}\n${"  ".repeat(this.level - 1)}}`;
      }
    })(json, key, level);
  }
  return jsonWalker.bind({
    lineDecorator: function(type) {
      const comment =
        typeof this.value === "string" ? `/** Text: ${this.value} */\n` : "";
      return `${comment}export const ${this.key} = ${type};`;
    },
    innerWalker,
    blockDecorator: types => types.join("\n")
  })(json, null, 0);
};

export default createJsonDefinitions;
