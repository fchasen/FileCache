module('IndexedDB');

asyncTest("Put a file to cache", 1, function() {

	var cache = new FileCache({ storage: 'indexeddb' });

	cache.put('pages/testpage.html', function(e){
		ok(e, "File has loaded to cache");
		start();
	})
});

asyncTest("Get a url from cache Entry", 1, function() {
	var cache = new FileCache({ storage: 'indexeddb' });

	cache.get('pages/testpage.html', function(file){
		start();
		ok(file, "File retrieved");		
	});
});


asyncTest("Get text from cache", 1, function() {
	var cache = new FileCache({ storage: 'indexeddb' });

	cache.get('pages/testpage.html', function(text){
		
		equal(text.slice(0, 15), "<!DOCTYPE html>", "Text retrieved");	

		start();

	}, 'text');

});



asyncTest("Get xml from cache", 1, function() {
	var cache = new FileCache({ storage: 'indexeddb' });

	cache.get('pages/testpage.html', function(xml){
		start();
		equal(xml.toString(), "[object XMLDocument]", "XML retrieved");	
	}, 'xml');
});

asyncTest("Get blob from cache", 1, function() {
	var cache = new FileCache({ storage: 'indexeddb' });

	cache.get('pages/testpage.html', function(blob){
		start();
		equal(blob.toString(), "[object Blob]", "Blob retrieved");	
	}, 'blob');
});

asyncTest("urlOf file from cache", 1, function() {
	var cache = new FileCache({ storage: 'indexeddb' });

	cache.urlOf('pages/testpage.html', function(url){
		start();
		ok(url, "Url retrieved");	
	});

});



asyncTest("Get a file not in the cache", 1, function() {
	var cache = new FileCache({ storage: 'indexeddb' });

	cache.get('pages/derf.html', function(file){
		start();
		equal(file, false, "Cache miss");	
	});

});


asyncTest("Request a file not in the cache", 1, function() {
	var cache = new FileCache({ storage: 'indexeddb' });

	cache.request('pages/defaultpage.html', function(file){
		ok(file.toUrl(), "file retrieved after cache miss");
		start();
	});

});



asyncTest("Remove a file from the cache", 3, function() {
	var cache = new FileCache({ storage: 'indexeddb' });

	// Add file
	cache.put('pages/testpage.html', function(e){
		start();
		ok(e, "File has loaded to cache");
		stop();

		// Then remove
		cache.remove('pages/testpage.html', function(){

			start();
			ok(true, "File has been removed");
			stop();

			// Then test
			cache.get('pages/testpage.html', function(file){
				start();
				equal(file, false, "Cache miss");	
			});

		});

	});

});


asyncTest("Save a file to the cache", 2, function() {
	var cache = new FileCache({ storage: 'indexeddb' });
	var blob = new Blob(['Hello World'], {type: 'text/plain'});

	cache.save('pages/helloword.txt', blob, function(result){
		start();
		ok(result, "File added");
		stop();

		cache.get('pages/helloword.txt', function(text){
			start();
			equal(text, "Hello World", "'Hello World' text retrieved");		
		}, 'text');

	});

});

asyncTest("Expire the cache", 3, function() {
	var cache = new FileCache({ storage: 'indexeddb' });
	// Add file
	cache.put('pages/testpage.html', function(e){
		start();
		ok(e, "File has loaded to cache");
		stop();

		// Then expire
		cache.expire(function(done){

			start();
			ok(done, "File has been removed");
			stop();

			// Then test
			cache.get('pages/testpage.html', function(file){
				start();
				equal(file, false, "Cache miss");	
			});

		});

	});

});