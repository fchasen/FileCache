(function() {
	
	var _URL = window.URL || window.webkitURL;    
	var _requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

	var filesystem = Manifest.Store.filesystem = function(settings, ready) {
		this._fs;
		this._settings = settings;

		this.open(ready);
	}

	filesystem.prototype.open = function(ready) {
		var filesystem = this;

		_requestFileSystem(this._settings.type,  this._settings.size, function(fs){
			filesystem._fs = fs;
			ready();
		}, this._error.bind(this));

	}

	filesystem.prototype.put = function(path, callback) {
		var fs = this;

		if(!this._fs) return false;

		this._request(path, function(file){
			fs.save(path, file, callback);
		});

	}

	filesystem.prototype.batch = function(path, callback) {
		var fs = this;

		if(!this._fs) return false;

		

	}

	filesystem.prototype.remove = function(path, callback) {
		var fs = this;

		if(!this._fs) return false;

		this._fs.root.getFile(path, {}, 
			function(fileEntry) {
				fileEntry.remove(callback, fs._settings.failed);
			}, 
			function(){
				callback(false);
			});

	}

	filesystem.prototype.removeAll = function(finished) {
		var fs = this,
			reader,
			count,
			after = function(){
				count--;
				if(count <= 0 && finished) finished(true);
			};
		

		if(!this._fs) return false;

		reader = this._fs.root.createReader();
		
		reader.readEntries(function(entries) {
			
			count = entries.length;

			for (var i = 0, entry; entry = entries[i]; ++i) {
				
				if (entry.isDirectory) {
					entry.removeRecursively(after, fs._error.bind(fs));
				} else {
					entry.remove(after, fs._error.bind(fs));
				}

			};

		});
	}	

	filesystem.prototype.retrieve = function(path, callback) {
		var fs = this;

		if(!this._fs) return false;

		this._fs.root.getFile(path, {}, 
			function(fileEntry) {
				
				var entry = new CacheFileFS(fileEntry);				

				callback(entry);
			}, 
			function(){
				callback(false);
			});

	}

	filesystem.prototype._request = function(path, callback) {
		var request = new Manifest.request(path);

		request.succeeded = callback;

		request.failed = this._settings.failed;

		request.start();
	}

	filesystem.prototype.save = function(path, file, callback) {
		var fs = this,
			base = path.split('/').slice(0,-1);
		
		this._createDir(this._fs.root, base);

		this._fs.root.getFile(path, {create: true}, function(fileEntry) {
				
			fileEntry.createWriter(function(fileWriter) {
			
			  fileWriter.onwriteend = callback;
			
			  fileWriter.onerror = fs._settings.failed;
						
			  fileWriter.write(file);
			 
			});
			  
		}, this._settings.failed );
	}

	filesystem.prototype._createDir = function(rootDirEntry, folders) {
		var fs = this;

		// Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
		if (folders[0] == '.' || folders[0] == '') {
			folders = folders.slice(1);
		}
	
		rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
			// Recursively add the new subfolder (if we still have another to create).
			if (folders.length) {
		  		fs._createDir(dirEntry, folders.slice(1));
			}
		}, this._settings.failed);
	}

	filesystem.prototype._error = function(err) {
		var error = _error(err);
		this._settings.failed(error);
	}

	function _error(err){
		switch (err.code) {
			case FileError.QUOTA_EXCEEDED_ERR:
			  return 'QUOTA_EXCEEDED_ERR';
			  break;
			case FileError.NOT_FOUND_ERR:
			  return 'NOT_FOUND_ERR';
			  break;
			case FileError.SECURITY_ERR:
			  return 'SECURITY_ERR';
			  break;
			case FileError.INVALID_MODIFICATION_ERR:
			  return 'INVALID_MODIFICATION_ERR';
			  break;
			case FileError.INVALID_STATE_ERR:
			  return 'INVALID_STATE_ERR';
			  break;
			case FileError.TYPE_MISMATCH_ERR:
			  return 'TYPE_MISMATCH_ERR';
			  break;
			default:
			  return err;
			  break;
	 	}
	}
	

	var CacheFileFS = Manifest.CacheFileFS = function(fileEntry) {
  		Manifest.CacheFile.call(this);

  		this._fileEntry = fileEntry;
	}

	CacheFileFS.prototype = Object.create(Manifest.CacheFile.prototype);
	CacheFileFS.prototype.constructor = CacheFileFS;


	CacheFileFS.prototype.toText = function(loaded){
		
		this._fileEntry.file(function(file) {
			var reader = new FileReader();

			reader.onloadend = function(e) {
				loaded(this.result);
			};

			reader.readAsText(file);

		}, this._error);
	}

	CacheFileFS.prototype.toBlob = function(loaded){

		this._fileEntry.file(function(file) {
			var reader = new FileReader();

			reader.onloadend = function(e) {
				var uInt8Array = new Uint8Array(this.result),
    				blob = new Blob([uInt8Array]);

				loaded(blob);
			};

			reader.readAsArrayBuffer(file);

		}, this._error);
	}

	CacheFileFS.prototype.toUrl = function(){
		if(this._url) return this._url;

		this._url = this._fileEntry.toURL();
		return this._url;
	}



	
    // console.log(Manifest.createWorkerUrl(Manifest.request))
    

    
   
    // var webWorker = new Worker(blobURL);
    // webWorker.onmessage = function(e) {
         
    // };
})();


