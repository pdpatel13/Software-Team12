var sql = require('mysql2');
var http = require('http');
var db = sql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "R00t452!",
        database: "bestestbuy"
    }
);
db.connect(function(err)
{
    if(err) throw err;
});

db.query("CREATE TABLE if not exists `Accounts` (\
  `userID` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
  `UserName` varchar(20) UNIQUE NOT NULL,\
  `Email` varchar(40) UNIQUE NOT NULL,\
  `Password` varchar(20) NOT NULL,\
  `FirstName` text,\
  `LastName` text,\
  `Birthday` date,\
  `Role` char(1),\
  `CreditCard` bigint(16),\
  `SecurityCode` int(3),\
  `ExpirationDate` date\
) ENGINE=InnoDB DEFAULT CHARSET=latin1;");

http.createServer(function(req,res)
{
  const jwt = require('jsonwebtoken');

  // Create a secret key for signing JWT tokens
  const secretKey = 'my-secret-key';

   // POST request to create a new account
   if (req.method === 'POST' && req.url === '/accounts/create') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const accountData = JSON.parse(body);
      } catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Invalid request body' }));
        return;
      }

      var post = JSON.parse(body);
      var username = post.username;
      var email = post.email;
      var password = post.password;
      
      var query = "INSERT INTO `Accounts` (`UserName`, `Email`, `Password`) VALUES (?, ?, ?)";
      db.query(query, [username, email, password], function(err, result, fields) {
        if (err && err.code === 'ER_DUP_ENTRY') {
          res.statusCode = 409;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Username or email already exists' }));
          return;
        }
        else if (err) {
          throw err;
        }
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ accountId: result.insertId }));
      });      
    });
  }


  // POST request for user authentication (login)
  if (req.method === 'POST' && req.url === '/accounts/login') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk;
    });

    req.on('end', function() {
      var post = JSON.parse(body);
      var email = post.email;
      var password = post.password;

      // Check if user exists and password is correct
      var query = "SELECT * FROM `Accounts` WHERE `Email` = ? AND `Password` = ?";
      db.query(query, [email, password], function(err, result, fields) {
        if (err) throw err;

        // If no user found or password is incorrect, return error response
        if (result.length === 0) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Invalid email or password' }));
          return;
        }

        // If user exists and password is correct, generate JWT token and return it in the response
        const token = jwt.sign({ userId: result[0].userID }, secretKey);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ token: token }));
      });
    });
  }

  // Protected routes - require authentication

  //GET request to view account info
  if (req.method === 'GET' && req.url.startsWith('/accounts')) {
    const token = req.headers.authorization?.split(' ')[1];

    // Verify JWT token
    try {
      const decodedToken = jwt.verify(token, secretKey);

      // If token is valid, continue with the request
      const accountId = req.url.split('/')[2];

      // Select the row where UserID equals the ID of the authenticated user
      var query = `SELECT * FROM Accounts WHERE UserID = ${decodedToken.userId}`;

      db.query(query, function (err, result, fields) {
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

  //PATCH request to update account info
  if (req.method === 'PATCH' && req.url.startsWith('/accounts/')) {
    const token = req.headers.authorization?.split(' ')[1];
  
    // Verify JWT token
    try {
      const decodedToken = jwt.verify(token, secretKey);
  
      // If token is valid, continue with the request
      let body = '';
        
      req.on('data', (chunk) => {
        body += chunk;
      });
      
      req.on('end', () => {
        const accountId = req.url.split('/')[2];
        let accountData = {}; // Initialize accountData to an empty object
        try {
          accountData = JSON.parse(body);
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
        db.query(query, function (err, result, fields) {
          if (err) throw err;
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ message: 'Account updated successfully' }));
        });
      });
    } catch (error) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Invalid token' }));
      return;
    }
  }
  
  // DELETE request to delete an account
  if (req.method === 'DELETE' && req.url.startsWith('/accounts/')) {
    const token = req.headers.authorization?.split(' ')[1];

    // Verify JWT token
    try {
      const decodedToken = jwt.verify(token, secretKey);

      // If token is valid, continue with the request
      const accountId = req.url.split('/')[2];

      // Select the row where UserID equals the ID of the authenticated user and the account ID matches the requested account ID
      var query = `DELETE FROM Accounts WHERE UserID = ${decodedToken.userId}`;

      db.query(query, function (err, result, fields) {
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

}).listen(8080);