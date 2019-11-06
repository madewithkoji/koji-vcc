/**
 * parse -
 * Process each node of the JSON file and convert to TypeScript's Abstract Syntax Tree.
 * Code is adapted from Boris Cherny's json-schema-to-typescript project
 * at https://github.com/bcherny/json-schema-to-typescript
 */
import { findKey, isPlainObject, map } from 'lodash';
import { generateName, hasStandaloneName, typeOfSchema, DEFAULT_OPTIONS } from './utils';

/**
 * Process the JSON object in preparation to export it to a definitions file
 * @param {*} schema (object type) The JSON object to parse
 */
export function parse(schema, options = DEFAULT_OPTIONS, rootSchema = schema, keyName = "", isSchema = true, processed = new Map(), usedNames = new Set()) {
  // If we've seen this node before, return it.
  if (processed.has(schema)) {
    return processed.get(schema);
  }

  // Cache processed data before actually computed, then update
  // them in place using set(). This is to avoid cycles.
  let ast = {};
  processed.set(schema, ast);
  const set = (_ast) => Object.assign(ast, _ast);

  const definitions = getDefinitions(rootSchema);
  const definitionKeyName = findKey(definitions, definition => definition === schema);

  return isSchema
  ? parseNonLiteral(schema, options, rootSchema, keyName, definitionKeyName, set, processed, usedNames)
  : parseLiteral(schema, keyName, definitionKeyName, set);
}

/**
 * Compute a schema name using a series of fallbacks
 */
function standaloneName(schema, definitionKeyName, usedNames) {
  let name = schema.title || schema.id || definitionKeyName;
  if (name) {
    return generateName(name, usedNames);
  }
}

/**
 * Helper to parse schema properties into params on the parent schema's type
 */
function parseSchema(schema, options, rootSchema, processed, usedNames, parentSchemaName) {
  let asts = map(schema.properties, (value, key) => ({
    ast: parse(value, options, rootSchema, key, true, processed, usedNames),
    isPatternProperty: false,
    isRequired: includes(schema.required || [], key),
    isUnreachableDefinition: false,
    keyName: key
  }));

  let singlePatternProperty = false;
  if (schema.patternProperties) {
    singlePatternProperty = (!schema.additionalProperties && Object.keys(schema.patternProperties).length === 1);

    asts = asts.concat(map(schema.patternProperties, (value, key) => {
      let ast = parse(value, options, rootSchema, key, true, processed, usedNames);
      let comment = `This interface was referenced by \`${parentSchemaName}\`'s JSON-Schema definition via the \`patternProperty\` "${key}".`;
      ast.comment = ast.comment ? `${ast.comment}\n\n${comment}` : comment;
      return ({
        ast,
        isPatternProperty: !singlePatternProperty,
        isRequired: singlePatternProperty || includes(schema.required || [], key),
        isUnreachableDefinition: false,
        keyName: singlePatternProperty ? '[k: string]' : key
      });
    }));
  }

  if (options.unreachableDefinitions) {
    asts = asts.concat(map(schema.definitions, (value, key) => {
      let ast = parse(value, options, rootSchema, key, true, processed, usedNames);
      let comment = `This interface was referenced by \`${parentSchemaName}\`'s JSON-Schema via the \`definition\` "${key}".`;
      ast.comment = ast.comment ? `${ast.comment}\n\n${comment}` : comment;
      return {
        ast,
        isPatternProperty: false,
        isRequired: includes(schema.required || [], key),
        isUnreachableDefinition: true,
        keyName: key
      }
    }));
  }

  // handle additionalProperties
  switch (schema.additionalProperties) {
    case undefined:
    case true:
      if (singlePatternProperty) {
        return asts;
      }
      return asts.concat({
        ast: { keyName: '[k: string]', type: 'any' },
        isPatternProperty: false,
        isRequired: true,
        isUnreachableDefinition: false,
        keyName: '[k: string]'
      });

    case false:
      return asts;

    // pass "true" as the last param because in TS, properties
    // defined via index signatures are already optional
    default:
      return asts.concat({
        ast: parse(schema.additionalProperties, options, rootSchema, '[k: string]', true, processed, usedNames),
        isPatternProperty: false,
        isRequired: true,
        isUnreachableDefinition: false,
        keyName: '[k: string]'
      });
  }
}

function parseSuperTypes(schema, options, processed, usedNames) {
  const superTypes = schema.extends;
  if (!superTypes) {
    return [];
  }
  if (Array.isArray(superTypes)) {
    return superTypes.map(items => newNamedInterface(items, options, items, processed, usedNames));
  }
  return [newNamedInterface(superTypes, options, superTypes, processed, usedNames)];
}

function newInterface(schema, options, rootSchema, processed, usedNames, keyName = "", definitionKeyName = "") {
  let name = standaloneName(schema, definitionKeyName, usedNames);
  return {
    comment: schema.description,
    keyName,
    params: parseSchema(schema, options, rootSchema, processed, usedNames, name),
    standaloneName: name,
    superTypes: parseSuperTypes(schema, options, processed, usedNames),
    type: 'interface'
  };
}

function newNamedInterface(schema, options, rootSchema, processed, usedNames) {
  const namedInterface = newInterface(schema, options, rootSchema, processed, usedNames);
  if (hasStandaloneName(namedInterface)) {
    return namedInterface;
  } else {
    namedInterface.standaloneName = standaloneName(schema, undefined, usedNames);
  }
}

function parseLiteral(schema, keyName, definitionKeyName, set = (_ast) => any) {
  return set({
    keyName,
    params: schema,
    standaloneName: definitionKeyName,
    type: 'literal'
  });
}

function parseNonLiteral(schema, options, rootSchema, keyName, definitionKeyName, set = (_ast) => any, processed, usedNames) {
  switch (typeOfSchema(schema)) {
    case 'allOf':
      return set({
        comment: schema.description,
        keyName,
        params: schema.allOf.map(items => parse(items, options, rootSchema, undefined, true, processed, usedNames)),
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'intersection'
      });
    case 'any':
      return set({
        comment: schema.description,
        keyName,
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'any'
      });
    case 'anyOf':
      return set({
        comment: schema.description,
        keyName,
        params: schema.anyOf.map(items => parse(items, options, rootSchema, undefined, true, processed, usedNames)),
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'union'
      });
    case 'boolean':
      return set({
        comment: schema.description,
        keyName,
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'boolean'
      });
    case 'customType':
      return set({
        comment: schema.description,
        keyName,
        params: schema.tsType,
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'customType'
      });
    case 'namedEnum':
      return set({
        comment: schema.description,
        keyName,
        params: schema.enum.map((items, n) => ({
          ast: parse(items, options, rootSchema, undefined, false, processed, usedNames),
          keyName: schema.tsEnumNames[n]
        })),
        standaloneName: standaloneName(schema, keyName, usedNames),
        type: 'enum'
      });
    case 'namedSchema':
      return set(newInterface(schema, options, rootSchema, processed, usedNames, keyName));
    case 'null':
      return set({
        comment: schema.description,
        keyName,
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'null'
      });
    case 'number':
      return set({
        comment: schema.description,
        keyName,
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'number'
      });
    case 'object':
      return set({
        comment: schema.description,
        keyName,
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'object'
      });
    case 'oneOf':
      return set({
        comment: schema.description,
        keyName,
        params: schema.oneOf.map(items => parse(items, options, rootSchema, undefined, true, processed, usedNames)),
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'union'
      });
    case 'reference':
      throw Error(format('Refs are not supported currently...', schema));
    case 'string':
      return set({
        comment: schema.description,
        keyName,
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'string'
      });
    case 'typedArray':
      if (Array.isArray(schema.items)) {
        // normalised to not be undefined
        const minItems = schema.minItems;
        const maxItems = schema.maxItems;
        const arrayType = {
          comment: schema.description,
          keyName,
          maxItems,
          minItems,
          params: schema.items.map(_items => parse(_items, options, rootSchema, undefined, true, processed, usedNames)),
          standaloneName: standaloneName(schema, definitionKeyName, usedNames),
          type: 'tuple'
        };
        if (schema.additionalItems === true) {
          arrayType.spreadParam = {
            type: 'any'
          };
        } else if (schema.additionalItems) {
          arrayType.spreadParam = parse(schema.additionalItems, options, rootSchema, undefined, true, processed, usedNames);
        }
        return set(arrayType);
      } else {
        const params = parse(schema.items, options, rootSchema, undefined, true, processed, usedNames);
        return set({
          comment: schema.description,
          keyName,
          params,
          standaloneName: standaloneName(schema, definitionKeyName, usedNames),
          type: 'array'
        });
      }
    case 'union':
      return set({
        comment: schema.description,
        keyName,
        params: schema.type.map(_item => parse({ type: _item }, options, rootSchema, undefined, true, processed, usedNames)),
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'union'
      });
    case 'unnamedEnum':
      return set({
        comment: schema.description,
        keyName,
        params: schema.enum.map(items => parse(items, options, rootSchema, undefined, false, processed, usedNames)),
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'union'
      });
    case 'unnamedSchema':
      return set(newInterface(schema, options, rootSchema, processed, usedNames, keyName, definitionKeyName));
    case 'untypedArray':
      // normalised to not be undefined
      const minItems = schema.minItems;
      const maxItems = typeof schema.maxItems === 'number' ? schema.maxItems : -1;
      const params = { type: 'any' };
      if (minItems > 0 || maxItems >= 0) {
        return set({
          comment: schema.description,
          keyName,
          maxItems: schema.maxItems,
          minItems,
          // create a tuple of length N
          params: Array(Math.max(maxItems, minItems) || 0).fill(params),
          // if there is no maximum, then add a spread item to collect the rest
          spreadParam: maxItems >= 0 ? undefined : params,
          standaloneName: standaloneName(schema, definitionKeyName, usedNames),
          type: 'tuple'
        });
      }

      return set({
        comment: schema.description,
        keyName,
        params,
        standaloneName: standaloneName(schema, definitionKeyName, usedNames),
        type: 'array'
      });
  }
}

// type Definitions = { [k: string]: JSONSchema }

function hasDefinitions(schema) {
  return 'definitions' in schema;
}

function getDefinitions(schema, isSchema = true, processed = new Set()) {
  if (processed.has(schema)) {
    return {};
  }
  processed.add(schema);
  if (Array.isArray(schema)) {
    return schema.reduce((prev, cur) => ({
      ...prev,
      ...getDefinitions(cur, false, processed)
    }), {});
  }
  if (isPlainObject(schema)) {
    return {
      ...(isSchema && hasDefinitions(schema) ? schema.definitions : {}),
      ...Object.keys(schema).reduce((prev, cur) => ({
        ...prev,
        ...getDefinitions(schema[cur], false, processed)
      }), {})
    };
  }
  return {};
}
