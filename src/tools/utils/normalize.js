/**
 * normalize -
 * Sets any missing schema definitions for the input JSON file.
 * Code is adapted from Boris Cherny's json-schema-to-typescript project
 * at https://github.com/bcherny/json-schema-to-typescript
 */
import { cloneDeep } from 'lodash';
import { escapeBlockComment, justName, toSafeString, traverse } from './utils';

const rules = new Map();

function hasType(schema, type) {
  return schema.type === type || (Array.isArray(schema.type) && schema.type.includes(type));
}
function isObjectType(schema) {
  return schema.properties !== undefined || hasType(schema, 'object') || hasType(schema, 'any');
}
function isArrayType(schema) {
  return schema.items !== undefined || hasType(schema, 'array') || hasType(schema, 'any');
}

rules.set('Destructure unary types', (schema) => {
  if (schema.type && Array.isArray(schema.type) && schema.type.length === 1) {
    schema.type = schema.type[0];
  }
});

rules.set('Add empty `required` property if none is defined', (schema) => {
  if (!('required' in schema) && isObjectType(schema)) {
    schema.required = [];
  }
});

rules.set('Transform `required`=false to `required`=[]', (schema) => {
  if (schema.required === false) {
    schema.required = [];
  }
});

// TODO: default to empty schema (as per spec) instead
rules.set('Default additionalProperties to true', (schema) => {
  if (!('additionalProperties' in schema) &&
    isObjectType(schema) &&
    schema.patternProperties === undefined) {
    schema.additionalProperties = true;
  }
});

rules.set('Default top level `id`', (schema, rootSchema, fileName) => {
  if (!schema.id && JSON.stringify(schema) === JSON.stringify(rootSchema)) {
    schema.id = toSafeString(justName(fileName), true);
  }
});

rules.set('Escape closing JSDoc Comment', (schema) => {
  escapeBlockComment(schema);
});

rules.set('Normalise schema.minItems', (schema) => {
  // make sure we only add the props onto array types
  if (isArrayType(schema)) {
    const {minItems} = schema;
    schema.minItems = typeof minItems === 'number' ? minItems : 0;
  }
  // cannot normalise maxItems because maxItems = 0 has an actual meaning
});

rules.set('Normalize schema.items', (schema) => {
  const {maxItems, minItems} = schema;
  const hasMaxItems = typeof maxItems === 'number' && maxItems >= 0;
  const hasMinItems = typeof minItems === 'number' && minItems > 0;

  if (schema.items && !Array.isArray(schema.items) && (hasMaxItems || hasMinItems)) {
    const items = schema.items;
    // create a tuple of length N
    const newItems = Array(maxItems || minItems || 0).fill(items);
    if (!hasMaxItems) {
      // if there is no maximum, then add a spread item to collect the rest
      schema.additionalItems = items;
    }
    schema.items = newItems;
  }

  if (Array.isArray(schema.items) && hasMaxItems && maxItems < schema.items.length) {
    // it's perfectly valid to provide 5 item defs but require maxItems 1
    // obviously we shouldn't emit a type for items that aren't expected
    schema.items = schema.items.slice(0, maxItems);
  }

  return schema;
});

export function normalize(schema, filename = "") {
  const clonedSchema = cloneDeep(schema);
  rules.forEach((rule) => {
    traverse(clonedSchema, (schema) => rule(schema, clonedSchema, filename));
  });
  return clonedSchema;
}
