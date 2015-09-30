require("./arrayoverrides.js");
var compositionHelper = require("./compositionhelper");

function parallelComposition(lts1, lts2, synchChannels) {

	var processedStates = [];
	var statesForProcessing = [];
	var resultLts = compositionHelper.LTS();
	
	var stateForProcessing = compositionHelper.makeNewState(lts1.initial, lts2.initial);
	statesForProcessing.pushNewState(stateForProcessing);

	resultLts.initial = stateForProcessing;
	resultLts.states.pushNewState(stateForProcessing);
	var newlyFormedState;
	var transitionLabel;

	//infinite loop that will be terminated when no further states for processing will be available
	while(true){

		if(statesForProcessing.length < 1){
			break;
		}
		
		stateForProcessing = statesForProcessing.shift();

		//checks if the newstate is initialized to smth. If not, the while will break;
		//the state must also be 2 chars long, so if it is not 2 chars long, then it is an error.
		//this is for the sample implementation of the algorithm


		var transitionsLTS1 = compositionHelper.getAllTransitionsFromState(stateForProcessing[0], lts1);
		var transitionsLTS2 = compositionHelper.getAllTransitionsFromState(stateForProcessing[1], lts2);

		var allTransitionLabels = compositionHelper.mergeTransitions(transitionsLTS1, transitionsLTS2);

		//merge transitions from for both states into one array
		//iterate through the transitions
		//if the transition is decorated with a synchronization label then both automata must make transition
		//if it is not synchronization label then they can make transition independently

		for (var counter = 0; counter < allTransitionLabels.length; counter++){

			transitionLabel = allTransitionLabels[counter];
			
			var firstSink = compositionHelper.getSinkForGivenTransition(transitionsLTS1, transitionLabel);
			var secondSink = compositionHelper.getSinkForGivenTransition(transitionsLTS2, transitionLabel);

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

		newlyFormedState = compositionHelper.makeNewState(firstSink, secondSink);
		processedStates.pushNewState(stateForProcessing);
		if(!processedStates.contains(newlyFormedState)){
			statesForProcessing.pushNewState(newlyFormedState);
		}
		resultLts.states.pushNewState(newlyFormedState);
		resultLts.transitions.pushNewTransition(compositionHelper.
							Transition(stateForProcessing, transitionLabel, newlyFormedState));
		

		}
	}

	return resultLts;
}

function optionalParallelSynchronization(lts1, lts2){

	var _processedStates = [];
	var _statesForProcessing = [];
	var optionalSynchComposition = compositionHelper.LTS();

	var processingState = compositionHelper.makeNewState(lts1.initial, lts2.initial);
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
		var outgoindTransitionsLts1State = compositionHelper.getAllTransitionsFromState(lts1State, lts1);
		var outgoindTransitionsLts2State = compositionHelper.getAllTransitionsFromState(lts2State, lts2);

		var mergedTransitions = compositionHelper.mergeTransitions(outgoindTransitionsLts1State, 
										outgoindTransitionsLts2State);

		for (var i = mergedTransitions.length - 1; i >= 0; i--) {

			var transitionLabel = mergedTransitions[i];

			var firstLTSSink = compositionHelper.getSinkForGivenTransition(outgoindTransitionsLts1State, 
											transitionLabel);
			var secondLTSSink = compositionHelper.getSinkForGivenTransition(outgoindTransitionsLts2State, 
											transitionLabel);

			//the case when states from both lts have the same label on the outgoing transition
			//create 3 new states: both transition, only first transitions, only second transitions
			if(firstLTSSink && secondLTSSink){
				

				//both transition
				newState = compositionHelper.makeNewState(firstLTSSink, secondLTSSink);

				if(!_processedStates.contains(newState)){
					_statesForProcessing.pushNewState(newState);
				}
				optionalSynchComposition.states.pushNewState(newState);
				optionalSynchComposition.transitions.pushNewTransition(compositionHelper.
									Transition(processingState, transitionLabel, newState));

				//only first lts transitions

				newState = compositionHelper.makeNewState(firstLTSSink, lts2State);

				if(!_processedStates.contains(newState)){
					_statesForProcessing.pushNewState(newState);
				}
				optionalSynchComposition.states.pushNewState(newState);
				optionalSynchComposition.transitions.pushNewTransition(compositionHelper.
									Transition(processingState, transitionLabel, newState));

				//only second transitions

				newState = compositionHelper.makeNewState(lts1State, secondLTSSink);

				if(!_processedStates.contains(newState)){
					_statesForProcessing.pushNewState(newState);
				}
				optionalSynchComposition.states.pushNewState(newState);
				optionalSynchComposition.transitions.pushNewTransition(compositionHelper.
									Transition(processingState, transitionLabel, newState));

			}

			else{
				if(!firstLTSSink){
					firstLTSSink = lts1State;
				}

				if (!secondLTSSink){
					secondLTSSink = lts2State;
				};

				newState = compositionHelper.makeNewState(firstLTSSink, secondLTSSink);

				if(!_processedStates.contains(newState)){
					_statesForProcessing.pushNewState(newState);
				}
				optionalSynchComposition.states.pushNewState(newState);
				optionalSynchComposition.transitions.pushNewTransition(compositionHelper.
									Transition(processingState, transitionLabel, newState));
			}
		}
		_processedStates.pushNewState(processingState);
	}
	return optionalSynchComposition;
}

function main(){

	var lts1 = compositionHelper.LTS('k', ['k', 'l', 'm'], 
		[compositionHelper.Transition('k', 'a', 'l'),compositionHelper.Transition('l', 'b', 'm'), 
			compositionHelper.Transition('m', 'c', 'l'), compositionHelper.Transition('m', 'd', 'k')]);

	var lts2 = compositionHelper.LTS('x', ['x', 'y', 'z'], 
		[compositionHelper.Transition('x', 'a', 'y'),compositionHelper.Transition('y', 'b', 'z'), 
			compositionHelper.Transition('z', 'f', 'y'), compositionHelper.Transition('z', 'e', 'x')]);

	var opt = optionalParallelSynchronization(lts1, lts2)

	var pComp = parallelComposition(lts1, lts2, ["a","b"]);
	
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
	
	var flag = false;
	for (var i = opt.transitions.length - 1; i >= 0; i--) {
		var trans = opt.transitions[i];
		if(!opt.states.contains(trans.source) || 
			!opt.states.contains(trans.sink)){
			flag = true;
		}
	};

	console.log(flag ? "there was an error" : "there was no error");
}

main();