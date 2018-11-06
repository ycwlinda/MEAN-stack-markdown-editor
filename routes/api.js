var express = require('express');
var router = express.Router();

const assert = require('assert');

var jwt = require('jsonwebtoken');
const secret = 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c';

// db operations
const getPosts = function(collection, username, callback) {
	collection.find({"username": username}).toArray(function(err, posts) {
    callback(posts);
  });
}

const getPost = function(collection, username, postid, callback) {
	collection.findOne({ "username": username, "postid": parseInt(postid) })
	.then(callback);
}

const newPost = function(collection, post, callback) {
	collection.insertOne(post)
	.then(callback);
}

const updatePost = function(collection, post, callback) {
	collection.updateOne({"username": post.username, "postid": parseInt(post.postid)}, {$set: post})
	.then(callback);
}

const deletePost = function(collection, username, postid, callback) {
	collection.deleteOne({ "username": username, "postid": parseInt(postid) })
	.then(callback);
}

// middleware which deals with jwt
router.use('/:username', function(req, res, next) {
	let username = req.params.username;
	let token = req.cookies.jwt;
	if (!token) {
		res.sendStatus(401);  // Unauthorized
	} else {
		jwt.verify(token, secret, function(err, decoded) {
			if (err || username != decoded.usr){
				console.log(err);
				res.sendStatus(401);  // Unauthorized
			} else{
				console.log(username);
				console.log(decoded);
				next();
			}
		});
	}
});

// GET /api/:username: return all blog posts by username
router.get('/:username', function(req, res) {
	const collection = req.app.db.collection('Posts');
	getPosts(collection, req.params.username, function(posts) {
		res.status(200).json(posts);
	});
});

// GET /api/:username/:postid: return the blog post with postid by username
router.get('/:username/:postid', function(req, res) {
	const collection = req.app.db.collection('Posts');
	getPost(collection, req.params.username, req.params.postid, function(post) {
		if (post === null) {
			res.sendStatus(404);  // 404 (Not found)
		} else {
			res.status(200).json(post);
		}
    });
});

// POST /api/:username/:postid: insert a new blog post with username, postid, title, and body from the request
router.post('/:username/:postid', function(req, res) {
    const collection = req.app.db.collection('Posts');
    let username = req.params.username;
    let postid = req.params.postid;  //string
    getPost(collection, username, postid, function(post){
    	if (post != null) {
    		// a blog post with the same postid by username already exists in the server
    		// reply with "400 (Bad request)" status code
    		res.sendStatus(400); 
    	} else {
    		let post = new Object();
    		let currentTime = new Date();
    		post.postid = parseInt(postid);
    		post.username = username;
    		post.created = currentTime.getTime();
    		post.modified = currentTime.getTime();
    		post.title = req.body.title;
    		post.body = req.body.body;
    		newPost(collection, post, function(err, result) {
    			res.sendStatus(201); // Created
    		});
    	}
    });
});

// PUT /api/:username/:postid: update the existing blog post with postid by username with the title and body values from the request
router.put('/:username/:postid', function(req, res) {
	const collection = req.app.db.collection('Posts');
	let username = req.params.username;
	let postid = req.params.postid;
	getPost(collection, username, postid, function(post) {
		if (post === null) {
			// there is no blog post with postid by username
			res.sendStatus(400);  // Bad request
		} else {
			let currentTime = new Date();
			post.modified = currentTime.getTime();
			post.title = req.body.title;
			post.body = req.body.body;
			updatePost(collection, post, function(err, result) {
				res.sendStatus(200);  // OK
			});
		}
	});
});

// DELETE /api/:username/:postid: delete the existing blog post with postid by username from the database
router.delete('/:username/:postid', function(req, res) {
	const collection = req.app.db.collection('Posts');
	let username = req.params.username;
	let postid = req.params.postid;
	getPost(collection, username, postid, function(post) {
		if(post === null) {
			// there is no blog post with postid by username
		    res.sendStatus(400);
		} else {
			deletePost(collection, username, postid, function(err, result) {
				res.sendStatus(204); // No content
			});
		}
	});
});

module.exports = router;