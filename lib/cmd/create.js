var express = require('express')
var request = require('request')
var querystring = require('querystring')
var urlUtil = require('url')

function isInt(n){
	return Number(n)===n && n%1===0;
}

/*
{
    "success": true,
    "result": {
        "generatorID": 45,
        "displayName": "Insanity Wolf",
        "urlName": "Insanity-Wolf",
        "totalVotesScore": 0,
        "imageUrl": "http://cdn.meme.am/images/400x/20.jpg",
        "instanceID": 58450119,
        "text0": "push a hipster down the stairs",
        "text1": "now look who's tumbling",
        "instanceImageUrl": "http://cdn.meme.am/instances/400x/58450119.jpg",
        "instanceUrl": "http://memegenerator.net/instance/58450119"
    }
}
*/
function _generate_meme(gen_id, text0, text1, cb) {
	var self = this
	var query = {
		username: self.Config.memegenerator.username,
		password: self.Config.memegenerator.password,
		template_id: gen_id,
		text0: text0,
		text1: text1,
	}
	var url = self.Config.memegenerator.baseUrl + '/caption_image';
	console.info(util.format('create url %s', url))
	request.post({url: url, form: query}, function (err, response, body) {
		var my_err = Error('meme search failed')
		if (err) { return cb(err) }
	  if (response.statusCode != 200) { return cb(my_err) }

	  return cb(null, JSON.parse(body))
	});
}

function exec(args, cb) {
	var self = this
	async.waterfall([
		function (cb) {
			/* Remove the "top line" and "bottom line" */
			var search_args = args.slice(0, args.length-2)
			search_args[0] = 'search'
			LIB.CMD.search.exec(search_args, function(err, content) {
				var my_err = Error(util.format('imgflip.com %s failed', 'search'))
				if (err) { return cb(err) }
			  if (!content.success || content.success == false || !content.result) {
			  	return cb(my_err)
			  }
				if (!content.result.success) { return cb(Error('No memes found')) }

				console.log("Going to extract image id from: " + content.result[0].imageUrl)
				var img_id = content.result.data.meme[0].id;
				
				cb(null, img_id)	
			})
		}, function (img_id, cb) {
			self._generate_meme(img_id, args[2], args[3], cb)
		},
	], function (err, response) {	
		cb(err, response)
	})
}

function CmdCreate(Config) {
	this.Config = Config
}

CmdCreate.prototype.exec = exec
CmdCreate.prototype._generate_meme = _generate_meme
module.exports = CmdCreate
