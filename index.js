/**
 * Reads a source file that may (or may not) contain ES6 classes *or* arrow
 * functions, transforms them to ES5 compatible code using the pre-bundled ES6
 * visitors, and prints out the result.
 */

var fs = require('fs');
var jstransform = require('jstransform');
var fnToArrowVisitor = require('./visitors/functionToArrowVisitor').visitor;
var parensFreeVisitor = require('./visitors/parensFreeVisitor').visitor;


/**
 * main entry point
 */
var visitors = [fnToArrowVisitor, parensFreeVisitor];

// I prefer to ensure that jstransform re-parses the code
// otherwise the fnToArrow would have to generate a new ArrowFunctionExpression node
// and I don't know how to do it with jstransform
var applyVisitors = function(str) {
  return visitors.reduce(function(str, visitor){
    return jstransform.transform([visitor], str).code
  }, str);
}


// either process a file as argument or stdin
if(process.argv.length > 2) {
	process.stdout.write(applyVisitors(fs.readFileSync(process.argv[2], 'utf8').toString()));
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
	    var output = applyVisitors(inputFile);
	    //process.stdout.write(output.code);
	    console.log(output.code)
	});
}


