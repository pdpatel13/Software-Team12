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
                p1 = document.getElementById("password")
                p2 = document.getElementById("retype password")

                //if (p1 != p2)
                    
            }
            /*
            function createAccount(request, response, body)
            {
                let resMsg = {};
                request.on("end", function()
                {
                    try{
                        newAccount = JSON.parse(body);
                        sqlStatement = 
                        "INSERT INTO accounts VALUES ("+ "... );";
                    dbCon.query(sqlStatement,function(err, result))
                    {
                        if (err)
                        {
                            resMsg.code = 503;
                            resMsg.message = "Service Unavailable";
                            resMsg.body = 
                                "MySQL server error: CODE = " + err.code + 
                                "SQL of the failed query:" + err.sql + 
                                "Text description:" + err.sqlMessage;
                                
                        }
                    }
                    }
                    catch (ex) {
                        resMsg.code = 500;
                        resMsg.message = "Server Error";
                    }
                    return resMsg;
                }
                )
            }
            */
