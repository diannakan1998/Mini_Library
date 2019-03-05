INSERT INTO Library(Library_ID, Address, Lattitude, Longitude) VALUES(0, '2332 Main Mall, Vancouver BC', 49.262160, -123.250070), (1, '6333 West Blvd Vancouver BC', 49.228761, -123.155621), (2, '1398 The Crescent, Vancouver BC', 49.255343, -123.136395), (3, '3600 W 12th Ave, Vancouver BC', 49.261433, -123.185750);
INSERT INTO User(Phone_Number, Password) VALUES('2505404348', SHA2('391', 256)), ('1', SHA2('1', 256)), ('7788921629', SHA2('391', 256)), ('6047291463', SHA2('391', 256)), ('6047108206', SHA2('391', 256)), ('4', SHA2('391', 256));


INSERT INTO Book(Book_ID, Title, Author, Status) VALUES(0, 'A Game of Thrones', 'George R.R Martin', 0), (1, 'A Clash of Kings', 'George R.R. Martin', 0),
	(2, 'A Storm of Swords', 'George R.R. Martin', -1), (3, 'A Feast for Crows', 'George R.R. Martin', 0), (4, 'A Dance with Dragons', 'George R.R. Martin', -1),
	(5, 'Harry Potter and the Sorcerer\'s Stone', 'J.K. Rowling', -1), (6, 'Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 3),
	(7, 'Harry Potter and the Prisoner of Azkaban', 'J.K. Rowling', -1), (8, 'Harry Potter and the Goblet of Fire', 'J.K. Rowling', 2), 
	(9, 'Harry Potter and the Order of the Phoenix', 'J.K. Rowling', 2), (10, 'Harry Potter and the Half-Blood Prince', 'J.K. Rowling', 1),
	(11, 'Harry Potter and the Deathly Hallows', 'J.K. Rowling', 0),
	(12, 'The Hunger Games', 'Suzanne Collins', 1), (13, 'Catching Fire', 'Suzanne Collins', 1),
	(14, 'MockingJay', 'Suzanne Collins', 3);


INSERT INTO Book_Rental(Rental_ID, Phone_Number, Book_ID, Takeout_Date, Return_Date) 
	VALUES
		
		(0, '2505404348', 0, NOW() - INTERVAL 65 DAY, NOW() - INTERVAL 45 DAY),
		(1, '6047291463', 12, NOW() - INTERVAL 56 DAY, NOW() - INTERVAL 36 DAY),
		(2, '2505404348', 1, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 25 DAY),
		#rental to send twillio to dianna
		(3, '7788921629', 5, NOW() - INTERVAL 18 DAY, NULL),
	
		(4, '6047108206', 4, NOW() - INTERVAL 17 DAY, NULL),
		(5, '6047291463', 7, NOW() - INTERVAL 12 DAY, NULL),
		(6, '2505404348', 2, NOW() - INTERVAL 1 DAY, NULL);
		
		