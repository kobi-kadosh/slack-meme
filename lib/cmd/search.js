var express = require('express')
var request = require('request')
var querystring = require('querystring')
var fuse = require('fuse.js')

function exec(args, cb) {
	console.log(util.format('Searching for %s', args[1]))
	var query = {
		q: args[1],
		pageIndex: 0,
		pageSize: 5 
	}
	var url = this.Config.memegenerator.baseUrl + '/get_memes'; //+ '?' + querystring.stringify(query);
	console.info(util.format('search url %s', url))
	request.get(url, function (err, response, body) {
		
		var my_err = Error('meme search failed')
		if (err) { return cb(err) }
	  if (response.statusCode != 200) { return cb(my_err) }

	  var data = JSON.parse(body);
	  
	  // filter data using fuzzy search
	  
	  var options = {
		keys: ['name']
		}
		
		var f = new fuse(data.data.memes, options);
		var result = f.search(query.q);
	  
		data.data.memes = result;
	  
	  return cb(null,{ payload: data})
	});
}

function CmdSearch(Config) {
	this.Config = Config
}

CmdSearch.prototype.exec = exec
module.exports = CmdSearch
