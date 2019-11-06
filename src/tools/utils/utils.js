/**
 * utils -
 * A hodge-podge of functions with no other place they can reside.
 * Code is adapted from Boris Cherny's json-schema-to-typescript project
 * at https://github.com/bcherny/json-schema-to-typescript
 */
import { deburr, upperFirst, trim, isPlainObject, uniqBy } from 'lodash';
import { basename, extname } from 'path';

export const DEFAULT_OPTIONS = {
  $refOptions: {},
  bannerComment: `/* tslint:disable */
/**
* Koji.config definitions file -
* This file was automatically generated. Any modifications by hand will
* be overwritten by Koji's VCC watcher when started or while running.
* Newly created and changed Koji.config objects will be added by the watcher
* to this file as VCC objects are modified.
*/`,
  cwd: process.cwd(),
  declareExternallyReferenced: true,
  enableConstEnums: true,
  strictIndexSignatures: false,
  style: {
    bracketSpacing: false,
    printWidth: 120,
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: 'none',
    useTabs: false
  },
  unreachableDefinitions: false
};

/**
 * Duck types a JSONSchema schema or property to determine which kind of AST node to parse it into.
 */
export function typeOfSchema(schema) {
  if (schema.tsType) return 'customType';
  if (schema.allOf) return 'allOf';
  if (schema.anyOf) return 'anyOf';
  if (schema.oneOf) return 'oneOf';
  if (schema.items) return 'typedArray';
  if (schema.enum && schema.tsEnumNames) return 'namedEnum';
  if (schema.enum) return 'unnamedEnum';
  if (schema.$ref) return 'reference';
  if (Array.isArray(schema.type)) return 'union';

  switch (schema.type) {
    case 'object':
      if (!schema.properties && !isPlainObject(schema)) {
        return 'object';
      }
      break;
    case 'array': return 'untypedArray';
    case 'string': return 'string';
    case 'number': return 'number';
    case 'integer': return 'number';
    case 'boolean': return 'boolean';
    case 'null': return 'null';
    case 'any': return 'any';
  }

  switch (typeof schema.default) {
    case 'boolean': return 'boolean';
    case 'number': return 'number';
    case 'string': return 'string';
  }

  if (schema.id) return 'namedSchema';

  if (isPlainObject(schema) && Object.keys(schema).length) return 'unnamedSchema';

  // Default to any
  return 'any';
}

export function escapeBlockComment(schema) {
  const replacer = '* /';
  if (schema === null || typeof schema !== 'object') {
    return;
  }
  for (const key of Object.keys(schema)) {
    if (key === 'description' && typeof schema[key] === 'string') {
      schema[key] = schema[key].replace(/\*\//g, replacer);
    }
  }
}

/**
 * Convert a string that might contain spaces or special characters to one that
 * can safely be used as a TypeScript interface or enum name.
 */
export function toSafeString(text, camelCase = false) {
  // identifiers in js/ts:
  // First character: a-zA-Z | _ | $
  // Rest: a-zA-Z | _ | $ | 0-9

    // remove accents, umlauts, ... by their basic latin letters
  const cleanText = deburr(text)
    // replace chars which are not valid for typescript identifiers with whitespace
    .replace(/(^\s*[^a-zA-Z_$])|([^a-zA-Z_$\d])/g, ' ')
    // uppercase leading underscores followed by lowercase
    .replace(/^_[a-z]/g, match => match.toUpperCase())
    // remove non-leading underscores followed by lowercase (convert snake_case)
    .replace(/_[a-z]/g, match => match.substr(1, match.length).toUpperCase())
    // uppercase letters after digits, dollars
    .replace(/([\d$]+[a-zA-Z])/g, match => match.toUpperCase())
    // uppercase first letter after whitespace
    .replace(/\s+([a-zA-Z])/g, match => trim(match.toUpperCase()))
    // remove remaining whitespace
    .replace(/\s/g, '');

  return camelCase ? cleanText : upperFirst(cleanText);
}

/**
 * Avoid appending "js" to top-level unnamed schemas
 */
export function stripExtension(filename) {
  return filename.replace(extname(filename), '');
}

/**
 * Eg. `foo/bar/baz.json` => `baz`
 */
export function justName(filename = '') {
  return stripExtension(basename(filename));
}

// keys that shouldn't be traversed by the catchall step
const BLACKLISTED_KEYS = new Set([
  'id',
  '$schema',
  'title',
  'description',
  'default',
  'multipleOf',
  'maximum',
  'exclusiveMaximum',
  'minimum',
  'exclusiveMinimum',
  'maxLength',
  'minLength',
  'pattern',
  'additionalItems',
  'items',
  'maxItems',
  'minItems',
  'uniqueItems',
  'maxProperties',
  'minProperties',
  'required',
  'additionalProperties',
  'definitions',
  'properties',
  'patternProperties',
  'dependencies',
  'enum',
  'type',
  'allOf',
  'anyOf',
  'oneOf',
  'not'
])
function traverseObjectKeys(obj, callback = (_schema) => any) {
  Object.keys(obj).forEach(k => {
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      traverse(obj[k], callback);
    }
  });
}
function traverseArray(arr, callback = (_schema) => any) {
  arr.forEach(i => traverse(i, callback));
}
export function traverse(schema, callback = (_schema) => any) {
  callback(schema);

  if (schema.anyOf) {
    traverseArray(schema.anyOf, callback);
  }
  if (schema.allOf) {
    traverseArray(schema.allOf, callback);
  }
  if (schema.oneOf) {
    traverseArray(schema.oneOf, callback);
  }
  if (schema.properties) {
    traverseObjectKeys(schema.properties, callback);
  }
  if (schema.patternProperties) {
    traverseObjectKeys(schema.patternProperties, callback);
  }
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    traverse(schema.additionalProperties, callback);
  }
  if (schema.items) {
    const { items } = schema;
    if (Array.isArray(items)) {
      traverseArray(items, callback);
    } else {
      traverse(items, callback);
    }
  }
  if (schema.additionalItems && typeof schema.additionalItems === 'object') {
    traverse(schema.additionalItems, callback);
  }
  if (schema.dependencies) {
    traverseObjectKeys(schema.dependencies, callback);
  }
  if (schema.definitions) {
    traverseObjectKeys(schema.definitions, callback);
  }
  if (schema.not) {
    traverse(schema.not, callback);
  }

  // technically you can put definitions on any key
  Object.keys(schema).filter(key => !BLACKLISTED_KEYS.has(key)).forEach(key => {
    const child = schema[key];
    if (child && typeof child === 'object') {
      traverseObjectKeys(child, callback);
    }
  });
}

/**
 * We want unique names in our generated definition file. This will create a new name using a counter.
 * @param {*} from (string) the source from which the name is generated
 * @param {*} usedNames (Set<string>) collection of names already used
 */
export function generateName(from, usedNames, camelCase = true) {
  let name = toSafeString(from, camelCase);

  // increment counter until we find a free name
  if (usedNames.has(name)) {
    let counter = 1;
    while (usedNames.has(name)) {
      name = `${toSafeString(from, camelCase)}${counter}`;
      counter++;
    }
  }

  usedNames.add(name);
  return name;
}

export function optimize(ast, processed = new Map()) {
  if (processed.has(ast)) {
    return processed.get(ast);
  }
  processed.set(ast, ast);

  switch (ast.type) {
    case 'interface':
      return Object.assign(ast, {
        params: ast.params.map(param =>
          Object.assign(param, { ast: optimize(param.ast, processed) })
        )
      });

    case 'intersection':
    case 'union':
      // [A, B, C, Any] -> Any
      if (ast.params.some(param => param.type === 'any')) {
        return { type: 'any' };
      }

      // [A, B, B] -> [A, B]
      ast.params = uniqBy(ast.params, param =>
        `${param.type}------${JSON.stringify((param).params)}`
      );

      return Object.assign(ast, {
        params: ast.params.map(param => optimize(param, processed))
      });

    default:
      return ast;
  }
}

export function hasComment(ast) {
  return 'comment' in ast && ast.comment != null && ast.comment !== '';
}

export function hasStandaloneName(ast) {
  return 'standaloneName' in ast && ast.standaloneName != null && ast.standaloneName !== '';
}
