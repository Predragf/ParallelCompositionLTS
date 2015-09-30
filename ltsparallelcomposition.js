require("./arrayoverrides.js");
var LTS = require("./lts.js").LTS;
var Transition = require("./lts.js").Transition;

//var processedStates;
//var processingState;
//var stateForProcessing;
//var newlyFormedState;
//var transitionLabel;

var ParallelComposition = function(){

	var _processedStates = [];
	var _statesForProcessing = [];

	function isProcessed(state) {
	return _processedStates.contains(state);
	}

	function addForProcessing(state) {
		if(!_statesForProcessing.contains(state)){
			_statesForProcessing.push()
		}
	}

	function makeNewState(first, second){
		return first + second;
	}

	function mergeTransitions(trans1, trans2){
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

	function getSinkForGivenTransition(transitions, label){
		for(var cntr in transitions){
			if(transitions[cntr].label == label){
				return transitions[cntr].sink;
			}
		}
		return null;
	}

	ParallelComposition.prototype.parallelCompositionWithSynchronization = function(lts1, lts2, synchChannels) {
	//reset the processedstates and statesforprocessing
	_processedStates = [];
	_statesForProcessing = [];
	var resultLts = new LTS();
	
	var stateForProcessing = makeNewState(lts1.initial, lts2.initial);
	_statesForProcessing.pushNewState(stateForProcessing);

	resultLts.initial = stateForProcessing;
	resultLts.states.pushNewState(stateForProcessing);
	var newlyFormedState;
	var transitionLabel;

	//infinite loop that will be terminated when no further states for processing will be available
	while(true){

		if(_statesForProcessing.length < 1){
			break;
		}
		
		stateForProcessing = _statesForProcessing.shift();

		//checks if the newstate is initialized to smth. If not, the while will break;
		//the state must also be 2 chars long, so if it is not 2 chars long, then it is an error.
		//this is for the sample implementation of the algorithm


		var transitionsLTS1 = lts1.getAllTransitionsFromState(stateForProcessing[0]);
		var transitionsLTS2 = lts2.getAllTransitionsFromState(stateForProcessing[1]);

		var allTransitionLabels = mergeTransitions(transitionsLTS1, transitionsLTS2);

		//merge transitions from for both states into one array
		//iterate through the transitions
		//if the transition is decorated with a synchronization label then both automata must make transition
		//if it is not synchronization label then they can make transition independently

		for (var counter = 0; counter < allTransitionLabels.length; counter++){

			transitionLabel = allTransitionLabels[counter];
			
			var firstSink = getSinkForGivenTransition(transitionsLTS1, transitionLabel);
			var secondSink = getSinkForGivenTransition(transitionsLTS2, transitionLabel);

			//case when the transition is decorated with a channel used for
			//synchronization between the LTS
			if(synchChannels.contains(transitionLabel)){
				
				//if for synch channel there is no sink state do nothing
				if(!firstSink || !secondSink){	

					transitionLabel = null;
					continue;
				}
			}

		//the case when the label at the transition is not used for synchronization with the channel
			else{

				if(!firstSink){
					firstSink = stateForProcessing[0];
				}
				if(!secondSink){
					secondSink = stateForProcessing[1];
				}
			}

		if(!transitionLabel){
			continue;
		}

		newlyFormedState = makeNewState(firstSink, secondSink);
		_processedStates.pushNewState(stateForProcessing);
		if(!_processedStates.contains(newlyFormedState)){
			_statesForProcessing.pushNewState(newlyFormedState);
		}

		resultLts.states.pushNewState(newlyFormedState);
		resultLts.transitions.pushNewTransition(new Transition(stateForProcessing, 
													transitionLabel, newlyFormedState));
		

		}
	}

	return resultLts;
};

ParallelComposition.prototype.optionalParallelSynchronization = function(lts1, lts2) {

	_processedStates = [];
	_statesForProcessing = [];
	var optionalSynchComposition = new LTS();

	var processingState = makeNewState(lts1.initial, lts2.initial);
	var newState;

	optionalSynchComposition.initial = processingState;
	optionalSynchComposition.states.pushNewState(processingState);
	_statesForProcessing.push(processingState);

	while(true){

		//while termination condition
		if(_statesForProcessing.length < 1){
			break;
		}
		
		//take the leftmost state for processing
		processingState = _statesForProcessing.shift();
		
		//state name is composed of 2 chars. first corresponds to the state from lts1 and the second corresponds to the
		//state from the second lts (lts2)

		var lts1State = processingState[0];
		var lts2State = processingState[1];

		//get outgoing transitions for both states
		var outgoindTransitionsLts1State = lts1.getAllTransitionsFromState(lts1State);
		var outgoindTransitionsLts2State = lts2.getAllTransitionsFromState(lts2State);

		var mergedTransitions = mergeTransitions(outgoindTransitionsLts1State, 
										outgoindTransitionsLts2State);

		for (var i = mergedTransitions.length - 1; i >= 0; i--) {

			var transitionLabel = mergedTransitions[i];

			var firstLTSSink = getSinkForGivenTransition(outgoindTransitionsLts1State, 
											transitionLabel);
			var secondLTSSink = getSinkForGivenTransition(outgoindTransitionsLts2State, 
											transitionLabel);

			//the case when states from both lts have the same label on the outgoing transition
			//create 3 new states: both transition, only first transitions, only second transitions
			if(firstLTSSink && secondLTSSink){
				

				//both transition
				newState = makeNewState(firstLTSSink, secondLTSSink);

				if(!_processedStates.contains(newState)){
					_statesForProcessing.pushNewState(newState);
				}
				optionalSynchComposition.states.pushNewState(newState);
				optionalSynchComposition.transitions.pushNewTransition(new Transition(processingState, 
																			transitionLabel, newState));

				//only first lts transitions

				newState = makeNewState(firstLTSSink, lts2State);

				if(!_processedStates.contains(newState)){
					_statesForProcessing.pushNewState(newState);
				}
				optionalSynchComposition.states.pushNewState(newState);
				optionalSynchComposition.transitions.pushNewTransition(new Transition(processingState, 
																			transitionLabel, newState));

				//only second transitions

				newState = makeNewState(lts1State, secondLTSSink);

				if(!_processedStates.contains(newState)){
					_statesForProcessing.pushNewState(newState);
				}
				optionalSynchComposition.states.pushNewState(newState);
				optionalSynchComposition.transitions.pushNewTransition(new Transition(processingState, 
																			transitionLabel, newState));

			}

			else{
				if(!firstLTSSink){
					firstLTSSink = lts1State;
				}

				if (!secondLTSSink){
					secondLTSSink = lts2State;
				};

				newState = makeNewState(firstLTSSink, secondLTSSink);

				if(!_processedStates.contains(newState)){
					_statesForProcessing.pushNewState(newState);
				}
				optionalSynchComposition.states.pushNewState(newState);
				optionalSynchComposition.transitions.pushNewTransition(new Transition(processingState, 
																			transitionLabel, newState));
			}
		}
		_processedStates.pushNewState(processingState);
	}
	return optionalSynchComposition;
};
}

exports.ParallelComposition = ParallelComposition;