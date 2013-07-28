(function() {
	
	const DBNAME = "FileCache:"+window.location.origin;
	const DBVERSION = "";
	const DBDESC = "Cache for FileCache";
	const TABLENAME = "FileCache";

	var websql = Manifest.Store.websql = function(settings, ready) {
		this._db;
		this._settings = settings;

		this.open(ready);
	}

	websql.prototype.open = function(ready) {
		var wsql = this;

		this._db = openDatabase(DBNAME, DBVERSION, DBDESC, this._settings.size);
		
		if(!this._db){
			this._settings.failed("Database error");
			return;
		}

		this._db.transaction(function (tx) {
		  tx.executeSql('CREATE TABLE IF NOT EXISTS '+ TABLENAME +' (path TEXT PRIMARY KEY ASC UNIQUE, file BLOB, type TEXT)', 
		  	[], 
		  	ready,
		  	wsql._settings.failed);
		});

	}

	websql.prototype.put = function(path, callback) {
		var wsql = this;

		if(!this._db) return false;

		this._request(path, function(file){
			wsql.save(path, file, callback);
		});

	}

	websql.prototype.batch = function(path, callback) {
		var idb = this;

		if(!this._db) return false;	

	}

	websql.prototype.remove = function(path, callback) {
		var request = {};

		request.onsuccess = callback;
		request.onerror = this._settings.failed;

		this._db.transaction(function(tx){
			tx.executeSql("DELETE FROM "+TABLENAME+" WHERE path=?",
				[path],
				request.onsuccess,
				request.onerror);
		});

	}


	websql.prototype.removeAll = function(finished) {
		var wsql = this;

		this._db.transaction(function (tx) {
		  tx.executeSql('DROP TABLE '+ TABLENAME, [], function(){

		  	 tx.executeSql('CREATE TABLE IF NOT EXISTS '+ TABLENAME +' (path TEXT PRIMARY KEY ASC UNIQUE, file BLOB, type TEXT)', 
		  		[], 
		  		finished,
		  		wsql._settings.failed);

		  }, wsql._settings.failed);
		});

		
	}	

	websql.prototype.retrieve = function(path, callback) {
		var request = {};

		request.onerror = this._settings.failed;
		
		request.onsuccess = function(transaction, result) {
			var row, file, isText;

			if(result.rows.length){
				row = result.rows.item(0);
				isText = row.type.search("text") != -1;
				
				if(!row) return callback(false);		

				if(isText) {
					file = new Blob([row.file], {type: row.type});
				} else {
					file = FileCache.dataURLToBlob(row.file);
				}

				entry = new FileCache.CacheFile(file);
				callback(entry);
			} else {
				callback(false);
			}
			
		};

		this._db.transaction(function(tx){
			tx.executeSql("SELECT * FROM "+TABLENAME+" WHERE path=?  LIMIT 1",
				[path],
				request.onsuccess,
				request.onerror);
		});

	}

	websql.prototype.save = function(path, file, callback) {
		var sql = this,
			reader = new FileReader(),
			request = {},
			isText = file.type.search("text") != -1;

		request.onerror = this._settings.failed;

		request.onsuccess = callback;
		
		reader.onloadend = function(event){
			var fileString = event.target.result;

			sql._db.transaction(function(tx){
				tx.executeSql("REPLACE INTO "+TABLENAME+" (path, file, type) VALUES (?,?,?)",
					[path, fileString, file.type],
					request.onsuccess,
					request.onerror);
			});
							
			
		}

		if(isText) {
			reader.readAsText(file);
		} else {
			reader.readAsDataURL(file);
		}
		

		reader.onerror = this._settings.failed;

		

	}

	websql.prototype._request = function(path, callback) {
		var request = new FileCache.request(path);

		request.succeeded = callback;

		request.failed = this._settings.failed;

		request.start();
	}

	websql.prototype._error = function(err) {
		this._settings.failed(error);
	}
	

})();


