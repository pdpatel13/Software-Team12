// To run, make sure you have Node installed and run 'node Server.js'. To access the webpage itself, go to
// localhost:8080 in your browser.

// I moved all of these dependencies to the top so it is easy to see which
// must be installed externally to run the server on your dev computer.
// Those are labeled with comments with what terminal command to use to install.
var fs  = require('fs').promises; 
var fsc = require('fs').constants;
var path = require('path');

var express, mysql, fbApp, fdb, cookieParser, jwt, passwd
try{
    express = require('express'); //npm install express --save
}catch(exc){
    console.log("ERROR: You are missing required dependency: express.\nInstall express in terminal with \"npm install express --save\"")
    throw exc;
}      
try
{
    mysql = require("mysql2");
}            //npm install mysql2
catch(exc){
    console.log("ERROR: You are missing required dependency: mysql2.\n Install mysql2 in terminal with \"npm install mysql2\"");
    throw exc;
}
try
{
    fbApp = require("firebase/app");      //npm install firebase
    fdb = require("firebase/database");
} //npm install firebase
catch(exc) {
    console.log("ERROR: You are missing required dependency: firebase.\n Install firebase in terminal with \"npm install firebase\"");
    throw exc;
}
try
{
    cookieParser = require('cookie-parser')
}
catch(exc){
    console.log("ERROR: You are missing required dependency: cookie-parser.\n Install cookie-parser in terminal with \"npm install cookie-parser\"");
    throw exc;
}
try
{
    jwt = require('jsonwebtoken');
}
catch(exc){
    console.log("ERROR: You are missing required dependency: jsonwebtoken.\n Install jsonwebtoken in terminal with \"npm install jsonwebtoken\"");
    throw exc;
}
try
{
    passwd = require("./password.json")
}
catch(exc){
    console.log("ERROR: The required file for SQL password called \"password.json\" is not found.")
    throw exc;
}

//Demo here
var sApiKey = "";

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

var addItem = function(req, res, urlparts) {
    let resMsg = {};

    var post = req.body;
    var pName = post.name;
    var pDesc = post.desc;
    var pPrice = post.price;
    var pSupplier = post.supplier;
    var pAmount = post.amount;
    var pSize = post.size;
    var pWeight = post.weight;
    var pCategory = post.category;

    var query = "INSERT INTO `Inventory` (`productName`, `desc`, `unitPrice`, `supplierID`, `onHand`, `size`, `weight`, `category`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    dbCon.query(query, [pName, pDesc, pPrice, pSupplier, pAmount, pSize, pWeight, pCategory], function(err, result, fields) {
        if (err && err.code === 'ER_DUP_ENTRY') {
            console.log(err);
            resMsg.code = 409;
            resMsg.headers = {"Content-Type": 'application/json'};
            resMsg.body = JSON.stringify({ message: 'Item already exists' });

            res.writeHead(resMsg.code, resMsg.headers),
            res.end(resMsg.body);
            return;
        }
        else if (err) {
            console.log(err);
            throw err;
        }
        
        resMsg.code = 201;
        resMsg.headers = {"Content-Type": 'application/json'};
        resMsg.body = JSON.stringify({ accountId: result.insertId });
        
        res.writeHead(resMsg.code, resMsg.headers),
        res.end(resMsg.body);
    });      
};

var deleteItem = function(req, res, urlparts) {
    let resMsg = {};
  
    var post = req.body;
    let pName = post.name;
  
    // Execute the SQL query to retrieve the product ID
    let query = "SELECT `productId` FROM `Inventory` WHERE `productName` = ?";
    dbCon.query(query, [pName], function(err, result, fields) {
      if (err) {
        console.log(err);
        throw err;
      }
  
      if (result.length === 0) {
        // If no rows were returned, return a 404 error
        resMsg.code = 404;
        resMsg.headers = {"Content-Type": 'application/json'};
        resMsg.body = JSON.stringify({ message: 'Product not found' });
        res.writeHead(resMsg.code, resMsg.headers),
        res.end(resMsg.body);
        return;
      }
  
      let productId = result[0].productId;
  
      // Execute the SQL query to delete the product from the Inventory table
      query = "DELETE FROM `Inventory` WHERE `productId` = ?";
      dbCon.query(query, [productId], function(err, result, fields) {
        if (err) {
          console.log(err);
          throw err;
        }
  
        if (result.affectedRows === 0) {
          // If no rows were deleted, return a 404 error
          resMsg.code = 404;
          resMsg.headers = {"Content-Type": 'application/json'};
          resMsg.body = JSON.stringify({ message: 'Product not found' });
        } else {
          // If the product was successfully deleted, return a 204 No Content response
          resMsg.code = 204;
          resMsg.headers = {};
          resMsg.body = '';
        }
  
        res.writeHead(resMsg.code, resMsg.headers),
        res.end(resMsg.body);
      });
    });
  };
  
  var modifyItem = function(req, res, urlparts) {
    let resMsg = {};

    var post = req.body;
    var pName = post.name;
    var pDesc = post.desc;
    var pPrice = post.price;
    var pSupplier = post.supplier;
    var pAmount = post.amount;
    var pSize = post.size;
    var pWeight = post.weight;
    var pCategory = post.category;

    var query = "UPDATE `Inventory` SET ";
    var queryParams = [];
    var updateFields = [];

    if (pDesc) {
        updateFields.push("`desc` = ?");
        queryParams.push(pDesc);
    }

    if (pPrice) {
        updateFields.push("`unitPrice` = ?");
        queryParams.push(pPrice);
    }

    if (pSupplier) {
        updateFields.push("`supplierID` = ?");
        queryParams.push(pSupplier);
    }

    if (pAmount) {
        updateFields.push("`onHand` = ?");
        queryParams.push(pAmount);
    }

    if (pSize) {
        updateFields.push("`size` = ?");
        queryParams.push(pSize);
    }

    if (pWeight) {
        updateFields.push("`weight` = ?");
        queryParams.push(pWeight);
    }
    
    if (pCategory) {
        updateFields.push("`category` = ?");
        queryParams.push(pCategory);
    }

    query += updateFields.join(", ") + " WHERE `productName` = ?";
    queryParams.push(pName);
    dbCon.query(query, queryParams, function(err, result, fields) {
        if (err) {
            console.log(err);
            throw err;
        }

        if (result.affectedRows === 0) {
            resMsg.code = 404;
            resMsg.headers = {"Content-Type": 'application/json'};
            resMsg.body = JSON.stringify({ message: 'Product not found' });
        } else {
            resMsg.code = 200;
            resMsg.headers = {"Content-Type": 'application/json'};
            resMsg.body = JSON.stringify({ message: 'Item modified successfully!' });
        }

        res.writeHead(resMsg.code, resMsg.headers),
        res.end(resMsg.body);
    });
};

var sendEmail = function(contents, userEmail) {
    let reqEmail = {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + sApiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            personalizations: [{
                to: [{
                    email: userEmail,
                    name: "Valued Bestest Buy Customer"
                }],
                subject: "Order Placed!"}],
            content: [{
                type: "text/plain",
                value: contents
            }],
            from: {
                email: "watermelonsplash92@gmail.com",
                name: "Bestest Buy Noreply"
            },
            reply_to: {
                email: "watermelonsplash92@gmail.com",
                name: "Bestest Buy Noreply"
            }
        })
    }
    fetch("https://api.sendgrid.com/v3/mail/send", reqEmail);
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

var currentOrderID;
var orders = function(req, res, urlparts) {
    //Push data from json data inside request to firedb.
    let body = req.body;
    let newOrderID = currentOrderID + 1;

    //calculate relevant metrics: total cost, timestamp, total qty
    let totalcost = 0, totalqty = 0, timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    for(let itemID in body){
        if(itemID === "userID")
            continue;
        totalqty += body[itemID].qty;
        totalcost += body[itemID].price * body[itemID].qty;

        //Also we're gonna add each item to the orderItems tree while we're
        //iterating, why not?!
        fdb.update(fdb.ref(fireDB, "orders/orderItems/" + newOrderID), {
            [itemID] : body[itemID].qty
        })
    }

    //See sampleOrdersDB.json for structure inside db
    fdb.set(fdb.ref(fireDB, "orders/ordermetadata/" + newOrderID), {
        userid : req.cookies.userID,
        cost : totalcost,
        timestamp : timestamp,
        orderStatus : "placed",
        size : totalqty 
    })

    fdb.set(fdb.ref(fireDB, "orders/newestOrderId"), newOrderID);

    let resMsg = {};
    resMsg.code = 200;
    resMsg.headers = {"Content-Type" : "text/plain"};
    resMsg.body = "Order placed with ID: " + newOrderID;

    sendEmail("Order ID: "+ newOrderID + " => \n\n\n" + JSON.stringify(req.body), req.cookies.userEmail);

    return resMsg;
};

var requests = function(req, res, urlparts) {
    let resMsg = {};
    return resMsg;
}

var viewReport = function(req,res,urlparts) {
    let resMsg = {};
    dbCon.query("SELECT * FROM REPORT WHERE ReportId = " + req.body.id, function(err, result){
        if(err){
            resMsg.code = 400;
            resMsg.headers = {"Content-Type" : "application/json"};
            resMsg.body = "Error: " + err;
        }else {
            resMsg.code = 200;
            resMsg.headers = {"Content-Type" : "application/json"};
            resMsg.body = JSON.stringify(result[0]);
        }

        res.writeHead(resMsg.code, resMsg.headers);
        res.end(resMsg.body);
    });
}

var sales = function(req, res, urlparts) {
    let resMsg = {};
    //Create sales report table if not already exists with mySQL:
    if(urlparts[urlparts.length-1].split("?").indexOf("nogen") == -1){
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
            //Get all sales from time of last report to now
            dbCon.query("SELECT * FROM REPORT WHERE `ReportID` = " + result[0]['MAX(ReportID)'], function (err, latestRep) {
                let ordersSince = new Date(latestRep[0]['ReportTime']);
                fdb.get(fdb.child(fdb.ref(fireDB), 'orders/newestOrderId')).then(snapshot => {
                    if(snapshot.exists()){
                        let latestOrderID = snapshot.val();
                        var orderMetadatas = {};
                        let done = false;
                        for(let counter = Number(latestOrderID); counter > 0; counter--){
                            fdb.get(fdb.child(fdb.ref(fireDB), 'orders/ordermetadata/'+counter)).then(snapshot => {
                                if(snapshot.exists()){
                                    if(new Date(snapshot.val()["timestamp"]) > ordersSince){
                                        orderMetadatas[""+counter]= snapshot.val();
                                    }else if(done == false) {
                                        done = true;
                                        let totalQtyOrdered = 0;
                                        let totalIncome = 0;
                                        let ordersSince = 0;
                                        Object.keys(orderMetadatas).forEach(key=>{
                                            ordersSince++;
                                            totalQtyOrdered = totalQtyOrdered + orderMetadatas[key].size;
                                            totalIncome = totalIncome + orderMetadatas[key].cost;
                                        })

                                        //This is nested inside of the first dbQuery so that newRepID definitely has it's final value before it runs.
                                        compactSqlQuery("INSERT INTO REPORT(ReportID, ReportTime, IncomeSinceLastReport, OrdersSinceLastReport, CurrentInventorySize) VALUES (" + newRepID + ", \'" + new Date().toISOString().slice(0, 19).replace('T', ' ') + "\', "+totalIncome + " , " + ordersSince + " , " + totalQtyOrdered + ")", false, function(result){
                                            dbCon.query("SELECT ReportID, ReportTime FROM REPORT", function(err, result){ 
                                                if(err) {
                                                    resMsg.code = 400;
                                                    resMsg.headers = {"Content-Type" : "application/json"};
                                                    resMsg.body = "Error1: " + err;
                                                }else {
                                                    resMsg.code = 200;
                                                    resMsg.headers = {"Content-Type" : "application/json"};
                                                    resMsg.body = JSON.stringify(result);
                                                }
                                                res.writeHead(resMsg.code, resMsg.headers);
                                                res.end(resMsg.body);
                                            });
                                        });
                                    }
                                }
                            });
                        }
                    }
                    else
                        console.log("snapshot does not exist");
                });
            });
            
        });   
    }else {
        dbCon.query("SELECT ReportID, ReportTime FROM REPORT", function(err, result){ 
            if(err) {
                resMsg.code = 400;
                resMsg.headers = {"Content-Type" : "application/json"};
                resMsg.body = "Error1: " + err;
            }else {
                resMsg.code = 200;
                resMsg.headers = {"Content-Type" : "application/json"};
                resMsg.body = JSON.stringify(result);
            }
            res.writeHead(resMsg.code, resMsg.headers);
            res.end(resMsg.body);
        });
    }
}

const secretKey = "my-secret-key";

var createAccount = function(req, res, urlparts) {
    let resMsg = {};

    var post = req.body;
    var username = post.user;
    var email = post.email;
    var password = post.password;

    var query = "INSERT INTO `Accounts` (`UserName`, `Email`, `Password`, `Role`) VALUES (?, ?, ?, ?)";
    dbCon.query(query, [username, email, password, "user"], function(err, result, fields) {
        if (err && err.code === 'ER_DUP_ENTRY') {
            console.log(err);
            resMsg.code = 409;
            resMsg.headers = {"Content-Type": 'application/json'};
            resMsg.body = JSON.stringify({ message: 'Username or email already exists' });

            res.writeHead(resMsg.code, resMsg.headers),
            res.end(resMsg.body);
            return;
        }
        else if (err) {
            console.log(err);
            throw err;
        }
        
        resMsg.code = 201;
        resMsg.headers = {"Content-Type": 'application/json'};
        resMsg.body = JSON.stringify({ accountId: result.insertId });
        
        res.writeHead(resMsg.code, resMsg.headers),
        res.end(resMsg.body);
    });      
}

var authenticate = function(req, res, urlparts){
    var post = req.body;
    var email = post.email;
    var password = post.password;

    // Check if user exists and password is correct
    var query = "SELECT * FROM `Accounts` WHERE `Email` = ? AND `Password` = ?";
    dbCon.query(query, [email, password], function(err, result, fields) {
        if (err) throw err;

        // If no user found or password is incorrect, return error response
        if (result.length === 0) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Invalid email or password' }));
            return;
        }

        // If user exists and password is correct, generate JWT token and return it in the response
        const token = jwt.sign(result[0], secretKey);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        
        res.cookie("jwt", token, {secure: false, httpOnly: true});
        res.cookie("authTime", new Date().toISOString().slice(0, 19).replace('T', ' '), {secure: false, httpOnly: true});
        res.cookie("userID", result[0].userID, {secure: false, httpOnly: true});
        res.cookie("username", result[0].UserName, {secure: false, httpOnly: false});
        res.cookie("userRank", result[0].Role, {secure: false, httpOnly: true});
        res.cookie("userEmail", result[0].Email, {secure: false, httpOnly: true});
        res.send()
        //res.end(JSON.stringify({ token: token }));
    });
}

var accountInfo = function(req, res, urlparts) {
    try {
      const accountId = req.url.split('/')[2];

      // Select the row where UserID equals the ID of the authenticated user
      var query = `SELECT * FROM Accounts WHERE UserID = ${req.user.userID}`;

      dbCon.query(query, function (err, result, fields) {
        if (err) throw err;

        // If the user does not have permission to view the requested account, return error response
        if (result.length === 0 || result[0].userID !== parseInt(accountId)) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Unauthorized' }));
          return;
        }

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
      });

    } catch (error) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Invalid token' }));
      return;
    }
}

var updateAccount = function(req, res, urlparts) {
    try {
        const accountId = req.url.split('/')[2];
        let accountData = {}; // Initialize accountData to an empty object
        try {
          accountData = JSON.parse(req.body);
        } catch (error) {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: 'Invalid request body' }));
          return;
        }          
          
        // Construct an SQL query to update the account
        let query = 'UPDATE accounts SET ';
        const keys = Object.keys(accountData);
        const values = Object.values(accountData);
        
        for (let i = 0; i < keys.length; i++) {
          if (values[i] === '') {
            continue; // Skip empty fields
          }
          
          query += `${keys[i]}='${values[i]}'`;
          
          if (i !== keys.length - 1) {
            query += ',';
          }
        }
        
        query += ` WHERE userID=${accountId}`;
        dbCon.query(query, function (err, result, fields) {
          if (err) throw err;
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ message: 'Account updated successfully' }));
        });
    } catch (error) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Invalid token' }));
      return;
    }
}

var deleteAccount = function(req, res, urlparts) {
    //const token = req.headers.authorization?.split(' ')[1];

    try {
        //Authorization is now taken care of in the middleman function.
        /*
        const decodedToken = jwt.verify(token, secretKey);
        */
        // If token is valid, continue with the request
        const accountId = req.url.split('/')[2];
        

        // Select the row where UserID equals the ID of the authenticated user and the account ID matches the requested account ID
        var query = `DELETE FROM Accounts WHERE UserID = ${req.user.userID}`;

        dbCon.query(query, function (err, result, fields) {
            if (err) throw err;

            // If the user does not have permission to delete the requested account, return error response
            if (result.affectedRows === 0) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Unauthorized' }));
                return;
            }

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ message: 'Account deleted successfully' }));
        });

    } catch (error) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Invalid token' }));
      return;
    }
}

var logout = function(req, res, urlparts) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');

    res.clearCookie("jwt");
    res.clearCookie("userID");
    res.clearCookie("authTime");
    res.clearCookie("username");
    res.clearCookie("userRank");
    res.end()
}

var viewInventory = function(req, res, urlparts) {
    const minProductID = req.url.split('/')[2];

    var query = "SELECT * FROM `Inventory` WHERE `productID` >= " + minProductID + " AND `productID` < " + minProductID+50;
    dbCon.query(query, function(err, result, fields) {
        if(err) {
            console.log(err);
            res.statusCode = 400;
            res.end();
            return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
    });
}

const viewOrder = function(req, res, urlparts) {
    let resMsg = {};
    resMsg.headers = {"Content-Type" : "application/json"};

    fdb.get(fdb.child(fdb.ref(fireDB), 'orders/orderItems/' + req.body.id)).then(snapshot =>{
        if(snapshot.exists()){
            resMsg.code = 200;
            resMsg.body = JSON.stringify(snapshot);
        }else {
            resMsg.code = 400;
            resMsg.body = JSON.stringify("Could not find order with given ID");
        }
        res.writeHead(resMsg.code, resMsg.headers);
        res.end(resMsg.body);
    })
}

const modifyOrder = function(req, res, urlparts) {
    fdb.update(fdb.ref(fireDB, "orders/ordermetadata/" + req.body.id), {orderStatus: req.body.status}).then(out => {
        let resMsg = {};
        resMsg.code = 200;
        resMsg.headers = {"Content-Type" : "application/json"};
        resMsg.body = JSON.stringify(out);
        res.writeHead(resMsg.code, resMsg.headers);
        res.end(resMsg.body);
    });
}

const findItemsByTrait = function(req, res, urlparts){
    var query = "SELECT * FROM `Inventory` WHERE `"+ req.body.column +"` = " + req.body.value;
    dbCon.query(query, function(err, result, fields) {
        if(err) {
            console.log(err);
            res.statusCode = 400;
            res.end();
            return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
    });
}

const getOrders =function(req, res, urlparts) {
    let resMsg = {};
    fdb.get(fdb.child(fdb.ref(fireDB), 'orders/newestOrderId')).then(snapshot => {
        if(snapshot.exists()){
            let latestOrderID = snapshot.val();
            var orderMetadatas = {};
            let done = 1;
            for(let counter = Number(latestOrderID); counter > 0; counter--){
                fdb.get(fdb.child(fdb.ref(fireDB), 'orders/ordermetadata/'+counter)).then(snapshot => {
                    done++;
                    if(snapshot.exists()){
                        orderMetadatas[""+counter]= snapshot.val();
                        if(done == latestOrderID){
                            resMsg.code = 200;
                            resMsg.headers = {"Content-Type" : "application/json"};
                            resMsg.body = JSON.stringify(orderMetadatas);

                            res.writeHead(resMsg.code, resMsg.headers);
                            res.end(resMsg.body);
                        }
                    }else {
                    }
                });
            }
        }
        else
            console.log("snapshot does not exist");
    });
}

const getUsersOrders = function(req, res, urlparts){
    //Get orders for the logged in(authenticated) user ID
    let userIDTemp = req.cookies.userID;
    let resMsg = {};
    fdb.get(fdb.child(fdb.ref(fireDB), 'orders/newestOrderId')).then(snapshot1 => {
        if(snapshot1.exists()){
            let latestOrderID = snapshot1.val();
            var orderMetadatas = {};
            let orderCter = 0;
            let done = 1;
            for(let counter = Number(latestOrderID); counter > 0; counter--){
                fdb.get(fdb.child(fdb.ref(fireDB), 'orders/ordermetadata/'+counter)).then(snapshot => {
                    done++;
                    if(snapshot.exists() && snapshot.val()["userid"] == userIDTemp){
                        orderMetadatas[""+counter]= snapshot.val();
                        orderCter++;
                    }else {
                    }
                    if(counter == 1){
                        resMsg.code = 200;
                        resMsg.headers = {"Content-Type" : "application/json"};
                        resMsg.body = JSON.stringify(orderMetadatas);

                        res.writeHead(resMsg.code, resMsg.headers);
                        res.end(resMsg.body);
                    }
                });
            }
        }
        else
            console.log("snapshot does not exist");
    });
};

const getUsersOrderByID = function(req, res, urlparts){
    //Verify that the user is who they say they are
    let userIDTemp = req.cookies.userID;
    let resMsg={};
    resMsg.headers = {"Content-Type" : "application/json"};

    fdb.get(fdb.child(fdb.ref(fireDB), 'orders/ordermetadata/' + req.body.id)).then(snapshot =>{
        if(snapshot.exists()){
            if(snapshot.val()["userid"] == userIDTemp){
                fdb.get(fdb.child(fdb.ref(fireDB), 'orders/orderItems/' + req.body.id)).then(snapshot =>{
                    if(snapshot.exists()){
                        resMsg.code = 200;
                        resMsg.body = JSON.stringify(snapshot);
                    }else {
                        resMsg.code = 400;
                        resMsg.body = JSON.stringify("Could not find order with given ID");
                    }
                    res.writeHead(resMsg.code, resMsg.headers);
                    res.end(resMsg.body);
                })
            }else {
                resMsg.code = 401;
                resMsg.body = JSON.stringify("Forbidden. incorrect user.");
                res.writeHead(resMsg.code, resMsg.headers);
                res.end(resMsg.body);
            }
        }else {
            resMsg.code = 400;
            resMsg.body = JSON.stringify("Could not find order with given ID");
            
            res.writeHead(resMsg.code, resMsg.headers);
            res.end(resMsg.body);       
        }
    })

    
}

//List of protected routes with their methods
const protectedRoute = function(req){
    //
    // The value returned here is as follows:
    //   0: Anyone (guest): No authentication
    //   1: User: Must have account and be logged in
    //   2: Employee: Must have "staff" in "Role" in Accounts DB
    //   3: Admin: Must have "admin" in "Role" in Accounts DB
    //

    if (req.method === 'GET' && req.url.startsWith('/accounts'))
        return 1;
    if (req.method === 'GET' && req.url.startsWith('/orderHist'))
        return 1;
    if (req.url.startsWith('/userOrder'))
        return 1;
    if (req.url.startsWith('/viewUserOrders'))
        return 1;
    if (req.method === 'PATCH' && req.url.startsWith('/accounts'))
        return 1;
    if (req.method === 'DELETE' && req.url.startsWith('/accounts'))
        return 1;
    if (req.method === 'POST' && req.url.startsWith('/cart'))
        return 1;
    if (req.method === 'POST' && req.url.startsWith('/makeOrder'))
        return 1;
    if (req.method === 'GET' && req.url.startsWith('/getOrders'))
        return 2;
    if (req.method === 'POST' && req.url.startsWith('/modifyOrder'))
        return 2;
    if (req.method === 'POST' && req.url.startsWith('/viewOrder'))
        return 2;
    if (req.method === 'GET' && req.url.startsWith('/admin'))
        return 3;
    if (req.method === 'POST' && req.url.startsWith('/inventory'))
        return 3;
    if (req.method === 'GET' && req.url.startsWith('/reports'))
        return 3;
    if (req.method === 'POST' && req.url.startsWith('/viewReport'))
        return 3;

    return 0;
}

//Middleware function to authenticate token
const authenticateToken = function(req, res, next){

    if(new Date(new Date().toISOString().slice(0, 19).replace('T', ' ')) - new Date(req.cookies.authTime)  > 60000 * 30){ //After 30 minutes, auto log out
        //We should be deauthorized
        res.clearCookie("jwt");
        res.clearCookie("authTime");
        res.clearCookie("userID");
        res.clearCookie("username");
        res.clearCookie("userRank");
        res.clearCookie("userEmail");
    }

    let token = req.cookies.jwt;
    let role = req.cookies.userRank;
    let clearance = protectedRoute(req);
    if(clearance == 0){
        next();            //so that when the page changes it is still stored
        return;
    }
    if(token == null) return res.sendStatus(401);
    if(clearance == 3 && role != "admin") return res.sendStatus(401);
    if(clearance == 2 && role != "admin" && role != "staff") return res.sendStatus(401);
    if(clearance == 1 && role != "user" && role != "admin" && role != "staff") return res.sendStatus(401);
    jwt.verify(token, secretKey, (err, user) => {
        if(err) console.log(err);
        if(err) return res.sendStatus(403);
        next();
    });
}

const setupSqlDatabase = function() {
    //Both db.query and compactSqlQuery do the same thing, compactSqlQuery just has a bool to log response from SQL too.
    dbCon.query("CREATE TABLE if not exists `Accounts` (\
        `userID` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
        `UserName` varchar(20) UNIQUE NOT NULL,\
        `Email` varchar(40) UNIQUE NOT NULL,\
        `Password` varchar(20) NOT NULL,\
        `FirstName` text,\
        `LastName` text,\
        `Birthday` date,\
        `Role` text,\
        `CreditCard` bigint(16),\
        `SecurityCode` int(3),\
        `ExpirationDate` date\
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;");

    //Generate admin-level and staff-level accounts
    dbCon.query("INSERT INTO `Accounts` (`UserName`, `Email`, `Password`, `Role`) VALUES (?, ?, ?, ?)", ["admin", "admin@email.com", "password", "admin"], function(err, result){});
    dbCon.query("INSERT INTO `Accounts` (`UserName`, `Email`, `Password`, `Role`) VALUES (?, ?, ?, ?)", ["staff", "staff@email.com", "password", "staff"], function(err, result){});

    dbCon.query("CREATE TABLE if not exists `Inventory` (\
    `productID` INT(8) NOT NULL UNIQUE AUTO_INCREMENT,\
    `productName` varchar(30) UNIQUE NOT NULL,\
    `desc` varchar(100) NOT NULL,\
    `unitPrice` DECIMAL(15,2) NOT NULL,\
    `onHand` INT(4),\
    `category` VARCHAR(20),\
    `size` VARCHAR(12),\
    `weight` INT(3),\
    `image` VARCHAR(100),\
    `fragility` int(1),\
    `supplierID` INT(8) NOT NULL,\
    `rating` INT(5),\
    PRIMARY KEY (ProductID)\
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;");
      
    compactSqlQuery("CREATE TABLE IF NOT EXISTS REPORT (ReportID INT(7) NOT NULL UNIQUE, ReportTime DATETIME NOT NULL, " + 
    "OrdersSinceLastReport INT(8), IncomeSinceLastReport DECIMAL(15,2), CurrentInventorySize INT(10), " + 
    "ShrinkSinceLastReport INT(10), LossFromShrink DECIMAL(15,2), ReturnsSinceLastReport INT(8), ReturnPayouts DECIMAL(15,2))", false);
};

var viewItems = function(req, res, urlparts){
    var category = req.url.split('/')[2];
    let resMsg = {};
    //connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Acer' order by productName asc limit 10", function (err, result) {
    dbCon.query("SELECT * FROM `Inventory` WHERE category = '" + category + "' order by productName asc limit 10", function (err, result) {
        if (err) {
            resMsg.code = 400;
            resMsg.headers = {"Content-Type" : "application/json"};
            resMsg.body = JSON.stringify({err: "bad request"});

            res.writeHead(resMsg.code, resMsg.headers);
            res.end(resMsg.body);
        }else {

        resMsg.code = 200;
        resMsg.headers = {"Content-Type" : "application/json"};
        resMsg.body = JSON.stringify(result);

        res.writeHead(resMsg.code, resMsg.headers);
        res.end(resMsg.body);
        }
    });
};

const router = function(req, res){
    //Split up the received uri
    let urlparts = [];
    let segments = req.url.split("/");
    for(i = 0, ct=segments.length; i<ct; i++){
        if(segments[i] != ""){
            urlparts.push(segments[i]);
        }
    }
    let resMsg = {};
    let done = false;

    if(req.method == "GET"){

        if(done === false && /\/viewUserOrders/.test(req.url)){
            resMsg = getUsersOrders(req, res, urlparts);
            done = true;
        }

        if(done === false && /\/getOrders/.test(req.url)){
            resMsg = getOrders(req, res, urlparts);
            done = true;
        }

        if(done === false && /\/dbStatus/.test(req.url)){
            resMsg = dbstatus(req, res, urlparts);
            done = true;
        }

        if(done === false && /\/accounts\/logout/.test(req.url)){
            resMsg = logout(req, res, urlparts);
            done = true;
        }

        if(done === false && req.url.startsWith("/accounts")){
            resMsg = accountInfo(req, res, urlparts);
            done = true;
        }
    
        if(done === false && /\/search/.test(req.url)){
            resMsg = search(req, res, urlparts);
            done = true;
        }
    
        if(done === false && /\/review/.test(req.url)){
            resMsg = review(req, res, urlparts);
            done = true;
        }
    
        if(done === false && /\/productName/.test(req.url)){
            resMsg = productName(req, res, urlparts);
            done = true;
        }
    
        if(done === false && /\/category/.test(req.url)){
            resMsg = category(req, res, urlparts);
            done = true;
        }
    
        if(done === false && /\/requests/.test(req.url)){
            resMsg = requests(req, res, urlparts);
            done = true;
        }
    
        if(done === false && /\/sales/.test(req.url)){
            resMsg = sales(req, res, urlparts);
            done = true;
        }

        if(done === false && /\/inventory/.test(req.url)){
            resMsg = viewInventory(req, res, urlparts);
            done = true;
        }
        
        if(done === false && /\/viewItems/.test(req.url) && !/\/viewItems2/.test(req.url)){
            resMsg = viewItems(req, res, urlparts);
            done = true;
        }

    }else if(req.method == "POST"){
        
        if(done === false && /\/userOrder/.test(req.url)){
            resMsg = getUsersOrderByID(req, res, urlparts);
            done = true;
        }

        if(done === false && /\/makeorder/.test(req.url)){
            orders(req, res, urlparts);
            done = true;
        }
        if(done === false && /\/findItemsByTrait/.test(req.url)){
            findItemsByTrait(req, res, urlparts);
            done = true;
        }

        if(done === false && /\/modifyOrder/.test(req.url)){
            resMsg = modifyOrder(req, res, urlparts);
            done = true;
        }

        if(done === false && /\/viewOrder/.test(req.url)){
            resMsg = viewOrder(req, res, urlparts);
            done = true;
        }

        if(done === false && /\/viewReport/.test(req.url)){
            viewReport(req, res, urlparts);
            done = true;
        }
        if(done === false && /\/accounts\/login/.test(req.url)){
            authenticate(req, res, urlparts);
            done = true;
        }

        if(done === false && /\/admin\/add/.test(req.url)){
            resMsg = addItem(req, res, urlparts);
            done = true;
        }

        if(done === false && /\/accounts\/create/.test(req.url)){
            createAccount(req, res, urlparts);
            done = true;
        }
        if (done === false && /\/findItemsByTrait/.test(req.url)) {
            findItemsByTrait(req, res, urlparts);
            done = true;
        }
    }else if(req.method == "PATCH"){
        if(done === false && req.url.startsWith("/accounts/")){
            resMsg = updateAccount(req, res, urlparts);
            done = true;
        }

        if(done === false && req.url.startsWith("/admin")){
            resMsg = modifyItem(req, res, urlparts);
            done = true;
        }
    }else if(req.method == "DELETE"){

        if(done === false && req.url.startsWith("/accounts/")){
            resMsg = deleteAccount(req, res, urlparts);
            done = true;
        }

        if(done === false && req.url.startsWith("/admin")){
            resMsg = deleteItem(req, res, urlparts);
            done = true;
        }
    }

    if(done && JSON.stringify(resMsg) != JSON.stringify({}) && resMsg != null && resMsg != undefined){
        res.writeHead(resMsg.code, resMsg.headers),
        res.end(resMsg.body);
    }
    else if(!done){
        //If no use case was found for the URL and method combo, maybe we want to load a page with that name.
        if(req.method == "GET") {
            res.writeHead(200, {'Content-Type': 'text/html'});

            if(req.url == "/")
                fs.readFile(__dirname + "/pages/index.html").then(contents => res.end(contents));
            else {
                //We use .then() and .catch() b/c fs.promises is async.
                fs.access(__dirname + "/pages" + req.url + ".html", fsc.F_OK)
                .then(() => fs.readFile(__dirname + "/pages" + req.url + ".html").then(contents => res.end(contents)))
                .catch(() => fs.readFile(__dirname + "/pages/404.html").then(contents => res.end(contents)));
            }
        }else {
            fs.access(__dirname + "/pages" + req.url + ".html", fsc.F_OK)
            .then(() => fs.readFile(__dirname + "/pages/404.html").then(contents => res.end(contents)));
        }
    }
}

//setting up mySQL database, still needs work
//from lec8 REST server example slides
const dbCon = mysql.createConnection(
    {
        host:"localhost",
        user: "root",
        password: passwd.password //change this to the password for your mysql root account
    }
)

var sqlStmt = "CREATE DATABASE IF NOT EXISTS BestestBuy";
try{
dbCon.connect(function(err)
{
    if(err){
        "ERROR: Could not connect to MYSQL database.";
        throw err;
    };
    console.log("Connected to MySQL database");

    dbCon.query(sqlStmt, function (err, result) {
        if (err)
        {
            console.log(err);
            return;
        } 
    });

    dbCon.query("USE bestestbuy", function (err, result) {
        if (err)
        {
            console.log(err);
            return;
        } 
    });

    setupSqlDatabase();
    mysqlLoaded = true;
});
}
catch(exc){
    "ERROR: Could not connect to MYSQL database.";
    throw exc;
}

fs.readFile(__dirname + "/sendgridAPI-DONOTUPLOAD.json").then(contents => {
    sApiKey = JSON.parse(contents).key;
}).catch( () => {
    console.log("ERROR: Could not find file \"sendgridAPI-DONOTUPLOAD.json\". Sendgrid email functionality is now offline.");
});

//Set up firebase for noSQL db usage
//TODO: IF YOU HAVE NOT YET DOWNLOADED THE API KEY FILE FROM DISCORD, DO SO AND DROP IT INTO THE SAME FOLDER AS SERVER.JS. DO NOT DISTRIBUTE THAT FILE.
// Your web app's Firebase configuration
var fireApp, fireDB;
fs.readFile(__dirname + "/firebaseAPI-DONOTUPLOAD.json").then(contents => {
    const firebaseConfig = JSON.parse(contents);

    // Initialize Firebase
    try{
        fireApp = fbApp.initializeApp(firebaseConfig);
        fireDB = fdb.getDatabase(fireApp);
        fireBaseLoaded = true;

        //Google reccomends listening for changes to values instead of
        //getting them every time you need them.
        currentOrderID = 0;
        const starCountRef = fdb.ref(fireDB, 'orders/newestOrderId');
        fdb.onValue(starCountRef, (snapshot) => {currentOrderID = snapshot.val()});

    }catch(error){
        console.log("Error loading firebase: vvvv");
        console.log(error);
    }
}).catch(() => {console.log("ERROR: Could not find file \"firebaseAPI-DONOTUPLOAD.json\". Firebase Orders Database could not be connected to.");});

const app = express();

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
        if(handler != undefined)
            handler(result);
    });
};


// Set up the http server -- Moved to below db stuff so that we can be sure the database is loaded and connected before any requests are
// made asynchronously through HTML.
// TODO: Convert to https. This is seemingly not as simple as just changing 'http' to 'https' as we need an SSL certifciate to upgrade to HTTPS :/ 


//http.createServer(requestHandlerHTML).listen(8080);
var dir = path.join(__dirname, 'pages');

app.use(express.static(dir), express.json(), cookieParser(), authenticateToken, router);
app.listen(8080);


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