/* Gets all books currently available at this library */
SELECT Title, Author FROM Book WHERE STATUS = LIBRARY_ID;

/* Gets the book given the book id scanned by the scanner */
SELECT Title, Author FROM Book WHERE Book_ID = SCANNED_ID;

/* Gets the Lattitude and Longitude from each Library */
SELECT lattitude, longitude FROM Library;

/* Gets the Average Rating for a book */
SELECT AVG(Book_Rating) FROM Book_Rental WHERE Book_ID = BOOK_ID;

/* Gets the password for a given users account (For Password Verification) */
SELECT COUNT(*) FROM User WHERE Phone_Number = PHONE_NUMBER AND Password = SHA2(PASSWORD, 256);

/* Counts the number of books at a given library */
SELECT COUNT(Book_ID) FROM Book WHERE STATUS = LIBRARY_ID;

/* Gets the Phone Numbers of all the users that have a book rental due in 3 days, along with the book title and user's name (For Twillio Nptification)*/
SELECT Phone_Number, Title, Takeout_Date + INTERVAL 21 DAY FROM User NATURAL JOIN Book_Rental NATURAL JOIN Book WHERE Takeout_Date <= NOW() - INTERVAL 18 DAY AND Return_Date IS NULL;

/* Gets a users rental history */
SELECT Title, Takeout_Date, Return_Date FROM User NATURAL JOIN Book_Rental NATURAL JOIN Book WHERE Phone_Number = PHONE_NUMBER;

#Gets a users CURRENT rentals
SELECT Title, Author FROM Book_Rental NATURAL JOIN Book WHERE Phone_Number = 1 AND Return_Date IS NULL;