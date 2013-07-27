fileStorage.Queue = function(worker, concurrency){
	this._q = [];
	this._tasks = {};
	this.idCount = 0;
	this.concurrency = 0;

	this.workers = [];
	this.available = [];
	
	if(typeof(worker) === "string") {
		this.workerStr = worker;
		this.addWorkers(concurrency || 1);
	}
	
	if(typeof(worker) === "function") {
		this.workerFunction = worker;
		this.addFakeWorkers(concurrency || 1);
	}
	
}

fileStorage.Queue.prototype.addWorkers = function(concurrency){
	var min = this.concurrency,
		max = min + concurrency;
		
	//-- Stop running jobs or something?
	
	for(var i=min; i < concurrency; i++){
		var worker = new Worker(this.workerStr);
		this.workers.push(worker); //-- Add new work
		this.available.push(i);	//-- Make available to start tasks
	}
	
	this.concurrency = concurrency;

}

fileStorage.Queue.prototype.addFakeWorkers = function(concurrency){
	var min = this.concurrency,
		max = min + concurrency;

	//-- Stop running jobs or something?

	for(var i=min; i < concurrency; i++){
		var worker = new fileStorage.FakeWorker(this.workerFunction);
		this.workers.push(worker); //-- Add new work
		this.available.push(i);	//-- Make available to start tasks
	}
	
	this.concurrency = concurrency;
}

fileStorage.Queue.prototype.add = function(msg, callback, priority){
	var ID = this.idCount;
	//-- Add to task object : maybe check for dups
	this._tasks[ID] = {
		"msg": msg,
		"callback": callback || function(){}
	}
	
	//-- Add id to queue
	if(!priority){
		this._q.push(ID);
	}else{
		this._q.unshift(ID);
		if(!this.running) this.run();
	}
	
	//-- Increment ID for next task
	this.idCount++;
	
	
	
	return ID;
}

fileStorage.Queue.prototype.addGroup = function(group, callback){
	var that = this,
		counter = group.length,
		after = function(){
			counter--;
			if(counter <= 0) callback();
		};
		
	group.forEach(function(msg){
		that.add(msg, after);
	});

	if(!this.running) this.run();
	
	return after;
}

fileStorage.Queue.prototype.run = function(id){
	if(this.running) return;
	this.running = true;

	while(this.available.length) {
	  var next = this.next();
	  if(!next) break; //-- no tasks left or error
	}
	
}

fileStorage.Queue.prototype.find = function(msg){
	
}

fileStorage.Queue.prototype.next = function(){
	var that = this,
		curr = this._q.shift(),
		task, 
		workerID, 
		worker;

	if(typeof(curr) === "undefined"){
		//-- Nothing left on queue
		this.running = false;
		return false; 
	}
	
	task = this._tasks[curr];
	workerID = this.available.pop();
	worker = this.workers[workerID];
	
	//-- give worker new task
	worker.postMessage(task.msg);
	
	//-- listen for worker response
	worker.onmessage = function(e){
		var data = e.data;
		//console.log("data", data)
		task.callback(data);
		delete that._tasks[curr]; //-- Remove task
		
		that.available.push(workerID);
		that.next();
	}
	
	return worker;
}

fileStorage.Queue.prototype.empty = function(){
	this._q = [];
	this._tasks = {};
	//-- TODO: close workers
}

//-- A super simplistic fake worker, is passed a function instead of a script

fileStorage.FakeWorker = function(func){
	this.func = func;
}

fileStorage.FakeWorker.prototype.postMessage = function(msg){
	setTimeout(function(){
		this.func(msg, this.onmessage);
	}.bind(this), 1);
}

fileStorage.FakeWorker.prototype.onmessage = function(e){

}

fileStorage.FakeWorker.prototype.close = function(e){

}
