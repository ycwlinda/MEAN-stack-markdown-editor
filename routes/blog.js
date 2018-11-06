var express = require('express');
var router = express.Router();
var commonmark = require('commonmark');
const assert = require('assert');

const markdownRender = function(post) {
	var reader = new commonmark.Parser();
	var writer = new commonmark.HtmlRenderer();
	var parsed = reader.parse(post.title);
	renderedTitle = writer.render(parsed);
	parsed = reader.parse(post.body);
	renderedBody = writer.render(parsed);
	return [renderedTitle, renderedBody]
}

const getPosts = function(collection, username, callback) {
	collection.find({"username": username}).toArray(function(err, posts) {
    callback(posts);
  });
}

const getPost = function(collection, username, postid, callback) {
	collection.findOne({ "username": username, "postid": parseInt(postid) })
	.then(callback);
}

//GET blog
router.get('/:username/:postid', function(req, res, next) {
	const collection = req.app.db.collection('Posts');
	getPost(collection, req.params.username, req.params.postid, function(post) {
		if (post != null) {
			let renderedPosts = new Array();
			renderedPosts[0] = post;
			rendered = markdownRender(renderedPosts[0]);
			renderedPosts[0].title = renderedTitle;
			renderedPosts[0].body = renderedBody;
		    res.status(200);
			res.render('blog', {
				username: req.params.username,
				posts: renderedPosts,
				next: null
			});		    
		} else {
			res.status(404);
			res.send("There is no post to fetch.");
		}
	 });
});

const PostNum = 5;  // number of posts shown on one page

//GET blogs
router.get('/:username', function(req, res, next) {
	const collection = req.app.db.collection('Posts');
	getPosts(collection, req.params.username, function(posts) {
    	let startid = req.query.start;
    	if (startid === undefined) {
    		startid = 1;
    	}
	  
    	// find the index of the post with startid in the posts array
    	let i = 0;
    	for (; i < posts.length; i++) {
    		if (posts[i].postid >= startid) {
    			break;
    		}
    	}

    	let next = null;
    	if (i + PostNum < posts.length){ 
    		// has next page
    		next = posts[i + PostNum].postid;
    	}
    	let slicedPosts = posts.slice(i, i + PostNum);
    	let renderedPosts = new Array();
    	for (let i = 0; i < slicedPosts.length; i++){
    		renderedPosts[i] = slicedPosts[i];   		
			rendered = markdownRender(slicedPosts[i]);
    		renderedPosts[i].title = renderedTitle;
    		renderedPosts[i].body = renderedBody;
    	}
	
    	res.render('blog', {
    		username: req.params.username,
    		posts: renderedPosts,
			next: next
		});
    });
});

module.exports = router;