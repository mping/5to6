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
function simpleExprVisitor(traverse, node, path, state) {
	// HACK HACK HACK can't really tell why a node is being traversed twice
	// my guess is that when I call `traverse(fnBody.body, path, state);`
	// I'll enter the visitor again, and a second time because of the initial js parsing
	if(knownLocs.indexOf(node.loc) >=0) return; knownLocs.push(node.loc);

	//write params if any, then write arrow
	var renderFnParams = node.params.length
		? helper.renderParams
		: helper.renderNoParams;


	if(node.params.length) {
		utils.catchup(node.params[0].range[0], state, helper.elideString)
	}
	renderFnParams(traverse, node, path, state);

	var fnBody = node.body;
	switch(fnBody.body[0].type) {
		case Syntax.ReturnStatement:
			utils.append('(', state);
			//elide "return " string so we can convert it to
			utils.catchup(fnBody.body[0].range[0]+'return'.length+1, state, helper.elideString);

			//TODO: hopefully we're removing the last ';' because we can't have that in these exprs
			fnBody.body[0].range[1] = fnBody.body[0].range[1] -1;
			traverse(fnBody.body, path, state);

			utils.append(')', state);
			//finally end the body
			//utils.catchupWhiteOut(node.body.range[1], state);
			utils.catchup(node.body.range[1]+1, state, helper.elideString);

			break;

		case Syntax.ExpressionStatement:
			utils.append('(', state); //void is the proper transpiling, because the expression returns undefined
			utils.catchup(fnBody.body[0].range[0], state, helper.elideString);

			traverse(fnBody.body[0], path, state);

			utils.append(')', state);
			//finally end the body
			//utils.catchupWhiteOut(node.body.range[1], state);
			utils.catchup(node.body.range[1]+1, state, helper.elideString);
	}
}

simpleExprVisitor.test = function(node, path, state) {
	return node.type === Syntax.ArrowFunctionExpression
			&& node.body.body.length === 1
			&& (node.body.body[0].type === Syntax.ReturnStatement
				|| node.body.body[0].type === Syntax.ExpressionStatement)
			&& !isUneligibleForArrow(node, path, state);
};


exports.visitor = simpleExprVisitor;
