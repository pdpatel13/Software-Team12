// To run, make sure you have Node installed and run 'node backend.js'. To access the webpage itself, go to
// localhost:8080 in your browser.

// Set up the http server
// TODO: Convert to https. This is seemingly not as simple as just changing 'http' to 'https' as, because
// we need an SSL certifciate to upgrade to HTTPS :/ 
var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello World. Welcome to Bestest Buy!');
    res.end();
}).listen(8080);
