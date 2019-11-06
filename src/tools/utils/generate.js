/**
 * generate -
 * Consume the parsed AST nodes and generate the definitions file
 * Code is adapted from Boris Cherny's json-schema-to-typescript project
 * at https://github.com/bcherny/json-schema-to-typescript
 */

/**
 * The default options for generating the definitions file.
 * These will not be modifiable currently. As VCC definitions change,
 * support for changing options will be considered in the future.
 */
import { format } from 'prettier';
import { omit } from 'lodash';
import { hasComment, hasStandaloneName, DEFAULT_OPTIONS, toSafeString } from './utils';

function declareEnums(ast, options, processed = new Set()) {
  if (processed.has(ast)) {
    return '';
  }

  processed.add(ast);
  let type = '';

  switch (ast.type) {
    case 'enum':
      type = generateStandaloneEnum(ast, options) + '\n';
      break;
    case 'array':
      return declareEnums(ast.params, options, processed);
    case 'tuple':
      type = ast.params.reduce((prev, ast) => prev + declareEnums(ast, options, processed), '');
      if (ast.spreadParam) {
        type += declareEnums(ast.spreadParam, options, processed);
      }
      break;
    case 'interface':
      type = getSuperTypesAndParams(ast).reduce((prev, ast) =>
        prev + declareEnums(ast, options, processed),
        '');
      break;
    default:
      return '';
  }

  return type;
}

function declareNamedInterfaces(ast, options, rootAstName, processed = new Set()) {
  if (processed.has(ast)) {
    return '';
  }

  processed.add(ast);
  let type = '';

  switch (ast.type) {
    case 'array':
      type = declareNamedInterfaces(ast.params, options, rootAstName, processed);
      break;
    case 'interface':
      type = [
        hasStandaloneName(ast) && (ast.standaloneName === rootAstName || options.declareExternallyReferenced) && generateStandaloneInterface(ast, options),
        getSuperTypesAndParams(ast).map(ast =>
          declareNamedInterfaces(ast, options, rootAstName, processed)
        ).filter(Boolean).join('\n')
      ].filter(Boolean).join('\n');
      break;
    case 'intersection':
    case 'tuple':
    case 'union':
      type = ast.params.map(_ => declareNamedInterfaces(_, options, rootAstName, processed)).filter(Boolean).join('\n');
      if (ast.type === 'tuple' && ast.spreadParam) {
        type += declareNamedInterfaces(ast.spreadParam, options, rootAstName, processed);
      }
      break;
    default:
      type = '';
  }

  return type;
}

function declareNamedTypes(ast, options, rootAstName, processed = new Set()) {
  if (processed.has(ast)) {
    return '';
  }

  processed.add(ast);
  let type = '';

  switch (ast.type) {
    case 'array':
      type = [
        declareNamedTypes(ast.params, options, rootAstName, processed),
        hasStandaloneName(ast) ? generateStandaloneType(ast, options) : undefined
      ].filter(Boolean).join('\n');
      break;
    case 'enum':
      type = '';
      break;
    case 'interface':
      type = getSuperTypesAndParams(ast).map(ast =>
        (ast.standaloneName === rootAstName || options.declareExternallyReferenced) && declareNamedTypes(ast, options, rootAstName, processed))
      .filter(Boolean).join('\n');
      break;
    case 'intersection':
    case 'tuple':
    case 'union':
      type = [
        hasStandaloneName(ast) ? generateStandaloneType(ast, options) : undefined,
        ast.params.map(ast => declareNamedTypes(ast, options, rootAstName, processed)).filter(Boolean).join('\n'),
        ('spreadParam' in ast && ast.spreadParam) ? declareNamedTypes(ast.spreadParam, options, rootAstName, processed) : undefined
      ].filter(Boolean).join('\n');
      break;
    default:
      if (hasStandaloneName(ast)) {
        type = generateStandaloneType(ast, options);
      }
  }

  return type;
}

function generateType(ast, options) {
  const type = generateRawType(ast, options);

  if (options.strictIndexSignatures && ast.keyName === '[k: string]') {
    return `${type} | undefined`;
  }

  return type;
}

function generateRawType(ast, options) {
  if (hasStandaloneName(ast)) {
    return toSafeString(ast.standaloneName);
  }

  switch (ast.type) {
    case 'array':
      return (() => {
        const type = generateType(ast.params, options);
        return type.endsWith('"') ? '(' + type + ')[]' : type + '[]';
      })();
    case 'union': return generateSetOperation(ast, options);
    case 'customType': return ast.params;
    case 'interface': return generateInterface(ast, options);
    case 'intersection': return generateSetOperation(ast, options);
    case 'literal': return JSON.stringify(ast.params);
    case 'reference': return ast.params;
    case 'tuple':
      return (() => {
        const minItems = ast.minItems;
        const maxItems = ast.maxItems || -1;

        let spreadParam = ast.spreadParam;
        const astParams = [...ast.params];
        if (minItems > 0 && minItems > astParams.length && ast.spreadParam === undefined) {
          // this is a valid state, and JSONSchema doesn't care about the item type
          if (maxItems < 0) {
            // no max items and no spread param, so just spread any
            spreadParam = { type: 'any' };
          }
        }
        if (maxItems > astParams.length && ast.spreadParam === undefined) {
          // this is a valid state, and JSONSchema doesn't care about the item type
          // fill the tuple with any elements
          for (let i = astParams.length; i < maxItems; i += 1) {
            astParams.push({ type: 'any' });
          }
        }

        function addSpreadParam(params) {
          if (spreadParam) {
            const spread = '...(' + generateType(spreadParam, options) + ')[]';
            params.push(spread);
          }
          return params;
        }

        function paramsToString(params) {
          return '[' + params.join(', ') + ']';
        }

        const paramsList = astParams.map(param => generateType(param, options));

        if (paramsList.length > minItems) {
          /*
          if there are more items than the min, we return a union of tuples instead of
          using the optional element operator. This is done because it is more typesafe.
          // optional element operator
          type A = [string, string?, string?]
          const a: A = ['a', undefined, 'c'] // no error
          // union of tuples
          type B = [string] | [string, string] | [string, string, string]
          const b: B = ['a', undefined, 'c'] // TS error
          */

          const cumulativeParamsList = paramsList.slice(0, minItems);
          const typesToUnion = [];

          if (cumulativeParamsList.length > 0) {
            // actually has minItems, so add the initial state
            typesToUnion.push(paramsToString(cumulativeParamsList));
          } else {
            // no minItems means it's acceptable to have an empty tuple type
            typesToUnion.push(paramsToString([]));
          }

          for (let i = minItems; i < paramsList.length; i += 1) {
            cumulativeParamsList.push(paramsList[i]);

            if (i === paramsList.length - 1) {
              // only the last item in the union should have the spread parameter
              addSpreadParam(cumulativeParamsList);
            }

            typesToUnion.push(paramsToString(cumulativeParamsList));
          }

          return typesToUnion.join('|');
        }

        // no max items so only need to return one type
        return paramsToString(addSpreadParam(paramsList));
      })();

    default:
      return ast.type;
  }
}

/**
 * Generate a Union or Intersection
 */
function generateSetOperation(ast, options) {
  const members = ast.params.map(param => generateType(param, options));
  const separator = ast.type === 'union' ? '|' : '&';
  return members.length === 1 ? members[0] : '(' + members.join(' ' + separator + ' ') + ')'
}

function generateInterface(ast, options) {
  return (
    '{\n'
    + ast.params
      .filter(_ => !_.isPatternProperty && !_.isUnreachableDefinition)
      .map(({ isRequired, keyName, ast }) => [isRequired, keyName, ast, generateType(ast, options)])
      .map(([isRequired, keyName, ast, type]) =>
        (hasComment(ast) && !ast.standaloneName ? generateComment(ast.comment) + '\n' : '')
        + escapeKeyName(keyName)
        + (isRequired ? '' : '?')
        + ': '
        + (hasStandaloneName(ast) ? toSafeString(type) : type)
      )
      .join('\n')
    + '\n'
    + '}'
  );
}

function generateComment(comment) {
  return [
    '/**',
    ...comment.split('\n').map(line => ' * ' + line),
    ' */'
  ].join('\n');
}

function generateStandaloneEnum(ast, options) {
  return (hasComment(ast) ? generateComment(ast.comment) + '\n' : '')
    + 'export ' + (options.enableConstEnums ? 'const ' : '') + `enum ${toSafeString(ast.standaloneName)} {`
    + '\n'
    + ast.params.map(({ ast, keyName }) =>
      keyName + ' = ' + generateType(ast, options)
    )
      .join(',\n')
    + '\n'
    + '}';
}

function generateStandaloneInterface(ast, options) {
  return (hasComment(ast) ? generateComment(ast.comment) + '\n' : '')
    + `export interface ${toSafeString(ast.standaloneName)} `
    + (ast.superTypes.length > 0 ? `extends ${ast.superTypes.map(superType => toSafeString(superType.standaloneName)).join(', ')} ` : '')
    + generateInterface(ast, options);
}

function generateStandaloneType(ast, options) {
  return (hasComment(ast) ? generateComment(ast.comment) + '\n' : '')
    + `export type ${toSafeString(ast.standaloneName)} = ${generateType(omit(ast, 'standaloneName'), options)}`;
}

function escapeKeyName(keyName) {
  if (
    keyName.length
    && /[A-Za-z_$]/.test(keyName.charAt(0))
    && /^[\w$]+$/.test(keyName)
  ) {
    return keyName;
  }
  if (keyName === '[k: string]') {
    return keyName;
  }
  return JSON.stringify(keyName);
}

function getSuperTypesAndParams(ast) {
  return ast.params
    .map(param => param.ast)
    .concat(ast.superTypes);
}

/**
 * Creates the definitions file from a parsed JSON object.
 * The file is then formatted by Prettier and returned for saving to disk.
 * @param {*} ast parsed JSON into Abstract Syntax Tree format
 * @returns string of the definitions file, ready to save to disk
 */
export function generate(ast, options = DEFAULT_OPTIONS) {
  const definitions = [
    options.bannerComment,
    declareNamedTypes(ast, options, ast.standaloneName),
    declareNamedInterfaces(ast, options, ast.standaloneName),
    declareEnums(ast, options)
  ]
    .filter(Boolean)
    .join('\n\n')
    + '\n'; // trailing newline

  return format(definitions, { parser: 'typescript', ...options.style });
}
