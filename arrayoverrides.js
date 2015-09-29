Array.prototype.contains = function(element) {
	if(!element)
	{
		return false;
	}
	for (var e in this) {
		var arrayElement = this[e];
		if(element == arrayElement) {
			return true;
		}
		//this is introduced to check the reverse names of states, since state AB is equal to state BA
		if(((typeof arrayElement) == "string") && ( element == arrayElement.split('').reverse().join(''))){
			return true;
		}
	}
	return false;
}

Array.prototype.pushNewState = function(newState){
	if(!this.contains(newState)){
		this.push(newState);
	}
}

Array.prototype.pushNewTransition = function(_trans){
	var flag = false;
	for (var i = 0; i < this.length; i++){
		if(this[i].label == _trans.label &&
			this[i].source == _trans.source &&
				this[i].sink == _trans.sink){
			flag = true;
		}
	}

	if(!flag){
		this.push(_trans);
	}
}

Array.prototype.merge = function(secondArray){
	for (var element in secondArray){
		if(this.contains(secondArray[element])){
			continue;
		}
		this.push(secondArray[element]);
	}
}