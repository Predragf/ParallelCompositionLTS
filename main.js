require("./arrayoverrides.js");
var LTS = require("./lts.js").LTS;
var Transition = require("./lts.js").Transition;
var ParallelComposition = require("./ltsparallelcomposition.js").ParallelComposition;
var LTS2UPPAAL = require("./lts2uppaal.js").LTS2UPPAAL;

function main(){

	var parallelComposition = new ParallelComposition();

	var lts1 = new LTS('k', ['k', 'l', 'm'], 
		[new Transition('k', 'a', 'l'),new Transition('l', 'b', 'm'), 
			new Transition('m', 'c', 'l'), new Transition('m', 'd', 'k')]);

	var lts2 = new LTS('x', ['x', 'y', 'z'], 
		[new Transition('x', 'a', 'y'),new Transition('y', 'b', 'z'), 
			new Transition('z', 'f', 'y'), new Transition('z', 'e', 'x')]);

	var opt = parallelComposition.optionalParallelSynchronization(lts1, lts2)

	var pComp = parallelComposition.parallelCompositionWithSynchronization(lts1, lts2, ["a","b"]);

	var lts2Uppaal = new LTS2UPPAAL();

	
	console.log("First LTS: \n")
	console.log(lts1);
	console.log("--------------------------")
	console.log("Second LTS: \n")
	console.log(lts2);

	console.log("--------------------------")
	console.log("parallel composition synchronized over [a,b]: \n")
	console.log(pComp);

	console.log("--------------------------")
	console.log("Optional parallel composition result: \n")
	console.log(opt);

	console.log(lts2Uppaal.exportToUPPAALModel(pComp));
}

main();