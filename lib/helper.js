var jstransform = require('jstransform');
var utils = require('jstransform/src/utils');

var Syntax = jstransform.Syntax;

function elideString(str) {
	return '';
}

function isES5FunctionNode(node) {
  return node.type === Syntax.FunctionDeclaration
         || node.type === Syntax.FunctionExpression;
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


exports.elideString = elideString;
exports.renderParams = renderParams;
exports.renderNoParams = renderNoParams;
exports.isES5FunctionNode = isES5FunctionNode;
exports.containsImmediateUneligibleExpr = containsImmediateUneligibleExpr;