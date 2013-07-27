(function() {
	 
	 var supportsURL = window.URL;
	 var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";

	//-- https://github.com/ebidel/filer.js/blob/master/src/filer.js#L128
	FileCache.dataURLToBlob = function(dataURL) {
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
	 
	FileCache.request = function(url, callback, responseType){
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
	 		xhr.responseType = BLOB_RESPONSE;
	 	
	 		xhr.onload = function(e) {
	 			if (this.status == 200) {	

	 				if(supportsURL) {
	 					that.succeeded(this.response);
	 				} else {
	 					//-- Safari doesn't support responseType blob, so create a blob from arraybuffer
	 					that.succeeded(new Blob([this.response]));
	 				}			 
	 				
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

	FileCache.createWorkerUrl = function(){
    	var workerCode = '';

    	Array.prototype.slice.call(arguments).forEach(function(func){
    		var content = func.toString();
    		content = content.substring("function () {".length+1);
    		content = content.substring(0, content.lastIndexOf("}"));
    		workerCode += content;
    	});
    	

    	return _URL.createObjectURL(new Blob([workerCode]));
    }

})();


