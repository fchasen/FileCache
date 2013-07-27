(function(root) {

	_URL = window.URL || window.webkitURL;

	var FileCache = root.FileCache = function(options) {
		
		var options = options || {};

		const TEMPORARY = TEMPORARY || 0;
		const PERSISTENT = PERSISTENT || 1;

		this.settings = {
			size: options.size || 5*1024*1024,
			type: options.type || TEMPORARY,
			storage: options.storage || null, // overide: filesystem | indexeddb | websql | ram
			workers: options.workers || "workers.js",
			failed: options.failed || this._error   
		}

		this._checkSupport();

		//-- Determine storage method
		if(!this.settings.storage) {
			this.settings.storage = this._determineStorageMethod();
		}

		this._isReady = false;
		this._inWaiting = [];

		this._urlCache = [];

		this._store = this._setStorage(this.settings.storage);
	}

	// Adds one or many files to store
	FileCache.prototype.put = function(path, callback) {
		var callback = callback || function(){};
		if(!this._isReady) return this._enqueue("put", arguments);

		if(Array.isArray(path)) {
			this._store.batch(path, callback);
		} else {
			this._store.put(path, callback);
		}
		
	}

	// Removes one or many files from the store
	FileCache.prototype.remove = function(path, callback) {
		var callback = callback || function(){};
		if(!this._isReady) return this._enqueue("remove", arguments);

		this._store.remove(path, callback);

	}
	
	// Get a url to file from the cache
	FileCache.prototype.urlOf = function(path, callback) {
		var callback = callback || function(){};
		if(!this._isReady) return this._enqueue("urlOf", arguments);

		if(path in this._urlCache) return callback(this._urlCache[path]);

		this.get(path, function(entry){
			this._urlCache[path] = entry.toUrl();
			callback(this._urlCache[path]);
		}.bind(this));

	}

	// Get a file from the cache as: blob | text | xml
	FileCache.prototype.get = function(path, callback, as) {
		var callback = callback || function(){};
		var file;

		if(!this._isReady) return this._enqueue("get", arguments);

		if( as === 'blob' ||
			as === 'text' ||
			as === 'xml') {

			this._store.retrieve(path, function(entry){
				var parser, xml;
				if(!entry) return callback(false);

				if(as === 'blob') entry.toBlob(callback);
				if(as === 'text') entry.toText(callback);
				if(as === 'xml') entry.toXml(callback);
			});

		} else {

			this._store.retrieve(path, callback);
		}

		
	} 

	// Get a file from the cache or network as: blob | text | xml 
	FileCache.prototype.request = function(path, callback, as) {
		var callback = callback || function(){};
		if(!this._isReady) return this._enqueue("request", arguments);

		this.get(path, function(result){
			if(result) return callback(result);

			this.put(path, function(){
				this.get(path, callback, as);
			}.bind(this));

		}.bind(this), as);

	}

	// Replaces stored file with a blob
	FileCache.prototype.save = function(path, blob, callback) {
		var callback = callback || function(){};
		if(!this._isReady) return this._enqueue("save", arguments);

		this._store.save(path, blob, callback);
	}

	// Removes all files
	FileCache.prototype.expire = function(callback) {
		var callback = callback || function(){};
		if(!this._isReady) return this._enqueue("expire", arguments);

		this._store.removeAll(callback);
	}

	// Removes all files
	FileCache.prototype.getStorageMethod = function(callback) {
		return this._storageMethod;
	}

	// Releases all cached Urls
	FileCache.prototype.tidy = function(callback) {
		
	}


	// PRIVATE

	FileCache.prototype._error = function(err) {
		console.error(err);	
	}

	FileCache.prototype._ready = function(err) {
		var cache = this;

		this._isReady = true;

		this._inWaiting.forEach(function(item){
			cache[item.command].apply(cache, item.arguments);
		});
	}

	FileCache.prototype._enqueue = function(command, arguments) {
		
		this._inWaiting.push({
			'command': command,
			'arguments': arguments
		});

	}
	
	FileCache.prototype._setStorage = function(storageMethod) {
		// console.log("storageMethod", storageMethod)		

		//-- Pick store type	
		if( !storageMethod || typeof(FileCache.Store[storageMethod]) == "undefined"){
			this._storageMethod = "none";	
			this.settings.storage = "none";
		}else{
			this._storageMethod = storageMethod;
		}

		//-- Create a new store of that type
		return new FileCache.Store[this._storageMethod](this.settings, this._ready.bind(this));

		

	}

	FileCache.prototype._determineStorageMethod = function() {
		var methods = ["filesystem", "indexeddb", "websql", "ram"],
			method = 'none';

		for ( var i = -1, len = methods.length; ++i < len; ){
			if ( this._supported[methods[i]] ) {
				method = methods[i];
				break;
			}
		}
		
		
		return method;
	}

	FileCache.prototype._checkSupport = function() {
		var support = "filesystem indexeddb websql ram".split(' '),
			toTest = "RequestFileSystem IndexedDB openDatabase URL".split(' ');

		this._supported = this._supported || {};


		for ( var t = -1, len = support.length; ++t < len; ){

			var test = support[t],
				method = toTest[t];

			this._supported[test] = this._testSupport(method);

		}

	}

	FileCache.prototype._testSupport = function(method) {
			var prefixes = ['webkit', 'moz', 'o', 'ms'];

			for ( var i = -1, len = prefixes.length; ++i < len; ){
				if ( window[prefixes[i] + method] ) return true;
			}
			return method in window;
	}

	FileCache.Store = {};

	//exports to multiple environments
  	if (typeof define === 'function' && define.amd)
		//AMD
		define(function(){ return FileCache; });
  	else if (typeof module != "undefined" && module.exports)
		//Node
		module.exports = FileCache;

})(this);

(function() {
	
	var CacheFile = FileCache.CacheFile = function(blob) {
		this._blob = blob;
		this._document;
		this._text;
		this._url;
	}

	CacheFile.prototype.toBlob = function(callback) {
		
		callback(this._blob);

	}

	CacheFile.prototype.toText = function(callback) {
		var reader = new FileReader();
		
		reader.onloadend = function(result){
			var text = result.target.result;
			callback(text);
		};
		
		reader.readAsText(this._blob);

	}

	CacheFile.prototype.toXml = function(callback) {
		var parser = new DOMParser(),
			xml;

		this.toText(function(text){
			xml = parser.parseFromString(text, "application/xml");
			callback(xml);
		});

	}

	CacheFile.prototype.toUrl = function() {
		if(this._url) return this._url;

		this._url = _URL.createObjectURL(this._blob);
		return this._url;
	}

	CacheFile.prototype._error = function(err) {
		console.error(err);	
	}

})();