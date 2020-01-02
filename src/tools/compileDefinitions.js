/**
 * compileDefinitions -
 * Automatically generates a definitions file for the Koji.config object.
 * This helps TypeScript developers have types and context for VCC config files.
 * This will also aid anyone using VSCode (and similar environments, like Koji!)
 * to see the config.json members and their types.
 */
import _ from 'lodash';

export default function compile(json) {
  return createJsonDefinitions(json);
}

function toSafeString(textToConvert) {
  // identifiers in javaScript/ts:
  // First character: a-zA-Z | _ | $
  // Rest: a-zA-Z | _ | $ | 0-9

  return (
    // remove accents, umlauts, ... by their basic latin letters
    _.deburr(textToConvert)
    // replace chars which are not valid for identifiers with whitespace
    .replace(/(^\s*[^a-zA-Z_$])|([^a-zA-Z_$\d])/g, ' ')
    // remove remaining whitespace
    .replace(/\s/g, '')
  );
}

function jsonWalker(json, key, level, parentType) {
  const that = this;

  // Wrap all key/item pairs within an object into a block
  const types = Object.entries(json)
    .map(pair => {
      const key = pair[0];
      const value = pair[1];
      const env = { key, level, value };

      if (typeof json[key] === "object" || json[key] instanceof Array) {
        return that.lineDecorator.call(env, that.innerWalker(json[key], key, level + 1), parentType);
      } else if (typeof json[key] === "string" || typeof json[key] === "boolean" || typeof json[key] === "number") {
          return that.lineDecorator.call(env, `${typeof json[key]}`, parentType);
      } else {
        throw new Error(`[@withkoji/vcc] Config definitions parser - Malformed object data for ID ${key} & value ${value}`);
      }
    });

    // Output all pairs into one, wrapped with the appropriate key and bracket/brace
    return that.blockDecorator.call({ key, level }, types, parentType);
}

const createJsonDefinitions = (json) => {
  function innerWalker(json, key, level) {
    // If this is an array, we will build the internals without a key, since arrays don't need them
    let jsonType = "object";
    if (Array.isArray(json)) {
      jsonType = "array";
    }

    return jsonWalker.bind({
      lineDecorator: function(type, parentType) {
        const valueType = typeof this.value;
        const lineContent = parentType === "object" ? `${toSafeString(this.key)}: ${type}` : `${type}`;
        const comment =
          valueType === "string" || valueType === "boolean" || valueType === "number"
            ? `${"  ".repeat(this.level)}/** Type: ${valueType}, Value: ${this.value} */\n`
            : "";
        return `${comment}${"  ".repeat(this.level)}${lineContent}`;
      },
      innerWalker,
      blockDecorator: function(types, parentType) {
        if (parentType === "object") {
          return `{\n${types.join(",\n")}\n${"  ".repeat(this.level - 1)}}`;
        } else {
          return `[\n${types.join(",\n")}\n${"  ".repeat(this.level - 1)}]`;
        }
      }
    })(json, key, level, jsonType);
  }
  return jsonWalker.bind({
    lineDecorator: function(type, parentType) {
      if (this.key === '@@editor') return;
      const valueType = typeof this.value;
      const lineContent = parentType === "object" ? `${toSafeString(this.key)} = ${type};` : `${type},`;
      const comment =
        valueType === "string" || valueType === "boolean" || valueType === "number"
          ? `/** Type: ${valueType}, Value: ${this.value} */\n`
          : "";
      return `${comment}${lineContent}`;
    },
    innerWalker,
    blockDecorator: (types) => types.join("\n")
  })(json, null, 0, "object");
};
