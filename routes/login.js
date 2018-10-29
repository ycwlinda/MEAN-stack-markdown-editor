var express = require('express');
var router = express.Router();


var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const assert = require('assert');
const secret = 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c';

router.get('/', function(req, res, next) {
	const collection = req.app.db.collection('Users');
	// match record
	collection.find({'username': req.query.username}).toArray(function(err, docs) {
		assert.equal(err, null);
		console.log("Found the following records");
		console.log(docs);
		// not found
		if(docs.length == 0){
			res.render('login', {
				username: req.query.username,
				redirect: req.query.redirect
			});
		}
		else {
			let hash = docs[0].password;
			bcrypt.compare(req.query.password, hash, function(error, result) {
				console.log(result);
				// not match
				if(!result){
					res.render('login', {
						username: req.query.username,
						redirect: req.query.redirect
					});
				}
				// match
				else{
					var token = jwt.sign({ 
						"exp": Math.floor(Date.now() / 1000) + (2 * 60 * 60), 
						"usr": req.query.username
					}, secret);
					res.cookie('jwt', token);
					res.redirect(req.query.redirect);
				}
				
			});
		}
	});
	
});

module.exports = router;