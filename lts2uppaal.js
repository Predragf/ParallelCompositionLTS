var LTS = require("./lts.js").LTS;
//var Transition = require("./lts.js").Transition;
var LTS2UPPAAL;

LTS2UPPAAL = function(){
	var _locationTemplate = "<location id='#locID'>\n<name>#locName</name>\n</location>\n"
	var _initLocationTemplate = "\n<init ref='#locID'/>"
	var _transitionTemplate ="\n<transition><source ref='#sourceID'/>\n<target ref='#sinkID'/>\n<label>#label</label></transition>\n"
	var _exportString = "<nta>\n<declaration>// Place global declarations here.</declaration>\n<template>\n<name>LTS</name>\n<declaration>// Place local declarations here.</declaration>#locations#transitions\n</template>\n<system>// Place template instantiations here.\nProcess = LTS();\n// List one or more processes to be composed into a system.\nsystem Process;</system>\n</nta>";
	
	function exportToFile(_string){
		var fs = require('fs');
		var d = new Date();
		var filename = d.getDate();
		fs.writeFile("./" + filename + ".xml", _string, function(err) {
    	if(err) {
        	return console.log(err);
    }

    console.log("The file was saved!");
}); 
	}

	LTS2UPPAAL.prototype.exportToUPPAALModel = function(lts) {

		if(!lts){
			return;
		}
		
		var locationsString = "";

		for (var i = lts.states.length - 1; i >= 0; i--) {
				var _state = lts.states[i];
				locationsString += _locationTemplate.replace("#locID", _state).replace("#locName", _state);
		};
		locationsString += _initLocationTemplate.replace("#locID", lts.initial);
		var transitionsString = "";

		for (var i = lts.transitions.length - 1; i >= 0; i--) {
			var  trans = lts.transitions[i];
			transitionsString += _transitionTemplate.replace("#sourceID", trans.source)
													.replace("#sinkID", trans.sink)
													.replace("#label", trans.label);
		};

		_exportString = _exportString.replace("#locations", locationsString)
							.replace("#transitions", transitionsString);
		exportToFile(_exportString);
		return _exportString; 
	};
}

module.exports.LTS2UPPAAL = LTS2UPPAAL;