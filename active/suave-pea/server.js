const http = require('http');

function requestHandler(request, response) {
	const headers = {
		'Server-Timing': `
		  total;dur=1230;desc="Total",
		  total;dur=1230;desc="Total 2",
		  sql-1;desc="MySQL lookup Server";dur=100,
		  sql-2;dur=900;desc="MySQL shard Server #1",
	    fs;dur=600;desc="FileSystem",
	    cache;dur=300;desc="Cache",
		  other;dur=200;desc="Database Write",
		  other;dur=110;desc="Database Read",
		`.replace(/\n[\ ]*/g, '')
	};

	response.writeHead(200, {'server-timing': 'data;dur=84.107, markup;dur=86.676, total;dur=178.723, miss'});
	response.write('prout');
	return setTimeout(_ => {
		response.end();
	}, 178.723)
}

http.createServer(requestHandler)
	.listen(process.env.PORT)
	.on('error', console.error);