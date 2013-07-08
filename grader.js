#!/usr/bin/env node

/* Automatically grade files for the presence of specified HTML tags/ attributes. 
   Used commander.js and cheerio. Teaches command line application develipment and basic 
   DOM parsing.

   References:
   
   + cheerio
     - https://github.com/MatthewMueller/cheerio
     - http://maxogden.com/scraping-with-node.html

   + commander.js
      - https://github.com/visionmedia/commander.js
      - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

   + JSON
*/


var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var sys = require('util');
var rest = require('restler');

var assertFileExists = function(infile){
	var instr = infile.toString();
	if(!fs.existsSync(instr)){
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1); // http://nodejs.org/api/process.html#process_exit_code
	}
	return instr;
};

var cheerioHtmlFile = function(htmlfile){
	//console.log("cheerioHtmlFile htmlfile: %s ",htmlfile);
	return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile){
	return JSON.parse(fs.readFileSync(checksfile));
}

var checkHtmlFile = function(htmlfile, checksfile){
	$ = cheerioHtmlFile(htmlfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var ii in checks){
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
}


var clone = function(fn){
	// Workaround for commander.js issue
	// http://stackoverflow.com/a/6772648
	return fn.bind({});
};

if(require.main == module){
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists),
			CHECKSFILE_DEFAULT)

		.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
        	.option('-u, --url <url>','Path to URL input')
		.parse(process.argv);
    
	if(program.url){
		var url = program.url.toString();
		console.log("url entered: %s",url);
		rest.get(url).on('complete', function(result){
			if(result instanceof Error){
				console.log("Error: %s ", result.message);
				this.retry(5000);
			}else{
			//	console.log("Result: %s",result);
				var fileOrUrlContents = result.toString();
				var outfile = "urlContents.txt";
				fs.writeFileSync(outfile,fileOrUrlContents);
				var checkJson = checkHtmlFile(outfile, program.checks);
				var outJson = JSON.stringify(checkJson,null,4);
				console.log(outJson);
			}
		});
	}else if(program.file){
		var checkJson = checkHtmlFile(program.file, program.checks);
		var outJson = JSON.stringify(checkJson,null,4);
		console.log(outJson);
	}

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
