/**
 * Reads a source file that may (or may not) contain ES6 classes *or* arrow
 * functions, transforms them to ES5 compatible code using the pre-bundled ES6
 * visitors, and prints out the result.
 */

var fs = require('fs');
var jstransform = require('jstransform');
var utils = require('jstransform/src/utils');

var helper = require('../lib/helper.js')

var Syntax = jstransform.Syntax;
var knownLocs = [];


/**
 * Indicates if the node has a member expression
 * node should be a function node
 */
function fnBodyHasUneligibleExpr(node, path, state) {
	return helper.containsImmediateUneligibleExpr(node, node);
}


/**
 * functions that
 * - are named
 * - have a `this` binding
 * cannot be simplified to arrow functions
 */
function isUneligibleForArrow(node, path, state) {
	//TODO named functions are uneligible only if referenced
	return node.id
           //only for small funcs TODO: should be configurable
          || (node.loc.end.line - node.loc.start.line) > 3
          || fnBodyHasUneligibleExpr(node, path, state);
}

/**
 * Main Visitor.
 * Replace basic functions to es6 notation.
 * Named functions are ignored because we would need to determine if the name is used somewhere.
 */
function functionToArrowVisitor(traverse, node, path, state) {
  // HACK HACK HACK can't really tell why a node is being traversed twice
  // my guess is that when I call `traverse(fnBody.body, path, state);`
  // I'll enter the visitor again, and a second time because of the initial js parsing
  if(knownLocs.indexOf(node.loc) >=0) return; knownLocs.push(node.loc);

  //named functions can be referenced elsewhere, we don't want to change that
  if(isUneligibleForArrow(node, path, state)) return;

  //write params if any, then write arrow
  var renderFnParams = node.params.length
  	? helper.renderParams
  	: helper.renderNoParams;

  if(node.params.length) {
  	//utils.catchupWhiteOut(node.params[0].range[0], state);
  	utils.catchup(node.params[0].range[0], state, helper.elideString)
  }
  renderFnParams(traverse, node, path, state);

  //can we shorten the fn body?
  var fnBody = node.body,
     bodyLen = fnBody.body.length;

  //body is multiline
  if(bodyLen > 1) {
  	utils.catchup(node.body.range[0], state, helper.elideString)
  }
  //body is single line
  else if(bodyLen === 1) {
    //can it be like (a) => fn(a+b)?
    //or we should use a block?
  	utils.append('{', state);
  	utils.catchup(fnBody.body[0].range[0], state, helper.elideString);

    //hopefully we're removing the last ';' because we can't have that in parens free mode
  	traverse(fnBody.body, path, state);//this bugger is traversing same function twice!

    utils.append('}', state);
    //finally end the body
  	utils.catchupWhiteOut(node.body.range[1], state);
  }
  //no body
  else {
  	utils.catchupWhiteOut(node.body.range[0], state);
  }
}
functionToArrowVisitor.test = function(node, path, state) {
  return helper.isES5FunctionNode(node);
};

// module exports
exports.visitor = functionToArrowVisitor;