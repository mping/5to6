/**
 * Reads a source file that may (or may not) contain ES6 classes *or* arrow
 * functions, transforms them to ES5 compatible code using the pre-bundled ES6
 * visitors, and prints out the result.
 */

var fs = require('fs');
var jstransform = require('jstransform');
var utils = require('jstransform/src/utils');

var Syntax = jstransform.Syntax;

function isES5FunctionNode(node) {
  return node.type === Syntax.FunctionDeclaration
         || node.type === Syntax.FunctionExpression;
}

function isParensFreeSingleParam(node, state) {
  return node.params.length === 1 &&
    state.g.source[state.g.position] !== '(';
}

function renderParams(traverse, node, path, state) {
  utils.append('(', state);
  if (node.params.length !== 0) {
    path.unshift(node);
    traverse(node.params, path, state);
    path.unshift();
  }
  utils.append(') => ', state);
}


/**
 * Main Visitor.
 * Replace basic functions to es6 notation.
 * Named functions are ignored because we would need to determine if the name is used somewhere.
 */
function functionToArrowVisitor(traverse, node, path, state) {
  //named functions can be referenced elsewhere, we don't want to change that
  if(node.id) return;

  //write params if any, then write arrow
  if(node.params.length) {
  	utils.catchupWhiteOut(node.params[0].range[0], state);
  	renderParams(traverse, node, path, state);
  	utils.catchupWhiteOut(node.body.range[0], state);
  } else {
  	utils.append('() =>', state);
  	utils.catchupWhiteOut(node.body.range[0], state);
  }
}
functionToArrowVisitor.test = function(node, path, state) {
  return isES5FunctionNode(node);
};


var transformedFileData = jstransform.transform(
  [functionToArrowVisitor],
  fs.readFileSync(process.argv[2], 'utf8').toString()
);

console.log(transformedFileData.code);
