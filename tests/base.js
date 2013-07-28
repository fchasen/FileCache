module('Setup');

test("Storage detection gives values", 1, function() {
	var cache = new Manifest();

	ok( cache.getStorageMethod(), "Storage detected" );
});

test("Settings are applied", 1, function() {
	var cache = new Manifest({ storage: 'ram' });
	// console.log(cache);
	equal( cache.getStorageMethod(), "ram", "Storage overidden to 'ram'" );
});

var cache;

module('Auto', {
  setup: function() {
	 cache = new Manifest();
  }
});

asyncTest("Put a file to cache", 1, function() {
	cache.put('pages/testpage.html', function(e){
		ok(e, "File has loaded to cache");
		start();
	});
});

asyncTest("Put a file to cache", 1, function() {
	cache.put('pages/testpage.html', function(e){
		ok(e, "File has loaded to cache");
		start();
	});
});

asyncTest("Get a file from cache", 1, function() {

	cache.put('pages/testpage.html', function(){

		cache.get('pages/testpage.html', function(file){
			start();
			ok(file, "File retrieved");		
		});

	});


});

asyncTest("Get a image from cache", 1, function() {

	cache.put('imgs/storage-closet.png', function(e){
		
		
		cache.get('imgs/storage-closet.png', function(file){
			var image = document.createElement('img');

			
			image.src = file.toUrl();

			// document.getElementById("qunit-fixture").style.position = "static";
			// document.getElementById("qunit-fixture").appendChild(image);
			// stop();

			image.onload = function(e) {
				start();
				ok(e, "Image retrieved");
			}
					
		});

	});
});



asyncTest("Get text from cache", 2, function() {

	cache.put('pages/testpage.html', function(){
	
		cache.get('pages/testpage.html', function(text){
			
			start();
			ok(text, "Text found");
			equal(text.slice(0, 15), "<!DOCTYPE html>", "Text retrieved");	

		}, 'text');

	});
});


asyncTest("Get xml from cache", 1, function() {

	cache.put('pages/testpage.html', function(){
		
		cache.get('pages/testpage.html', function(xml){
			var isDoc = (xml.toString() == "[object Document]" || xml.toString() == "[object XMLDocument]");
			start();
			ok(isDoc, "XML retrieved");	
		}, 'xml');

	});

});

asyncTest("Get blob from cache", 1, function() {

	cache.put('pages/testpage.html', function(){

		cache.get('pages/testpage.html', function(blob){
			start();
			equal(blob.toString(), "[object Blob]", "Blob retrieved");	
		}, 'blob');

	});
});

asyncTest("urlOf file from cache", 1, function() {

	cache.put('pages/testpage.html', function(){

		cache.urlOf('pages/testpage.html', function(url){
			start();
			ok(url, "Url retrieved");	
		});

	});

});

asyncTest("Get a file not in the cache", 1, function() {

	cache.get('pages/derf.html', function(file){
		start();
		equal(file, false, "Cache miss");	
	});

});


asyncTest("Request a file not in the cache", 1, function() {

	cache.request('pages/defaultpage.html', function(file){
		ok(file.toUrl(), "file retrieved after cache miss");
		start();
	});

});


asyncTest("Remove a file from the cache", 3, function() {

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
