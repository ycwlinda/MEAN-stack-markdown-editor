var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const assert = require('assert');
const secret = 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c';

router.get('/', function(req, res, next) {
	res.render('login', {
		username: req.query.username,
		redirect: req.query.redirect
	});
});

router.post('/', function(req, res, next) {
	const collection = req.app.db.collection('Users');
	// match record
	collection.find({'username': req.body.username}).toArray(function(err, docs) {
		assert.equal(err, null);
		console.log("Found the following records");
		console.log(docs);
		// not found
		if (docs.length == 0){
			res.status(401).render('login', {
				username: req.body.username,
				redirect: req.body.redirect
			});
		} else {
			let hash = docs[0].password;
			bcrypt.compare(req.body.password, hash, function(error, result) {
				console.log(result);
				// not match
				if (!result){
					res.status(401).render('login', {
						username: req.body.username,
						redirect: req.body.redirect
					});
				}
				// match
				else{
					var token = jwt.sign({ 
						"exp": Math.floor(Date.now() / 1000) + 2 * 60 * 60, 
						"usr": req.body.username
					}, secret);
					res.cookie('jwt', token);
					
					if(req.body.redirect != null && req.body.redirect.length > 0){
						res.status(200).redirect(req.body.redirect);
					}else{
						res.status(200).render('index', { title: req.body.username }); // if successful render a html page said welcome
					}
					
				}
				
			});
		}
	});
	
});

module.exports = router;