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

var pool = mysql.createPool({
  connectionLimit: 10,
  host: "librarydbg6.cbzmnqguqshv.us-east-2.rds.amazonaws.com",
  user: "LibraryMaster",
  password: "CPEN391Library",
  database: "LibraryMaster"
});

app.get('/pingcheck', (req, res) => {
  res.sendStatus(200)
});

app.get('/', (req, res) => {

  if (req.cookies.loginData === undefined){
    res.send(pug.renderFile('website/login.pug'));
  }
  else{
    res.send(pug.renderFile('website/home.pug'));
  }


});

app.post('/userLogin', function(req, res){    

  var phoneNumber = req.body.inputPhoneNumberLogin;
  var password = req.body.inputPasswordLogin;

  checkLogin(phoneNumber, password).then(function(data) {

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

app.post('/userSignUp', function(req, res){    

  var phoneNumber = req.body.inputPhoneNumberSignUp;
  var password = req.body.inputPasswordSignUp;


  checkUserExists(phoneNumber).then(function(data){

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


app.get('/home', (req, res) => {

  if (req.cookies.loginData === undefined){
    res.send(pug.renderFile('website/login.pug'));
  }
  else{
    res.send(pug.renderFile('website/home.pug'));
  }
});


app.get('/available', (req, res) => {

  var booksData;
  var locationData;

  var libraryID = req.query.libraryID;

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


app.get('/history', (req, res) => {


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

app.get('/logout', (req, res) => {

  res.clearCookie('loginData');
  res.send(pug.renderFile('website/login.pug'));

});


function getAvailableBooks(libraryID){

  return new Promise(function(resolve, reject) {

    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query("SELECT * FROM Book WHERE STATUS = " + libraryID + ";", function (err, result, fields) {
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


function getUsersCheckedBooks(phoneNumber){

  return new Promise(function(resolve, reject) {

    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query("SELECT Title, Author, Takeout_Date FROM Book_Rental NATURAL JOIN Book WHERE Phone_Number = " + phoneNumber + " AND Return_Date IS NULL;", function (err, result, fields) {
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


function getAccountHistory(phoneNumber){

  return new Promise(function(resolve, reject) {

    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query("SELECT Title, Author, Takeout_Date, Return_Date FROM User NATURAL JOIN Book_Rental NATURAL JOIN Book WHERE Phone_Number = " + phoneNumber + " AND Return_Date IS NOT NULL;", function (err, result, fields) {
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