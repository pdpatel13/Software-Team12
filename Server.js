// To run, make sure you have Node installed and run 'node Server.js'. To access the webpage itself, go to
// localhost:8080 in your browser.

var http = require('http');
var fs  = require('fs').promises; //We use fs to read html files
var fsc = require('fs').constants;

// USE THESE BOOLS TO DETERMINE IF THE DATABASES ARE LOADED AND AVAILABLE. TRUE MEANS YES. FALSE MEANS NO, EITHER WAIT OR SOMETHING'S WRONG.
var fireBaseLoaded = false;
var mysqlLoaded = false;

//I made this so that the js document isn't so ugly with a bunch of handler functions that are largely made up of error handling/console logging. Hopefully this works well -Joey
//This will not be useable in some cases where errors may be expected and checked for, so you will have to use a regular dbCon.query() for those scenarios instead.
//Query is a string, normal SQL query. Log=true outputs result/err to console.log() false does opposite, and handler is handler function that takes 1 param: result 
var compactSqlQuery = function(query, log=false, handler) {
    dbCon.query(query, function(err, result){
        if (err)
        {
            console.log("Error on query: ", query, " with message: ", err);
            return; //I considered having this return false or true, but I figured since this can be a little asynch, it wouldn't be very useful in a (default) synchronous context.
        } 
        if(log)
            console.log("Result: ", result);
        if(handler != undefined)
            handler(result);
    });
};

//Demo here

//The following functions: accounts, inventory, review, search, productName, category, orders, requests, and sales
//are all of the topmost domains (i.e. website.com/accounts, or website.com/inventory). These will be called when
//a request is made to the server that corresponds to each (e.g. uri: /search?sort_by=hdmi1&order=sortType=asc).

//In other words, these functions are where the crossing between database and server should happen.
var dbstatus = function(req, res, urlparts) {
    let resMsg = {};
    
    resMsg.code = 200;
    resMsg.headers = {"Content-Type" : "text/plain"};
    resMsg.body = "mySQL: " + mysqlLoaded + "\nfirebase: " + fireBaseLoaded;
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
    //Create sales report table if not already exists with mySQL:
    if(req.method === "GET"){
        compactSqlQuery("CREATE TABLE IF NOT EXISTS REPORT (ReportID INT(7) NOT NULL UNIQUE, ReportTime DATETIME NOT NULL, " + 
        "OrdersSinceLastReport INT(8), IncomeSinceLastReport DECIMAL(15,2), CurrentInventorySize INT(10), " + 
        "ShrinkSinceLastReport INT(10), LossFromShrink DECIMAL(15,2), ReturnsSinceLastReport INT(8), ReturnPayouts DECIMAL(15,2))", false);
        if(urlparts[urlparts.length-1].split("?").indexOf("nogen") == -1){
            console.log("Requested sales reports with yes generation.");
            //YES, DO GENERATE NEW SALES REPORT IN THIS CONDITION

            //Get highest reportID value in the table and continue from there:
            var newRepID;
            
            dbCon.query("SELECT MAX(ReportID) FROM REPORT", function (err, result) {
                if (err || isNaN(result[0]['MAX(ReportID)']) || result[0]['MAX(ReportID)'] == undefined)
                {
                    console.log(err, "res: ", result[0]['MAX(ReportID)']);
                    newRepID = 0;
                }else {
                    newRepID = result[0]['MAX(ReportID)'] + 1;
                }
                //This is nested inside of the first dbQuery so that newRepID definitely has it's final value before it runs.
                compactSqlQuery("INSERT INTO REPORT(ReportID, ReportTime) VALUES (" + newRepID + ", \'" + new Date().toISOString().slice(0, 19).replace('T', ' ') + "\')", false);
            });   
        }

        //Either way, request all the reports and send them to client
        compactSqlQuery("SELECT * FROM REPORT", false, function (result) {
            //TODO: Send info to HTML on client.
        });


        let resMsg = {};
        resMsg.code = 200;
        resMsg.headers = {"Content-Type" : "text/plain"};
        resMsg.body = "Temporary filler text";
        return resMsg;
        

    }else if(req.method === "POST"){
        //This is just here as a matter of template-- there is no reason right now to make a POST request to sales.
    }
}

//This requestHandler is currently built to respond to expected HTTP requests. Some unexpected http requests (i.e. requests
//for which no function is defined above) may also have responses in the form of HTML pages (like "/about").
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
        if(done === false && /\/dbStatus/.test(req.url)){
            resMsg = dbstatus(req, res, urlparts);
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

        res.writeHead(200, {'Content-Type': 'text/html'});

        res.write(req.url);
        if(req.url == "/")
            fs.readFile(__dirname + "/pages/index.html").then(contents => res.end(contents));
        else {
            //We use .then() and .catch() b/c fs.promises is async.
            fs.access(__dirname + "/pages" + req.url + ".html", fsc.F_OK)
            .then(() => fs.readFile(__dirname + "/pages" + req.url + ".html").then(contents => res.end(contents)))
            .catch(() => fs.readFile(__dirname + "/pages/404.html").then(contents => res.end(contents)));
        }
        
    }

    /*
    //A search bar that takes a keyword input and searches between products to find a match.
    //Outputs an error message for 0 results
    const searchBar = document.getElementById("search-bar");
    const form = document.querySelector("form");
    const searchResults = document.getElementById("search-results");

    form.addEventListener("submit", (event) => {
        event.preventDefault(); // prevent form submission

        const searchTerm = newFunction_1(searchBar);

        if (searchTerm.trim()) {
            const searchQuery = newFunction(searchTerm);
            newFunction_3(searchQuery)
                .then((response) => response.json())
                .then((data) => {
                    // display the search results
                    if (data.length > 0) {
                        searchResults.innerHTML = "";
                        data.forEach((result) => {
                            const item = document.createElement("div");
                            item.textContent = result;
                            searchResults.appendChild(item);
                        });
                    } else {
                        searchResults.innerHTML = "No results found.";
                    }
                })
                .catch((error) => console.error(error));
        }
    });
*/
}

//setting up mySQL database, still needs work
//from lec8 REST server example slides
const querystr = require('querystring');
const mysql = require("mysql2");
const dbCon = mysql.createConnection(
    {
        host:"localhost",
        user: "root",
        password: "passwd" //change this to the password for your mysql root account
    }
)

var sqlStmt = "CREATE DATABASE BestestBuy";
dbCon.connect(function(err)
{
    if(err) throw err;
    console.log("Connected to MySQL database");

    try {
        dbCon.query(sqlStmt, function (err, result) {
            if (err)
            {
                console.log(err);
                return;
            } 
            console.log("Result: ", result);
        });
    } catch (error) {
        var sqlStmt = "USE BestestBuy";
        dbCon.query(sqlStmt, function (err, result) {
            if (err)
            {
                console.log(err);
                return;
            } 
            console.log("Result: ", result);
        });
    }

    mysqlLoaded = true;
});


//Set up firebase for noSQL db usage
//TODO: IF YOU HAVE NOT YET DOWNLOADED THE API KEY FILE FROM DISCORD, DO SO AND DROP IT INTO THE SAME FOLDER AS SERVER.JS. DO NOT DISTRIBUTE THAT FILE.
// Import the functions you need from the SDKs you need
var fbApp = require("firebase/app");
var fbDb = require("firebase/database");

// Your web app's Firebase configuration
var app, fireDB;
fs.readFile(__dirname + "/firebaseAPI-DONOTUPLOAD.json").then(contents => {
    const firebaseConfig = JSON.parse(contents);

    // Initialize Firebase
    try{
        app = fbApp.initializeApp(firebaseConfig);
        fireDB = fbDb.getDatabase(app);
        fireBaseLoaded = true;
    }catch(error){
        console.log("Error loading firebase: vvvv");
        console.log(error);
    }
}).catch(() => console.log("Firebase JSON load error"));

// Set up the http server -- Moved to below db stuff so that we can be sure the database is loaded and connected before any requests are
// made asynchronously through HTML.
// TODO: Convert to https. This is seemingly not as simple as just changing 'http' to 'https' as we need an SSL certifciate to upgrade to HTTPS :/ 
http.createServer(requestHandlerHTML).listen(8080);



function newFunction(searchTerm) {
    return newFunction_2(searchTerm);
}

function newFunction_3(searchQuery) {
    return fetch(searchQuery);
}

function newFunction_2(searchTerm) {
    return newFunction(searchTerm);
}

function newFunction_1(searchBar) {
    return searchBar.value;
}

function newFunction(searchTerm) {
    return `/search?q=${searchTerm}`;
}
//const regExpAccounts = new RegExp('^\/accounts\/.*','i');