import { Injectable } from '@angular/core';



function getCookie(name: string): string {
	if (document.cookie.length > 0) {  // ...;jwt=value;...
		let start = document.cookie.indexOf(name + "=");  // ...;->jwt=value;...
  		if (start != -1) { 
    		start = start + name.length + 1;  // ...;jwt=->value;...
    		let end = document.cookie.indexOf(";", start);  // ...;jwt=value->;...
    		if (end == -1)
    			end = document.cookie.length;
    		return document.cookie.substring(start, end);  //value
   		} 
	}
	return "";
}
function parseJWT(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

@Injectable()
export class BlogService {
	private maxId: number;

	private posts: Post[];  // "memory cache" of all blog posts

	constructor() { 
		this.posts = new Array();
		this.fetchPosts();
	}

	// retrieve all blog posts of current user from server
	fetchPosts(): void {
		let token = getCookie('jwt');
		if(token != "") {
			//let username = jwt.decode(token).usr;
			let username = parseJWT(token).usr;
			let xmlhttp = new XMLHttpRequest();
			let blogService = this;		
			xmlhttp.onreadystatechange = function () {					
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					let fetchedPosts = JSON.parse(xmlhttp.responseText);
					for (let i = 0; i < fetchedPosts.length; i++) {
						blogService.posts.push(fetchedPosts[i]);
					}
				}				
			}
			xmlhttp.open("GET", "http://localhost:3000/api/" + username, true);
			xmlhttp.send();
		}
		else{
			console.log("it's here!!!");
			window.location.href = 'http://localhost:3000/login?redirect=/editor/';
		}
	}

	// Returns posts
	getPosts(): Post[] {
		console.log(this.posts);
		return this.posts;
	}

	// Find the post with postid=id from posts and return it
	getPost(id: number): Post {
		return this.posts.find(post => post.postid === id);
	}

	newPost(): Post {
		let token = getCookie('jwt');
		if(token != "") {
		    this.maxId = 0;
			for (let i = 0; i < this.posts.length; i++) {
	    		if (this.maxId < this.posts[i].postid) {
	    			this.maxId = this.posts[i].postid;
	    		}
	    	}
	    	console.log(this.maxId);
		    let newId = this.maxId + 1;
			let post = new Post(newId, "", "", new Date(), new Date());  // Create a new post
			this.posts.push(post);  // add it to posts

			// interact with server	
			let xmlhttp = new XMLHttpRequest();
			let blogService = this;		
			xmlhttp.onreadystatechange = function () {	
				if (xmlhttp.readyState == 4) {
					if (xmlhttp.status != 201) {
						console.log(xmlhttp.responseText);
						blogService.posts.pop();  // delete the newly created post from posts
						alert('There was an error creating a new post at the server!');
						window.location.href = '/';
					}  // do nothing if the response status code is "201 (Created)"
	    		}
			}
			//let username = jwt.decode(token).usr;
			let username = parseJWT(token).usr;
			let url = "http://localhost:3000/api/" + username + '/' + newId;
			xmlhttp.open("POST", url, true);
			xmlhttp.setRequestHeader("Content-Type", "application/json");
			let content = {title: "", body: ""};
			xmlhttp.send(JSON.stringify(content));
			return post;
		}
		return null;
	}

	updatePost(post: Post): void {
		let token = getCookie('jwt');
		if(token != "") {
			let postToUpdate = this.posts.find(p => p.postid === post.postid);  //return a reference of the object
			if (postToUpdate != undefined){
				postToUpdate.title = post.title;
				postToUpdate.body = post.body;
				postToUpdate.modified = new Date();

				// interact with server	
				let xmlhttp = new XMLHttpRequest();
				let blogService = this;		
				xmlhttp.onreadystatechange = function () {	
					if (xmlhttp.readyState == 4) {
						if (xmlhttp.status != 200) {
							alert('There was an error updating the post at the server!');
							window.location.href = '/edit/' + post.postid;
						}  // do nothing if the response status code is "200 (OK)"
		    		}
				}
				//let username = jwt.decode(token).usr;
				let username = parseJWT(token).usr;
				let url = "http://localhost:3000/api/" + username + '/' + post.postid;
				xmlhttp.open("PUT", url, true);
				xmlhttp.setRequestHeader("Content-Type", "application/json");
				let content = {title: post.title, body: post.body};
				xmlhttp.send(JSON.stringify(content));
			}
		}
	}

	deletePost(postid: number): void {
		let token = getCookie('jwt');
		if(token != "") {
			let deleteIndex = this.posts.findIndex(p => p.postid === postid);  //return a reference of the object
			if (deleteIndex != -1){
				this.posts.splice(deleteIndex, 1);

				// interact with server	
				let xmlhttp = new XMLHttpRequest();
				let blogService = this;		
				xmlhttp.onreadystatechange = function () {	
					if (xmlhttp.readyState == 4) {
						if (xmlhttp.status != 204) {
							alert('There was an error deleting the post at the server!');
							window.location.href = '/';
						}  // do nothing if the response status code is "204 (No content)"
		    		}
				}
				//let username = jwt.decode(token).usr;
				let username = parseJWT(token).usr;
				let url = "http://localhost:3000/api/" + username + '/' + postid;
				xmlhttp.open("DELETE", url, true);
				xmlhttp.send();
			}
		}
	}
}

export class Post {
	constructor(
		public postid: number,
		public title: string,
		public body: string,
		public created: Date,
		public modified: Date,
	) { }
}
