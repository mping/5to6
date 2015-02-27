/**
 * Reads a source file that may (or may not) contain ES6 classes *or* arrow
 * functions, transforms them to ES5 compatible code using the pre-bundled ES6
 * visitors, and prints out the result.
 */

var fs = require('fs');
var jstransform = require('jstransform');
var utils = require('jstransform/src/utils');

var Syntax = jstransform.Syntax;
var knownLocs = [];


function elideString(str) {
	return '';
}

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

function renderNoParams(traverse, node, path, state) {
	utils.append('() =>', state);
}


function containsImmediateUneligibleExpr(node, root) {
  var foundUneligible = false;

  function nodeTypeAnalyzer(n) {
  	if (n !== root && n.type === Syntax.FunctionExpression) {
  		//stop, the new function expression will be analyzed later
  		return false;
  	}

  	//TODO arguments are uneligible only if they are on top level
    if (n.type === Syntax.ThisExpression
    	|| (n.type === Syntax.Identifier && n.name === 'arguments')) {

      foundUneligible = true;
      return false; //stop
    }
  }

  function nodeTypeTraverser(child, path, state) {
    if (!foundUneligible) {
      foundUneligible = containsImmediateUneligibleExpr(child, root);
    }
  }
  utils.analyzeAndTraverse(
    nodeTypeAnalyzer,
    nodeTypeTraverser,
    node,
    []
  );
  return foundUneligible;
}

/**
 * Indicates if the node has a member expression
 * node should be a function node
 */
function fnBodyHasUneligibleExpr(traverse, node, path, state) {
	return containsImmediateUneligibleExpr(node, node);
}


/**
 * functions that
 * - are named
 * - have a `this` binding
 * cannot be simplified to arrow functions
 */
function isUneligibleForArrow(traverse, node, path, state) {
	//TODO named functions are uneligible only if referenced
	return node.id || fnBodyHasUneligibleExpr(traverse, node, path, state);
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
  if(isUneligibleForArrow(traverse, node, path, state)) return;

  //write params if any, then write arrow
  var renderFnParams = node.params.length
  	? renderParams
  	: renderNoParams;

  if(node.params.length) {
  	//utils.catchupWhiteOut(node.params[0].range[0], state);
  	utils.catchup(node.params[0].range[0], state, elideString)
  }
  renderFnParams(traverse, node, path, state);

  //can we shorten the fn body?
  var fnBody = node.body,
     bodyLen = fnBody.body.length;

  //body is multiline
  if(bodyLen > 1) {
  	utils.catchup(node.body.range[0], state, elideString)
  }
  //body is single line
  else if(bodyLen === 1) {
  	utils.append('{', state);
  	utils.catchup(fnBody.body[0].range[0], state, elideString);

  	//this bugger is traversing same function twice! check test.js
  	traverse(fnBody.body, path, state);

  	utils.append('}', state);
  	utils.catchupWhiteOut(node.range[1], state);
  }
  //no body
  else {
  	utils.catchupWhiteOut(node.body.range[0], state);
  }
}
functionToArrowVisitor.test = function(node, path, state) {
  return isES5FunctionNode(node);
};



/**
 * main entry point
 */
var visitors = [functionToArrowVisitor];

if(process.argv.length > 2) {
	var output = jstransform.transform(visitors, fs.readFileSync(process.argv[2], 'utf8').toString());
	process.stdout.write(output.code);
}
else {
	var stdin = process.stdin,
	    stdout = process.stdout,
	    inputChunks = [];

	stdin.resume();
	stdin.setEncoding('utf8');

	stdin.on('data', function (chunk) {
	    inputChunks.push(chunk);
	});

	stdin.on('end', function () {
	    var inputFile = inputChunks.join();
	    var output = jstransform.transform(visitors, inputFile);
	    //process.stdout.write(output.code);
	    console.log(output.code)
	});
}


