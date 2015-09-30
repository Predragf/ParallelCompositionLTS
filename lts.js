var Transition = function (source, label, sink) {
	this.source = source;
	this.label = label;
	this.sink = sink;
}

var LTS = function (_initial, _states, _transitions) {
	this.initial = _initial || "";
	this.states = _states || [];
	this.transitions = _transitions || [];

	LTS.prototype.getAllTransitionsFromState = function(_state) {
	// body...
		var result = [];
		for (var i = this.transitions.length - 1; i >= 0; i--) {
			if (this.transitions[i].source != _state)
				continue;
			result.push(this.transitions[i]);
		}
		return result;
	};

}



exports.LTS = LTS;
exports.Transition = Transition;