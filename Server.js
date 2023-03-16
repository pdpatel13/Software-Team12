// To run, make sure you have Node installed and run 'node Server.js'. To access the webpage itself, go to
// localhost:8080 in your browser.

var http = require('http');
var fs  = require('fs').promises; //We use fs to read html files
var fsc = require('fs').constants;

//The following functions: accounts, inventory, review, search, productName, category, orders, requests, and sales
//are all of the topmost domains (i.e. website.com/accounts, or website.com/inventory). These will be called when
//a request is made to the server that corresponds to each (e.g. uri: /search?sort_by=hdmi1&order=sortType=asc).
//
//In other words, these functions are where the crossing between database and server should happen.
var accounts = function(req, res, urlparts) {
    let resMsg = {};
    return resMsg;
};

var inventory = function(req, res, urlparts) {
    let resMsg = {};
    return resMsg;
};

var review = function(req, res, urlparts) {
    let resMsg = {};
    return resMsg;
};

var search = function(req, res, urlparts) {
    let resMsg = {};
    return resMsg;
}

var productName = function(req, res, urlparts) {
    let resMsg = {};
    return resMsg;
};

var category = function(req, res,urlparts) {
    let resMsg = {};
    return resMsg;
};

var orders = function(req, res, urlparts) {
    let resMsg = {};
    return resMsg;
};

var requests = function(req, res, urlparts) {
    let resMsg = {};
    return resMsg;
}

var sales = function(req, res, urlparts) {
    let resMsg = {};
    resMsg.code = 200;
    resMsg.headers = {"Content-Type" : "text/plain"};
    resMsg.body = "Displaying sales example when you go to localhost:8080/sales";
    return resMsg;
}

//This requestHandler is currently built to respond to expected HTTP requests. Some unexpected http requests (i.e. requests
//for which no function is defined above) may also have responses in the form of HTML pages (like "/about").
//TODO: Implement database interactions, which also requires implementation of request method-checking.
const requestHandlerHTML = function(req, res){
    //Split up the received uri
    let urlparts = [];
    let segments = req.url.split("/");
    for(i = 0, ct=segments.length; i<ct; i++){
        if(segments[i] != ""){
            urlparts.push(segments[i]);
        }
    }

    //Figure out what the topmost url path is for the request and redirect to the appropriate function above. Uses regexps.
    //Since each function takes urlparts, just in case the server determines the wrong one should be called, we'll try-catch each:
    let done = false;
    let resMsg = {};
    try{
        if(done === false && /\/accounts/.test(req.url)){
            resMsg = accounts(req, res, urlparts);
            done = true;
        }
    }catch(exc){};

    try{
        if(done === false && /\/inventory/.test(req.url)){
            resMsg = inventory(req, res, urlparts);
            done = true;
        }
    }catch(exc){};   

    try{
        if(done === false && /\/search/.test(req.url)){
            resMsg = search(req, res, urlparts);
            done = true;
        }
    }catch(exc){};   

    try{
        if(done === false && /\/review/.test(req.url)){
            resMsg = review(req, res, urlparts);
            done = true;
        }
    }catch(exc){}; 

    try{
        if(done === false && /\/productName/.test(req.url)){
            resMsg = productName(req, res, urlparts);
            done = true;
        }
    }catch(exc){};

    try{
        if(done === false && /\/category/.test(req.url)){
            resMsg = category(req, res, urlparts);
            done = true;
        }
    }catch(exc){};

    try{
        if(done === false && /\/orders/.test(req.url)){
            resMsg = orders(req, res, urlparts);
            done = true;
        }
    }catch(exc){};


    try{
        if(done === false && /\/requests/.test(req.url)){
            resMsg = requests(req, res, urlparts);
            done = true;
        }
    }catch(exc){};


    try{
        if(done === false && /\/sales/.test(req.url)){
            resMsg = sales(req, res, urlparts);
            done = true;
        }
    }catch(exc){};

    if(done){
        res.writeHead(resMsg.code, resMsg.headers),
        res.end(resMsg.body);
    }

    //Load different html files (separate pages) based on the url, assuming GET request
    //Currently set up such that a URL will autodirect to its same-named html file on the server.
    //Unknown URLs will redirect to 404.
    if(req.method == "GET" && done === false){
        var dataRequest = false; //For when something other than an html page is requested.
                                 //This may need to be determined from another list like the pages array

        dataRequest = (req.url == "/geturl"); //This is just temporary

        if(dataRequest){
            //Since /geturl is the only data request url that's coded for right now, we'll assume that's what the request is.
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end();

        }else { //If it's not requesting data, it must be requesting an HTML page, like the whole file.

            res.writeHead(200, {'Content-Type': 'text/html'});

            res.write(req.url);
            if(req.url == "/")
                fs.readFile(__dirname + "/pages/index.html").then(contents => res.end(contents));
            else {
                fs.access(__dirname + "/pages" + req.url, fsc.F_OK)
                .then(() => fs.readFile(__dirname + "/pages" + req.url).then(contents => res.end(contents)))
                .catch(() => fs.readFile(__dirname + "/pages/404.html").then(contents => res.end(contents)));
            }
        }
    }
    
}

// Set up the http server
// TODO: Convert to https. This is seemingly not as simple as just changing 'http' to 'https' as we need an SSL certifciate to upgrade to HTTPS :/ 
http.createServer(requestHandlerHTML).listen(8080);
