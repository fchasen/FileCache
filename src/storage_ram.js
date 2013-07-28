(function() {
	
	var _RAMSTORE = {};

	var ram = Manifest.Store.ram = function(settings, ready) {
		this._hash = _RAMSTORE;
		this._settings = settings;

		ready();

	}


	ram.prototype.put = function(path, callback) {
		var rs = this;

		if(!this._hash) return false;

		this._request(path, function(file){
			rs.save(path, file, callback);
		});

	}

	ram.prototype.batch = function(path, callback) {
		var idb = this;

		if(!this._db) return false;	

	}

	ram.prototype.remove = function(path, callback) {

		if(path in this._hash){
			delete this._hash[path];
			callback(true);
		} else {
			this._settings.failed;
		}

	}


	ram.prototype.removeAll = function(finished) {
		this._hash = _RAMSTORE = {};
		finished(true);
	}	

	ram.prototype.retrieve = function(path, callback) {
		var file;

		if(path in this._hash){
			file = this._hash[path].file;
			entry = new FileCache.CacheFile(file);
			callback(entry);
		} else {
			callback(false);
		}
			

	}

	ram.prototype.save = function(path, file, callback) {

		this._hash[path] = {
			path: path,
			file: file
		}

		callback(this._hash[path]);
		
	}

	ram.prototype._request = function(path, callback) {
		var request = new FileCache.request(path);

		request.succeeded = callback;

		request.failed = this._settings.failed;

		request.start();
	}

	ram.prototype._error = function(err) {
		this._settings.failed(error);
	}
	

})();


