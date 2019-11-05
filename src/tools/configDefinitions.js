/**
 * configDefinitions -
 * Automatically generates a definitions file for the Koji.config object.
 * This helps TypeScript developers have types and context for VCC config files.
 */

 function jsonWalker(json, key, level) {
  const that = this;

  // Wrap all key/item pairs within an object into a block
  const types = Object.entries(json)
    .map(pair => {
      const key = pair[0];
      const value = pair[1];
      const env = { key, level, value };

      if (typeof json[key] === "object" || json[key] instanceof Array) {
        return that.lineDecorator.call(env, that.innerWalker(json[key], key, level + 1));
      } else if (typeof json[key] === "string" || typeof json[key] === "boolean" || typeof json[key] === "number") {
          return that.lineDecorator.call(env, `() => ${typeof json[key]}`);
      } else {
        throw new Error(`[@withkoji/vcc] TypeScript config parser - Malformed object data for ID ${key} & value ${value}`);
      }
    });

    // Output all pairs into one, wrapped with the appropriate key and bracket/brace
    let jsonType = "object";
    if (Array.isArray(json)) {
      jsonType = "array";
    }
    return that.blockDecorator.call({ key, level }, types, jsonType);
}

const createJsonDefinitions = (json) => {
  function innerWalker(json, key, level) {
    return jsonWalker.bind({
      lineDecorator: function(type) {
        const valueType = typeof this.value;
        const comment =
          valueType === "string" || valueType === "boolean" || valueType === "number"
            ? `${"  ".repeat(this.level)}/** Value: ${this.value} */\n`
            : "";
        return `${comment}${"  ".repeat(this.level)}${this.key}: ${type}`;
      },
      innerWalker,
      blockDecorator: function(types, jsonType) {
        if (jsonType === "object") {
          return `{\n${types.join(",\n")}\n${"  ".repeat(this.level - 1)}}`;
        } else {
          return `[\n${types.join(",\n")}\n${"  ".repeat(this.level - 1)}]`;
        }
      }
    })(json, key, level);
  }
  return jsonWalker.bind({
    lineDecorator: function(type) {
      const valueType = typeof this.value;
      const comment =
        valueType === "string" || valueType === "boolean" || valueType === "number"
          ? `/** Value: ${this.value} */\n`
          : "";
      return `${comment}export const ${this.key} = ${type};`;
    },
    innerWalker,
    blockDecorator: types => types.join("\n")
  })(json, null, 0);
};

export default createJsonDefinitions;
