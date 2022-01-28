var express = require('express')
var mysql = require('mysql');
var bodyParser = require('body-parser')

var app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//connect to db 
var pool = mysql.createPool({
  connectionLimit: 10,
  host: "librarydbg6.cbzmnqguqshv.us-east-2.rds.amazonaws.com",
  user: "LibraryMaster",
  password: "CPEN391Library",
  database: "LibraryMaster"
});



//leave a book method
app.post('/leaveabook', (req, res) => {

  var title = req.body.title;
  var author = req.body.author;
  var photo = req.body.photo;
  var libraryID = req.body.libraryid;
  var phoneNumber = req.body.phoneNumber;
  var rating = req.body.rating;

  leaveabook(title, author, photo, libraryID, rating, phoneNumber).then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: data }));
  });
});



//register method 
app.post('/signup', (req, res) => {

  var phoneNumber = req.body.phoneNumber;
  var password = req.body.password;
  var Age = req.body.Age;
  var Gender = req.body.Gender;

  register(phoneNumber, password, Age, Gender).then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ valid: data }));
  });
});



//login 
app.post('/login', function (req, res) {
  console.log("login");

  var phoneNumber = req.body.phoneNumber;
  var password = req.body.password;

  if (/^\d+$/.test(phoneNumber)) {

    checkLogin(phoneNumber, password).then(function (data) {

      res.setHeader('Content-Type', 'application/json');
      if (data[0].result == 1) {
        getUserData(phoneNumber).then(function (data) {
          res.end(JSON.stringify({ valid: 1, age: data[0].Age, gender: data[0].GENDER }));
        });
      }
      else {
        res.end(JSON.stringify({ valid: -1, age: -1, gender: -1 }));
      }
    });
  }
  else {
    res.end(JSON.stringify({ valid: -1, age: -1, gender: -1 }));
  }

});


//find available books in specific library 
app.post('/available', (req, res) => {

  var libraryID = req.body.libraryID;

  getAvailableBooks(libraryID).then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  });
});



//retrieve book rental history of specific user 
app.post('/history', (req, res) => {

  var phoneNumber = req.body.phoneNumber;

  getRentalHistory(phoneNumber).then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  });
});



//retrieve current rantals of specific user 
app.post('/curRentals', (req, res) => {

  var phoneNumber = req.body.phoneNumber;

  getCurrentRentals(phoneNumber).then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  });
});


//render book lists according to searched bookTitle, UserLatitude and UserLongitude 
app.get('/findLibraryWBook', (req, res) => {

  var bookTitle = req.body.bookTitle;
  var userLat = req.body.userLat;
  var userLong = req.body.userLong;

  findLibraryWBook(bookTitle, userLat, userLong).then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  });
});


//retrieve locations of all libraries 
app.get('/locations', (req, res) => {

  getLibraryLocations().then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  });
});


//renew books 
app.post('/renew', (req, res) => {

  var bookID = req.body.bookID;

  renew(bookID).then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  });

})


//search book by title 
app.post('/searchBook', (req, res) => {

  var title = req.body.userTitle;

  searchBook(title).then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  });

})



//book recommendation for specific user 
app.post('/recommendation', (req, res) => {

  var phoneNumber = req.body.phoneNumber;

  runPy(phoneNumber).then(function (fromRunpy) {
    console.log(fromRunpy.toString());
    res.end(fromRunpy);
  });
});


//update rating for specific book 
app.post('/updaterating', (req, res) => {

  var bookID = req.body.bookID;
  var rating = req.body.rating;
  var phonenum = req.body.phoneNumber;

  updateRating(bookID, rating, phonenum).then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  });

})


//retrieve book info by bookID
app.post('/bookinfo', (req, res) => {

  var bookID = req.body.bookID;

  bookInfo(bookID).then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  });

})

//find the most recent borrowed book in specific library 
app.post('/newbook', (req, res) => {

  var libID = req.body.libraryID;

  newbook(libID).then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  });

})

//search book in library by title and libraryID 
app.post('/searchBookinLib', (req, res) => {

  var libID = req.body.libraryID;
  var title = req.body.userTitle;

  searchBookinLib(libID, title).then(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  });

})


//search books by userLatitude,UserLongitude and bookTitle 
app.post('/findLibraryBook', (req, res) => {

  var bookTitle = req.body.bookTitle;
  var userLat = req.body.userLat;
  var userLong = req.body.userLong;

  if ((bookTitle === '' || bookTitle === null || bookTitle === undefined) && userLat !== -1 && userLong !== -1) {
    findLibrary(userLat, userLong).then(function (data) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    });
  }
  else if (userLat === -1 || userLong === -1) {
    findBooks().then(function (data) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    });
  }
  else {
    findLibraryBook(bookTitle, userLat, userLong).then(function (data) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    });
  }
});



function searchBookinLib(libID, title) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("select b.Book_ID as Book_ID,title,name,rating,image from book_author_name a,Book b,book_rating br where a.Book_ID = b.Book_ID and br.Book_ID = b.Book_ID and b.status="
        + libID + " and lower(title) like \'%" + title.toLowerCase() + "%\';", function (err, result, fields) {
          connection.release();

          if (err) {
            reject(err);
          }
          else {
            resolve(result);
          }
        })
    })
  })
}



function bookInfo(bookID) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("select b.Book_ID as Book_ID,title,name,rating,image from book_author_name a,Book b,book_rating br where a.Book_ID = " + bookID + " and a.Book_ID = b.Book_ID and br.Book_ID = b.Book_ID"
        , function (err, result, fields) {
          connection.release();

          if (err) {
            reject(err);
          }
          else {
            resolve(result);
          }
        })
    })
  })
}



function newbook(libID) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("select b.Book_ID as Book_ID,title,name,rating,image from book_author_name a,Book b,book_rating br where b.status = " + libID + " and a.Book_ID = b.Book_ID and br.Book_ID = b.Book_ID order by b.Book_ID desc limit 1"
        , function (err, result, fields) {
          connection.release();
          console.log(result);
          if (err) {
            reject(err);
          }
          else {
            resolve(result);
          }
        })
    })
  })
}

function updateRating(bookID, rating, phoneNumber) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("select max(Rental_ID) as max from Book_Rental where Book_ID = " + bookID + " and Phone_Number = " + phoneNumber
        , function (err, result, fields) {
          if (err) {
            reject(err);
          }
          else {
            var string = JSON.stringify(result);
            var json = JSON.parse(string);
            var Rental_ID = json[0].max;
            console.log(Rental_ID);
            connection.query("update Book_Rental set Ratings = " + rating + " , Return_Date = NOW() where Rental_ID = " + Rental_ID,
              function (err1, result1, fields) {

                connection.release();
                if (err1) {
                  reject(err1);
                }
                else {
                  resolve(result1);
                }
              })
          }
        })
    })
  })
}


function renew(bookID) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("select max(Rental_ID) as max from Book_Rental where Return_Date is null and Book_ID = \'" + bookID + "\'"
        , function (err, result, fields) {
          if (err) {
            reject(err);
          }
          else {
            var string = JSON.stringify(result);
            var json = JSON.parse(string);
            var Rental_ID = json[0].max;

            connection.query("select Renew from Book_Rental where Return_Date is null and Rental_ID = " + Rental_ID,
              function (err1, result1, fields) {
                if (err1) {
                  reject(err1);
                }
                else {
                  var string1 = JSON.stringify(result1);
                  var json1 = JSON.parse(string1);

                  var re = json1[0].Renew + 1;

                  connection.query("update Book_Rental set Renew = " + re + " where Rental_ID = " + Rental_ID
                    , function (err2, result2, fields) {
                      connection.release();
                      if (err2) {
                        reject(err2);
                      }
                      else {
                        resolve(result2);
                      }
                    })
                }
              })
          }
        })
    })
  })
}


function register(phoneNumber, password, Age, Gender) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("INSERT INTO User(Phone_Number,Password,Age,Gender) VALUES(" + phoneNumber + ",SHA2" + "(\"" + password + "\", 256)," + Age + "," + Gender + ")", function (err, result, fields) {
        connection.release();

        if (err) {
          resolve(0);
        }
        else {
          resolve(1);
        }
      });
    });
  });
}



function checkLogin(phoneNumber, password) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
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
};


function getUserData(phoneNumber) {
  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("SELECT Age, GENDER FROM User WHERE Phone_Number = " + phoneNumber, function (err, result, fields) {
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


function getAvailableBooks(libraryID) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("select distinct b.Book_ID as Book_ID,title,name,rating,image from book_author_name a,Book b,book_rating br where a.Book_ID = b.Book_ID and br.Book_ID = b.Book_ID and b.status="
        + libraryID, function (err, result, fields) {
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


function getRentalHistory(phoneNumber) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("SELECT distinct Book_ID, Title, NAME, Takeout_Date, Return_Date, Ratings,Image FROM Book NATURAL JOIN Book_Authors NATURAL JOIN Author NATURAL JOIN Book_Rental WHERE Phone_Number = "
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


function getCurrentRentals(phoneNumber) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("SELECT distinct Book_ID, Title, NAME,Takeout_Date, Ratings,Image, DATE_ADD(Takeout_Date, INTERVAL 18 * (Renew + 1) DAY) AS Return_Date FROM Book NATURAL JOIN Book_Authors NATURAL JOIN Author NATURAL JOIN Book_Rental WHERE Phone_Number = "
        + phoneNumber + " AND Return_Date IS NULL;", function (err, result, fields) {
          connection.release();
          console.log(result);
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


function getLibraryLocations() {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("SELECT Library_ID, Address, lattitude, longitude FROM Library order by Library_ID", function (err, result, fields) {
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


function searchBook(title) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("SELECT l.Library_ID, l.Address, l.lattitude, l.longitude FROM Library l WHERE exists(select * from Book b where lower(Title) like \'%"
        + title.toLowerCase() + "%\' and l.Library_ID=b.status);",
        function (err, result, fields) {
          connection.release();
          console.log(result);
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

function findLibraryWBook(bookTitle, userLat, userLong) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("SELECT Library_ID FROM Library WHERE Library_ID IN (SELECT STATUS FROM Book WHERE Title = " + bookTitle + ") AND Library_ID IN (SELECT Library_ID, lattitude, longitude FROM Library WHERE latitude <= " + userLat + " + 0.452185866 AND lattitude >= " + userLat + " - 0.452185866AND longitude <= " + userLong + " + (50 / (111.320 * COS(" + userLat + "))) AND longitude >= " + userLong + " - (50 / (111.320 * COS(" + userLat + "))));", function (err, result, fields) {
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



function leaveabook(title, author, photo, libraryID, rating, phoneNumber) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("select max(Book_ID) as max from  Book", function (err, result, fields) {
        if (err) {
          reject(err);
        }
        else {
          var string = JSON.stringify(result);
          var json = JSON.parse(string);
          var Book_ID = json[0].max + 1;

          connection.query("insert into Book values(" + Book_ID + " , \'" + title + "\' , " + libraryID + " , \'" + photo + "\' )", function (err1, result1, fields) {
            if (err1) reject(err1);
            else {
              connection.query("select count(*) as count from Author where lower(Name) = \'" + author.toLowerCase() + "'\;",
                function (err2, result2, fields) {
                  if (err2) reject(err2);
                  else {
                    var string1 = JSON.stringify(result2);
                    var json1 = JSON.parse(string1);

                    connection.query("select max(Rental_ID) as max from Book_Rental", function (err8, result8) {
                      if (err8) reject(err8);
                      else {
                        var string3 = JSON.stringify(result8);
                        var json3 = JSON.parse(string3);
                        var Rental_ID = json3[0].max + 1;

                        connection.query("insert into Book_Rental values(" + Rental_ID + "," + phoneNumber + "," + Book_ID + ",NOW(),NOW(), " + rating + ",0)",
                          function (err9, result9) {
                            if (err9) throw err9;
                            else {
                              if (json1[0].count == 0) {
                                connection.query("select max(Author_ID) as max from Author", function (err3, result3, fields) {
                                  if (err3) reject(err3);
                                  else {
                                    var string2 = JSON.stringify(result3);
                                    var json2 = JSON.parse(string2);

                                    var Author_ID = json2[0].max + 1;
                                    connection.query("insert into Author values(" + Author_ID + " , \'" + author + "\' )",
                                      function (err4, result4, fields) {
                                        if (err4) reject(err4);
                                        else {
                                          connection.query("insert into Book_Authors values(" + Author_ID + " , " + Book_ID + ")",
                                            function (err5, result5, fields) {
                                              connection.release();
                                              if (err5)
                                                reject(err5);
                                              else
                                                resolve(Book_ID);
                                            })
                                        }
                                      })
                                  }
                                })
                              }
                              else {
                                connection.query("select Author_ID from Author where lower(Name) = \'" + author.toLowerCase() + "'\;"
                                  , function (err6, result6, fields) {
                                    if (err6) reject(err6);
                                    else {
                                      var string3 = JSON.stringify(result6);
                                      var json3 = JSON.parse(string3);
                                      var authorID = json3[0].Author_ID;
                                      connection.query("insert into Book_Authors values(" + authorID + " , " + Book_ID + ")",
                                        function (err7, result7, fields) {
                                          connection.release();
                                          if (err7)
                                            reject(err7);
                                          else
                                            resolve(Book_ID);
                                        })
                                    }

                                  })
                              }
                            }

                          })
                      }
                    })
                  }
                })
            }
          })
        }
      });
    });
  });
}


function findLibraryBook(bookTitle, userLat, userLong) {

  var book = '%' + bookTitle.toLowerCase() + '%';

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(`SELECT Library_ID, lattitude, longitude FROM Library WHERE Library_ID IN (SELECT STATUS FROM Book WHERE Lower(Title) LIKE \'` + bookTitle + "\') "
        + `AND Library_ID IN 
      
      (SELECT Library_ID FROM Library WHERE lattitude <= ` + userLat + ` + 0.452185866 AND lattitude >= ` + userLat + ` - 0.452185866

      AND longitude <= ` + userLong + ` + (50 / (111.320 * COS(` + userLat + `))) AND longitude >= ` + userLong + ` - (50 / (111.320 * COS(` + userLat + `))));`, function (err, result, fields) {
          connection.release();
          if (err) {
            console.log(err);
            reject(err);
          }
          else {
            console.log(JSON.stringify(result))
            resolve(result);
          }
        });
    });
  });
}

function findLibrary(userLat, userLong) {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("SELECT Library_ID,lattitude,longitude FROM Library WHERE lattitude <= " + userLat + " + 0.452185866 AND lattitude >= " + userLat + " - 0.452185866 AND longitude <= " + userLong + " + (50 / (111.320 * COS(" + userLat + "))) AND longitude >= " + userLong + " - (50 / (111.320 * COS(" + userLat + ")))", function (err, result, fields) {
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

function findBooks() {

  return new Promise(function (resolve, reject) {

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("select lattitude,longitude from library",
        function (err, result, fields) {
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

//run python script 
function runPy(phoneNumber) {

  return new Promise(function (success, nosuccess) {

    const { spawn } = require('child_process');
    const pyprog = spawn('python', ['./recommendation/ml.py', phoneNumber]);

    pyprog.stdout.on('data', function (data) {
      success(data);
    });

    pyprog.stderr.on('data', (data) => {
      console.log("error");
      nosuccess(data);
    });
  });
};


app.listen(3001, () => console.log('Server running on port 3001'))
