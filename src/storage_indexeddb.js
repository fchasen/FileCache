(function() {
	
	_indexedDB  = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

	const DBNAME = "FileCache:"+window.location.origin;

	var indexeddb = FileCache.Store.indexeddb = function(settings, ready) {
		this._db;
		this._settings = settings;

		this.open(ready);
	}

	indexeddb.prototype.open = function(ready) {
		var idb = this,
			request;

		request = _indexedDB.open(DBNAME);

		request.onsuccess = function(event) {

		  this._db = request.result;

		  this._db.onerror = this._settings.failed;

		  ready();

		}.bind(this);


		request.onerror = this._settings.failed;


		request.onupgradeneeded = function(event) {		
		  var db = event.target.result,
		  	  objectStore = db.createObjectStore("FileCache", { keyPath: "path" });
		};

	}

	indexeddb.prototype.put = function(path, callback) {
		var idb = this;

		if(!this._db) return false;

		this._request(path, function(file){
			idb.save(path, file, callback);
		});

	}

	indexeddb.prototype.batch = function(path, callback) {
		var idb = this;

		if(!this._db) return false;	

	}

	indexeddb.prototype.remove = function(path, callback) {
		var idb = this,
			transaction = this._db.transaction(["FileCache"], "readwrite"),
			store = transaction.objectStore("FileCache"),
			request = store.delete(path);

		request.onerror = this._settings.failed;

		request.onsuccess = callback;
	}


	indexeddb.prototype.removeAll = function(finished) {
		var idb = this,
			transaction = this._db.transaction(["FileCache"], "readwrite"),
			store = transaction.objectStore("FileCache"),
			request;

		request = store.openCursor();
		request.onsuccess = function(evt) {
			var cursor = evt.target.result,
				file;

			if (cursor) {

				file = store.delete(cursor.key);

        		file.onsuccess = function (evt) {
        			// console.log(evt.target.result)
        		}

				cursor.continue();
			} else {

				if(finished) finished(true);

			}
		}
	}	

	indexeddb.prototype.retrieve = function(path, callback) {
		var idb = this,
			objectStore = this._db.transaction(["FileCache"]).objectStore("FileCache");
			request = objectStore.get(path);

		request.onerror = this._settings.failed;

		request.onsuccess = function(event) {
			var file = request.result ? request.result.file : false,
				entry;

			if(!file) {
				callback(false);
			}else{
				entry = new FileCache.CacheFile(file);
			  	callback(entry);
			}

		}.bind(this);

	}

	indexeddb.prototype._request = function(path, callback) {
		var request = new FileCache.request(path);

		request.succeeded = callback;

		request.failed = this._settings.failed;

		request.start();
	}

	indexeddb.prototype.save = function(path, file, callback) {
		var idb = this,
			transaction = this._db.transaction(["FileCache"], "readwrite"),
			store = transaction.objectStore("FileCache"),
			entry = {"path" : path, "file": file},
			request = store.put(entry);

		request.onerror = this._settings.failed;

		request.onsuccess = callback;
	}


	indexeddb.prototype._error = function(err) {
		this._settings.failed(error);
	}
	

})();


