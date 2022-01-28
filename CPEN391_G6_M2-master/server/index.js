var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var pug = require('pug');

var app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static('website'))


//sql pool for DB connections
var pool = mysql.createPool({
  connectionLimit: 10,
  host: "librarydbg6.cbzmnqguqshv.us-east-2.rds.amazonaws.com",
  user: "LibraryMaster",
  password: "CPEN391Library",
  database: "LibraryMaster"
});


//aws uptime check endpoint
app.get('/pingcheck', (req, res) => {
  res.sendStatus(200)
});


//standard domain endpoint to load login or home screen
app.get('/', (req, res) => {

  if (req.cookies.loginData === undefined){
    res.send(pug.renderFile('website/login.pug'));
  }
  else{
    res.send(pug.renderFile('website/home.pug'));
  }


});


//login form submission endpoint
app.post('/userLogin', function(req, res){    

  var phoneNumber = req.body.inputPhoneNumberLogin;
  var password = req.body.inputPasswordLogin;

  //verify login credentials with DB 
  checkLogin(phoneNumber, password).then(function(data) {

    //set session cookie and redirect to homepage if valid
    //otherwise display alert
    if(data[0].result == 1){
      res.cookie('loginData' , phoneNumber, {expire: 60 * 60 * 1000 + Date.now()}).send(pug.renderFile('website/home.pug'));
    }
    else{
      res.send(pug.renderFile('website/alert.pug', {
        alertMessage: "Incorrect username or password"
        }));
    }

  });

});


//sign up form submission endpoint
app.post('/userSignUp', function(req, res){    

  var phoneNumber = req.body.inputPhoneNumberSignUp;
  var password = req.body.inputPasswordSignUp;

  //check if the username is already registered to a user
  checkUserExists(phoneNumber).then(function(data){

    //display alert if user is found
    //otherwise add new user, set session cookie, and redirect to the home page
    if(data[0].result != 0){
      res.send(pug.renderFile('website/alert.pug', {
        alertMessage: "This user already exists"
        }));
    }
    else{
      signUpUser(phoneNumber, password).then(function(data) {
        res.cookie('loginData' , phoneNumber, {expire: 60 * 60 * 1000 + Date.now()}).send(pug.renderFile('website/home.pug'));
      });
    }
  });

});


//home page endpoint
app.get('/home', (req, res) => {

  //if the session cookie is not set, redirect to login
  //otherwise load homepage
  if (req.cookies.loginData === undefined){
    res.send(pug.renderFile('website/login.pug'));
  }
  else{
    res.send(pug.renderFile('website/home.pug'));
  }
});


//endpoint for the individual library information pages
app.get('/available', (req, res) => {

  var booksData;
  var locationData;

  var libraryID = req.query.libraryID;

  //get list of available books as well as location information from the DB
  Promise.all([getAvailableBooks(libraryID), getLocation(libraryID)]).then(function(data) {

    booksData = data[0];
    locationData = data[1];

  }).then(function(data) {

    res.send(pug.renderFile('website/available.pug', {
      books: booksData,
      lattitude: locationData[0].lattitude,
      longitude: locationData[0].longitude
    }));
  });

});


//endpoint for user account history page
app.get('/history', (req, res) => {

  //get user's book transaction history as well as currently checked books
  Promise.all([getAccountHistory(req.cookies.loginData), getUsersCheckedBooks(req.cookies.loginData)]).then(function(data) {

    transactionHistory = data[0];
    currentlyCheckedBooks = data[1];

  }).then(function(data) {

    res.send(pug.renderFile('website/history.pug', {
      transactions: transactionHistory,
      checkedBooks: currentlyCheckedBooks
    }));
  });

});


//app logout endpoint
app.get('/logout', (req, res) => {

  //remove session cookie and redirect to login screen
  res.clearCookie('loginData');
  res.send(pug.renderFile('website/login.pug'));

});


//retrieve all available books at a specific library
function getAvailableBooks(libraryID){

  return new Promise(function(resolve, reject) {
    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query(`SELECT Book_ID, Title, NAME, AVG(Ratings) AS Rating FROM Book NATURAL JOIN Book_Authors NATURAL JOIN 
                        Author NATURAL JOIN Book_Rental WHERE STATUS = ` + libraryID + ` GROUP BY Book_ID UNION SELECT Book_ID, Title, NAME, 0 AS Rating 
                        FROM Book NATURAL JOIN Book_Authors NATURAL JOIN Author WHERE STATUS = ` + libraryID + 
                        " AND Book_ID NOT IN (SELECT Book_ID FROM Book_Rental);", function (err, result, fields) {
        connection.release();
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  });
}


//get the location of a specific library
function getLocation(libraryID){

  return new Promise(function(resolve, reject) {

    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query("SELECT lattitude, longitude FROM Library WHERE Library_ID = " + libraryID + ";", function (err, result, fields) {
        connection.release();
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  });
}


//get the current rentals for a specific user
function getUsersCheckedBooks(phoneNumber){

  return new Promise(function(resolve, reject) {

    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query(`SELECT Book_ID, Title, NAME, Takeout_Date, Ratings FROM Book NATURAL JOIN Book_Authors 
                        NATURAL JOIN Author NATURAL JOIN Book_Rental WHERE Phone_Number = ` + phoneNumber + ` 
                        AND Return_Date IS NULL;`, function (err, result, fields) {
        connection.release();
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  });
}


//get the past transactions for a specific user
function getAccountHistory(phoneNumber){

  return new Promise(function(resolve, reject) {

    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query(`SELECT Book_ID, Title, NAME, Takeout_Date, Return_Date, Ratings FROM Book NATURAL JOIN 
                        Book_Authors NATURAL JOIN Author NATURAL JOIN Book_Rental WHERE Phone_Number = ` 
                        + phoneNumber + " AND Return_Date IS NOT NULL;", function (err, result, fields) {
        connection.release();
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  });
}


//check login credentials for a user
function checkLogin(phoneNumber, password){

  return new Promise(function(resolve, reject) {

    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query("SELECT COUNT(*) as result FROM User WHERE Phone_Number = " + phoneNumber + " AND PASSWORD = SHA2(\"" + password + "\", 256);", function (err, result, fields) {
        connection.release();
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  });
}


//check if an account already exists in the DB
function checkUserExists(phoneNumber){

  return new Promise(function(resolve, reject) {

    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query("SELECT COUNT(*) as result FROM User WHERE Phone_Number = " + phoneNumber + ";", function (err, result, fields) {
        connection.release();
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  });

}


//add new user account
function signUpUser(phoneNumber, password){

  return new Promise(function(resolve, reject) {

    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query("INSERT INTO User (Phone_Number, PASSWORD) VALUES (" + phoneNumber + ", " + " SHA2(\"" + password + "\", 256));", function (err, result, fields) {
        connection.release();
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  });

}


app.listen(3000, () => console.log('Server running on port 3000'))