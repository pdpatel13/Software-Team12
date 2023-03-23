
var buttonFunc1 = function()
{
    document.getElementById("CreateAcct").hidden = true;
    document.getElementById("Signin").hidden = false;
}

var buttonFunc2 = function()
{
    document.getElementById("Signin").hidden = true;
    document.getElementById("CreateAcct").hidden = false;
}


function validUser()
{
    
}

function validPassword()
{
    
}


function checkUsername()
{
    
}

function checkPassword()
{
    
}

function checkPasswordMatch()
{
    p1 = form.elements["password"];
    p2 = form.elements["password2"];

    //if (p1 != p2)
        
}

function signin()
{
    
    user = document.getElementById("signinUsername").value;
    alert("Hello " + user + "!");
}

function createAccount(request, response, body)
{
    let resMsg = {};
    request.on("end", function()
    {
        try
        {
            newAccount = JSON.parse(body);
            sqlStatement = 
            "INSERT INTO `Account Database` \
            (`UserID`, `UserName`, `Password`, `FirstName`, `LastName`, `Birthday`, `Role`, `CreditCard`, `SecurityCode`, `ExpirationDate`) \
            VALUES (1, 'D4', '1234', 'Dean', 'Ingram', '2023-03-10', 'E', 1234123412341234, 0, '2023-03-02');";
            dbCon.query(sqlStatement,function(err, result)
            {
                if (err)
                {
                    resMsg.code = 503;
                    resMsg.message = "Service Unavailable";
                    resMsg.body = 
                        "MySQL server error: CODE = " + err.code + 
                        "SQL of the failed query:" + err.sql + 
                        "Text description:" + err.message;
                        
                }
            })
        }
        catch (ex) 
        {
            resMsg.code = 500;
            resMsg.message = "Server Error";
        }
        return resMsg;
    })
}

const querystr = require('querystring');
const mysql = require("mysql2");
const port = (process.env.PORT || 3307); //8080?
const dbCon = mysql.createConnection(
    {
        host:"localhost",
        user: "root",
        password: "R00t452!" //change this to the password for your mysql root account
    }
)

var sqlStmt = "CREATE DATABASE BestestBuy";
dbCon.connect(function(err)
{
    if(err) throw err;
    console.log("Connected to MySQL database: Bestest Buy");

    try {
        dbCon.query(sqlStmt, function (err, result) {
            if (err)
            {
                console.log(err);
                return;
            } 
            console.log("Result: " + result);
        });
    } catch (error) {
        var sqlStmt = "USE BestestBuy";
        dbCon.query(sqlStmt, function (err, result) {
            if (err)
            {
                console.log(err);
                return;
            } 
            console.log("Result: " + result);
        });
    }
    
    try {
        var sqlStmt = "CREATE TABLE `Account Database` (\
            `UserID` int(10) NOT NULL,\
            `UserName` varchar(15) NOT NULL,\
            `Password` varchar(20) NOT NULL,\
            `FirstName` text NOT NULL,\
            `LastName` text NOT NULL,\
            `Birthday` date NOT NULL,\
            `Role` char(1) NOT NULL,\
            `CreditCard` bigint(16) NOT NULL,\
            `SecurityCode` int(3) NOT NULL,\
            `ExpirationDate` date NOT NULL\
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1;";
        dbCon.query(sqlStmt, function (err, result) {
            if (err)
            {
                console.log(err);
                return;
            } 
            console.log("Result: " + result);
        });
    } 
    catch (error) 
    {
        return
    }
});