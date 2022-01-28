SELECT * FROM Book_Rental WHERE Phone_Number = %s GROUP BY Takeout_Date;

SELECT Book_ID,Ratings,Gender,Age FROM Book_Rental 
LEFT JOIN User ON Book_Rental.Phone_Number = User.Phone_Number;

SELECT b.Book_ID,Title,Name,Image,br.rating from Book b
left join book_rating br on br.Book_ID = b.Book_ID 
left join book_author_name ba on ba.Book_ID = b.Book_ID;