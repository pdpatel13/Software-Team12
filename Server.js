// To run, make sure you have Node installed and run 'node Server.js'. To access the webpage itself, go to
// localhost:8080 in your browser.

var http = require('http');
var fs  = require('fs').promises; //We use fs to read html files

//This requestHandler is currently built to push an HTML page back based on the URL when a request is made.
//TODO: Implement database interactions, which also requires implementation of request method-checking.
//TODO: (Maybe) find more eloquent way of having a case for every html page. Or for implementing API requests in general.
// To be honest, I'm not even sure that it is necessary to push HTML pages through the node server that do not
// rely on user input or update, because you can still access them just by opening them in a browser. Maybe we 
// should discuss this at some point.
const requestHandlerHTML = function(req, res){
    const {method, url} = req; //method is POST, GET, etc., URL is URL
    res.writeHead(200, {'Content-Type': 'text/html'});

    //Load different html files (separate pages) based on the url, assuming GET request
    //Currently set up such that a URL will autodirect to its same-named html file on the server.
    //Unknown URLs will redirect to 404.
    switch(url){
        case "/":
            fs.readFile(__dirname + "/pages/index.html").then(contents => res.end(contents));
            break;
        case "/about":
            fs.readFile(__dirname + "/pages/about.html").then(contents => res.end(contents));
            break;
        default:
            fs.readFile(__dirname + "/pages/404.html").then(contents => res.end(contents));
            break;
    }
}

// Set up the http server
// TODO: Convert to https. This is seemingly not as simple as just changing 'http' to 'https' as we need an SSL certifciate to upgrade to HTTPS :/ 
http.createServer(requestHandlerHTML).listen(8080);
