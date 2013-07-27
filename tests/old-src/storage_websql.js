fileStorage.store = fileStorage.store || {};

fileStorage.store.websql = function() {
	var _blobs = {},
		_queue = new fileStorage.Queue(loader, 6),
		_db,
		_URL = window.URL || window.webkitURL;

	const DBNAME = "fileStoragejs_db";
	const DBVERSION = "1";
	const DBDESC = "cache for files";
	const DBSIZE =  5 * 1024 * 1024;
	const TABLENAME = "files";
	
	function loader(msg, postMessage){
		var e = {"data":null},
			path = msg;
		
		request(msg, function(file){
				save(path, file);
				postMessage(e);
		});

	}

	function opendb(callback){

		if(_db){
			callback(_db);
			return;
		}
		
		_db = openDatabase(DBNAME, DBVERSION, DBDESC, DBSIZE);
		
		if(!_db){
			console.error("Database error");
			return;
		}
		
		_db.transaction(function (tx) {
		  tx.executeSql('CREATE TABLE IF NOT EXISTS '+ TABLENAME +' (path TEXT PRIMARY KEY ASC UNIQUE, file BLOB, type TEXT)');
		  if(callback) callback(_db);
		});

	}

	function preload(path) {
		// var fromCache = check(path);
		// 
		// if(!fromCache){
		// 	_queue.add(path);
		// }
	}

	function batch(group, callback){
		_queue.addGroup(group, callback);
	}

	//-- Fetches url
	function get(path, callback) {

		if(typeof(_blobs[path]) != "undefined"){
			callback(_blobs[path]);
			return; 
		}

		check(path, function(fromCache){

			var url;
			if(fromCache){
				url = getURL(path, fromCache);
				if(typeof(callback) != "undefined"){
					callback(url);
				}
			}else{
				_queue.add(path, function(file){
					url = getURL(path, file);
					if(typeof(callback) != "undefined"){
						callback(url);
					}
				}, true);
			}

		});
		


	}

	function check(path, callback) {
		var	request = {};
		console.log("path", path)

		request.onError = function(event, err) {
		  console.log("get Error", err);

		  callback(false);
		};
		
		request.onSuccess = function(transaction, result) {
			var row;
			
			if(result.rows.length){
				row = result.rows.item(0);
				callback(row.file);
			}
			
		};
		
		opendb(function(db){
			
			db.transaction(function(tx){
				tx.executeSql("SELECT * FROM "+TABLENAME+" WHERE path='"+path+"' LIMIT 1",
					[],
					request.onSuccess,
					request.onError);
			});

		});

	}

	function request(path, callback) {
		var xhr = new fileStorage.core.loadFile(path, false, "arraybuffer");

		xhr.succeeded = function(file) {
			if(typeof(callback) != "undefined"){
				//console.log(file)
				callback(file);
			}
		}

		xhr.failed = _error;

		xhr.start();
	}

	function save(path, file) {
		var	request = {},
			reader = new FileReader(),
			fileString;
		 
		if(!(file instanceof Blob)) {
			console.log("Not blob")
		}
		
		reader.onload = function(event){
			fileString = event.target.result;

			opendb(function(db){
				db.transaction(function(tx){
					tx.executeSql("REPLACE INTO "+TABLENAME+" (path, file, type) VALUES (?,?,?)",
						[path, fileString, file.type],
						request.onSuccess,
						request.onError);
				});
							
			});
		}
		
		reader.onerror = function(err) {
			console.log("err", err)
		}
		
		reader.readAsDataURL(file);
		
		request.onError = function(event, err) {
		  console.log("failed: ", err);
		};
		
		request.onSuccess = function(event) {
		  //-- Do nothing for now
		  console.log("saved", path);
		};


		
		
	}

	function getURL(path, file){
		var url, blob;

		if(typeof(_blobs[path]) != "undefined"){
			callback(_blobs[path]);
			return; 
		}
		
		blob = fileStorage.core.dataURLToBlob(file); //go from data url to blob
		url = _URL.createObjectURL(blob);

		//-- need to revokeObjectURL previous urls, but only when cleaning cache
		// this.createdURLs.forEach(function(url){
		// 	this._URL.revokeObjectURL(url);
		// });

		_blobs[path] = url;

		return url;
	}

	function _error(err){
		if(typeof(this.failed) == "undefined"){
			console.log("Error: ", err);
		}else{
			this.failed(err);
		}
	}



	return {
		"get" : get,
		"preload" : preload,
		"batch" : batch,
		"getURL" : getURL,
		"save" : save
	}	
}
