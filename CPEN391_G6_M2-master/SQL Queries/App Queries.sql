/*Gets the books and their average ratings at a given library*/
SELECT Book_ID, Image, Title, NAME, AVG(Ratings) AS Rating FROM Book NATURAL JOIN Book_Authors NATURAL JOIN Author NATURAL JOIN Book_Rental 
	WHERE STATUS = LIBRARY_ID GROUP BY Book_ID

UNION

SELECT Book_ID, Title, NAME, 0 AS Rating FROM Book NATURAL JOIN Book_Authors NATURAL JOIN Author 
    WHERE STATUS = LIBRARY_ID AND Book_ID NOT IN (SELECT Book_ID FROM Book_Rental)
;

/*Gets a users rental history */
SELECT Book_ID, Title, NAME, Takeout_Date, Return_Date, Ratings FROM Book NATURAL JOIN Book_Authors NATURAL JOIN Author NATURAL JOIN Book_Rental 
WHERE Phone_Number = GIVEN_PHONE_NUMBER AND Return_Date IS NOT NULL;

/* Gets a users current rentals*/
SELECT Book_ID, Title, NAME, Takeout_Date, Ratings FROM Book NATURAL JOIN Book_Authors NATURAL JOIN Author NATURAL JOIN Book_Rental 
WHERE Phone_Number = GIVEN_PHONE_NUMBER AND Return_Date IS NULL;

/* Updates a books rating for after a user returns a book */
UPDATE Book_Rental SET Ratings = NEW_RATING WHERE Book_ID = REVIEWED_BOOK AND Phone_Number = REVIEWER_PHONE_NUMBER;


/* Gets all the libraries within a 50 km square given a users lattitude and longitude */
SELECT Library_ID, latitude, longitude FROM Library WHERE latitude <= USER_LAT + 0.452185866 AND lattitude >= USER_LAT - 0.452185866
    AND longitude <= USER_LONG + (50 / (111.320 * COS(USER_LAT))) AND longitude >= USER_LONG - (50 / (111.320 * COS(USER_LAT)));


/*Get all the libraries in the 50 km Square that have a book in stock */
SELECT Library_ID FROM Library WHERE Library_ID IN (SELECT STATUS FROM Book WHERE Title = BOOK_TITLE)

    AND Library_ID IN 
    
    (SELECT Library_ID FROM Library WHERE latitude <= USER_LAT + 0.452185866 AND lattitude >= USER_LAT - 0.452185866
    AND longitude <= USER_LONG + (50 / (111.320 * COS(USER_LAT))) AND longitude >= USER_LONG - (50 / (111.320 * COS(USER_LAT))));



//Latitude: 1 deg = 110.574 km
//Longitude: 1 deg = 111.320*cos(latitude) km