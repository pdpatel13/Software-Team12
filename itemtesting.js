var sql = require('mysql2');
var connection = sql.createConnection({
    host: "localhost",
    user: "root",
    password: "R00t452!",
    database: "bestestbuy",
    //connectionLimit: 50
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    //connection.query("create table ProductPrices (Cost double)", function (err, result) {
    //    if (err) throw err;
    //});
    //connection.query("insert into ProductPrices(Cost) select prices.Min from bestestbuy.electronicsproductspricingdata, function (err, result) {
    //    if (err) throw err;
    //});
    //connection.query("select * from ProductPrices", function (err, result) {
    //   if (err) throw err;
    //    console.log(result);
    //});
    var BrandName = 3;
    var SortSelection = 2;
    switch (BrandName) {
        case 1:
            switch (SortSelection) {
                case 1:
                    connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Acer' order by name asc limit 10", function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    });
                    break;
                case 2:
                    connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Acer' order by name desc limit 10", function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    });
                    break;
                default:
                    connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Acer' order by name limit 10", function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    });
            }
            break;
        case 2:
            switch (SortSelection) {
                case 1:
                    connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Boytone' order by name asc limit 10", function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    });
                    break;
                case 2:
                    connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Boytone' order by name desc limit 10", function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    });
                    break;
                default:
                    connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Boytone' order by name limit 10", function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    });
            }
            break;
        case 3:
            switch (SortSelection) {
                case 1:
                    connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Canon' order by name asc limit 10", function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    });
                    break;
                case 2:
                    connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Canon' order by name desc limit 10", function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    });
                    break;
                default:
                    connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Canon' order by name limit 10", function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    });
            }
            break;
        case 4:
            switch (SortSelection) {
                case 1:
                    connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Dell' order by name asc limit 10", function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    });
                    break;
                case 2:
                    connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Dell' order by name desc limit 10", function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    });
                    break;
                default:
                    connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Dell' order by name limit 10", function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    });
            }
            break;
        default:
            connection.query("select * from bestestbuy.electronicsproductspricingdata order by name asc limit 10", function (err, result) {
                if (err) throw err;
                console.log(result);
            });
    }
    //connection.query("select * from bestestbuy.electronicsproductspricingdata order by name asc limit 10", function (err, result) {
    //connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Acer' order by name limit 10", function (err, result) {
    //connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Boytone' order by name limit 10", function (err, result) {
    //connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Canon' order by name limit 10", function (err, result) {
    //connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Dell' order by name limit 10", function (err, result) {
    //connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'HP' order by name asc limit 10", function (err, result) {
    //connection.query("select * from bestestbuy.electronicsproductspricingdata where brand = 'Yamaha' order by name limit 10", function (err, result) {
    //connection.query("select * from bestestbuy.electronicsproductspricingdata order by prices limit 10", function (err, result) {
    //    if (err) throw err;
    //    console.log(result); // select all rows from the new table.
    //});
    connection.end();
});
var http = require('http'); // to show connected to localhost8080
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello World');
    res.end();
}).listen(8080);

