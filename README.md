FileCache
================================

FileCache is a cross browser library for dynamic file storage. It detects the storage capabilities of the browser and picks the best available option. 

Storage options are:

* Filesystem API (Chrome)
* indexedDB (Chrome, Firefox, IE)
* WebSQL (Safari/Safari Mobile)
* Ram (Works offline, but is temporary)

Getting Started
-------------------------

```javascript
var cache = new FileCache({});
```

Default Options:

```javascript
{
	size: 5*1024*1024,
	type: TEMPORARY,
	storage: null, // null == Auto Detect, Overides: filesystem | indexeddb | websql | ram
}
```

Methods
-------------------------

####put:
```javascript
cache.put("path/to/file.html", callback) // Adds one or many files to store
```
####remove:
```javascript
cache.remove("path/to/file.html", callback) // Removes one or many files from the store
```

####urlOf:
```javascript
cache.urlOf("path/to/file.html", callback) // Get a url to file from the cache
```
####get:
```javascript
cache.get("path/to/file.html", callback, "xml") // Get a file from the cache as: blob | text | xml
```

####request:
```javascript
cache.request("path/to/file.html", callback, "xml") // Get a file from the cache or network as: blob | text | xml 
```
####save:
```javascript
cache.save("path/to/file.html", blob, callback) // Saves / Replaces stored file with a blob
```

####expire:
```javascript
cache.expire(callback) // Removes all files
```