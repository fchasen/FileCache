fileStorage.storage = function(override){

	this._supported = {},
	this._storageType = false;
	this._store = false;
	
	this.determineStorageMethod(override);

	return this;
}


fileStorage.storage.prototype.storageMethod = function(storageType) {
	console.log("storageMethod", storageType)		

	//-- Pick store type	
	if( !storageType || typeof(fileStorage.store[storageType]) == "undefined"){
		this._storageType = "none";	
	}else{
		this._storageType = storageType;
	}

	//-- Create a new store of that type
	this._store = new fileStorage.store[this._storageType];

	//-- Handle load errors
	this._store.failed = this._error;

}

fileStorage.storage.prototype.determineStorageMethod = function(override) {
	var methods = ["filesystem", "indexeddb", "websql", "ram"],
		method = 'none';

	this.checkSupport();

	if(override && (override == "none" || this._supported[override])){
		method = override;
	}else{
		for ( var i = -1, len = methods.length; ++i < len; ){
			if ( this._supported[methods[i]] ) {
				method = methods[i];
				break;
			}
		}
	}	
	
	this.storageMethod(method);
}

fileStorage.storage.prototype.get = function(what, path, callback) {
	return this._store.get(path, callback);
}

fileStorage.storage.prototype.batch = function(group, callback) {
	return this._store.batch(group, callback);
}

fileStorage.storage.prototype.getURL = function(path) {
	return this._store.getURL(path);
}

fileStorage.storage.prototype.getXML = function(path) {
	return this._store.getURL(path);
}

fileStorage.storage.prototype.getText = function(path) {
	return this._store.getURL(path);
}

fileStorage.storage.prototype.getBlob = function(path) {
	return this._store.getURL(path);
}

fileStorage.storage.prototype.save = function(path, file, callback) {
	return this._store.save(path, file, callback);
}

fileStorage.storage.prototype._error = function(err) {
	console.log("error", err);	
}

fileStorage.storage.prototype.getStorageType = function(){
	return this._storageType;	
}

fileStorage.storage.prototype.checkSupport = function() {
	var support = "filesystem indexeddb websql ram".split(' '),
		toTest = "RequestFileSystem IndexedDB openDatabase URL".split(' ');

	for ( var t = -1, len = support.length; ++t < len; ){

		var test = support[t],
			method = toTest[t];

		this._supported[test] = this.testSupport(method);

	}

}

fileStorage.storage.prototype.testSupport = function(method) {
		prefixes = ['webkit', 'moz', 'o', 'ms'];

		for ( var i = -1, len = prefixes.length; ++i < len; ){
			if ( window[prefixes[i] + method] ) return true;
		}
		return method in window;	

}