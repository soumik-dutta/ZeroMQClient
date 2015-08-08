var express = require('express');
var router = express.Router();
var zmq = require('zmq');
var subscriber = zmq.socket('sub');

/*
 * @request /ReqRespZMQClient simple req-res model
 */
router.get('/ReqRespZMQClient',function(req,res,next){
	// socket to talk to server
	console.log("Connecting to hello world server…");
	var requester = zmq.socket('req');

	var x = 0;
	/*
	 * @message event to send the server 
	 */
	requester.on("message", function(reply) {
//	  console.log("Received reply", x, ": [", reply.toString(), ']');
//	  x += 1;
//	  if (x === 10) {
//	    requester.close();
//	    process.exit(0);
//	  }
		console.log(reply.toString());
	  
	});

	requester.connect("tcp://localhost:5555");

//	for (var i = 0; i < 10; i++) {
//	  console.log("Sending request", i, '…');
//	  requester.send("Hello");
//	}
	var sendString={'classType':'Auth','name':'soumik','password':'root'};
	requester.send(JSON.stringify(sendString));

	process.on('SIGINT', function() {
	  requester.close();
	});
});


/*
 * @request /PubSubZMQClient simple Pub-sub implementation
 */
router.get('/PubSubZMQClient', function(req, res, next) {


	// weather update client in node.js
	// connects SUB socket to tcp://localhost:5556
	// collects weather updates and finds avg temp in zipcode

	

	console.log("Collecting updates from weather server…");

	// Socket to talk to server
	

	// Subscribe to zipcode, default is NYC, 10001
	var filter = null;
	if (process.argv.length > 2) {
	  filter = process.argv[2];
	} else {
	  filter = "10001";
	}
	console.log(filter);
	subscriber.subscribe(filter);

	// process 100 updates
	var total_temp = 0
	  , temps      = 0;
	subscriber.on('message', function(data) {
	  var pieces      = data.toString().split(" ")
	    , zipcode     = parseInt(pieces[0], 10)
	    , temperature = parseInt(pieces[1], 10)
	    , relhumidity = parseInt(pieces[2], 10);

	  temps += 1;
	  total_temp += temperature;

	  if (temps === 100) {
	    console.log([
	      "Average temperature for zipcode '",
	      filter,
	      "' was ",
	      (total_temp / temps).toFixed(2),
	      " F"].join(""));
	    total_temp = 0;
	    temps = 0;
	  }
	});

	subscriber.connect("tcp://localhost:5556");

});



module.exports = router;
