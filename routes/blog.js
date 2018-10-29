var express = require('express');
var router = express.Router();
const assert = require('assert');


router.get('/:username/:postid', function (req, res, next) {
	const collection = req.app.db.collection('Posts');
	
	collection.find({ "username": req.params.username, "postid": parseInt(req.params.postid) }).toArray(function (err, results) {
		assert.equal(err, null);
		
		console.log("Post with postid = " + req.params.postid + " by user " + req.params.username);
		console.log(results);
		
		res.render('blog', {
			username: req.params.username,
			posts: results,
			next: null
		});
	});
	
});

router.get('/:username', function (req, res, next) { 
	const collection = req.app.db.collection('Posts');
	// If there is a start id
	if (req.query.start != null) {
		//find posts with postid >= start	
		collection.find({ "username": req.params.username, "postid": {$gte: parseInt(req.query.start)} })
				  .toArray(function (err, results) {
			var docs = results;
			var next = null;
			if (results.length > 5){
				// return the first 5 elements
				var docs = results.slice(0, 5);	
				next = results[5].postid;
			}
			assert.equal(err, null);
			console.log("Posts starting from postid: " + req.query.start + " by user " + req.params.username);
			console.log(docs);
			
			res.render('blog', {
				username: req.params.username,
				posts: docs,
				next: next
			});
		});
	}
	else {
		collection.find({ 'username': req.params.username }).toArray(function (err, results) {
			var docs = results;
			var next = null;
			if (results.length > 5){
				// return the first 5 elements
				var docs = results.slice(0, 5);
				next = results[5].postid;
			}
			assert.equal(err, null);
			console.log("Posts of user " + req.params.username);
			console.log(docs);
			
			res.render('blog', {
				username: req.params.username,
				posts: docs,
				next: next
			});
		});
	}
	
});


// catch 404 and forward to error handler
router.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = router;