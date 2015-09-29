require("./arrayoverrides.js");

//var processedStates;
//var processingState;
//var stateForProcessing;
//var newlyFormedState;
//var transitionLabel;

exports.LTS = function LTS(_initial, _states, _transitions) {
	var lts = {
		initial: _initial || "",
		states: _states || [],
		transitions: _transitions || []
	}
	return lts;
}

exports.Transition = function Transition(source, label, sink) {
	var transition = {
		source: source,
		label: label,
		sink: sink
	}
	return transition;
}

exports.isProcessed = function isProcessed(state, processedStates) {
	return processedStates.contains(state);
}

exports.addForProcessing = function addForProcessing(state, statesForProcessing) {
	if(!statesForProcessing.contains(state)){
		statesForProcessing.push()
	}
}

exports.getAllTransitionsFromState = function getAllTransitionsFromState(state, lts) {
	var result = [];
	for (var i = lts.transitions.length - 1; i >= 0; i--) {
		if (lts.transitions[i].source != state)
			continue;
		result.push(lts.transitions[i]);
	}
	return result;
}

exports.makeNewState = function makeNewState(first, second){
	return first + second;
}

exports.mergeTransitions = function mergeTransitions(trans1, trans2){
	var result = [];
	
	for (var i = 0; i < trans1.length; i++){
		result.push(trans1[i].label)
	}

	for (var j = 0; j < trans2.length; j++){
		if(result.contains(trans2[j].label)){
			continue;
		}
	result.push(trans2[j].label)
	}

	return result;
}

exports.getSinkForGivenTransition = function getSinkForGivenTransition(transitions, label){
	for(var cntr in transitions){
		if(transitions[cntr].label == label){
			return transitions[cntr].sink;
		}
	}
	return null;
}

