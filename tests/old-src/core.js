fileStorage.core = fileStorage.core || {};

//-- https://github.com/ebidel/filer.js/blob/master/src/filer.js#L128
fileStorage.core.dataURLToBlob = function(dataURL) {
	var BASE64_MARKER = ';base64,';
	if (dataURL.indexOf(BASE64_MARKER) == -1) {
	  var parts = dataURL.split(',');
	  var contentType = parts[0].split(':')[1];
	  var raw = parts[1];

	  return new Blob([raw], {type: contentType});
	}

	var parts = dataURL.split(BASE64_MARKER);
	var contentType = parts[0].split(':')[1];
	var raw = window.atob(parts[1]);
	var rawLength = raw.length;

	var uInt8Array = new Uint8Array(rawLength);

	for (var i = 0; i < rawLength; ++i) {
	  uInt8Array[i] = raw.charCodeAt(i);
	}

	return new Blob([uInt8Array], {type: contentType});
 }
 
 fileStorage.core.loadFile = function(url, callback, responseType){
 	var xhr = new XMLHttpRequest();
 
 	this.succeeded = function(response){
 		if(callback){
 			callback(response);
 		}
 	}
 
 	this.failed = function(err){
 		console.log("Error:", err);
 	}
 
 	this.start = function(){
 		var that = this;
 
 		xhr.open('GET', url, true);
 		xhr.responseType = 'blob';
 
 		xhr.onload = function(e) {
 			if (this.status == 200) {		 			 
 				that.succeeded(this.response);
 			}
 		};
 
 		xhr.onerror = function(e) {
 			that.failed(this.status); //-- TODO: better error message
 		};
 
 		xhr.send();
 	}
 
 	return {
 		"start": this.start,
 		"succeeded" : this.succeeded,
 		"failed" : this.failed
 	}
 }