INSERT INTO Library(Library_ID, Address, Lattitude, Longitude) VALUES(0, '2332 Main Mall, Vancouver BC', 49.262160, -123.250070), (1, '6333 West Blvd Vancouver BC', 49.228761, -123.155621), (2, '1398 The Crescent, Vancouver BC', 49.255343, -123.136395), (3, '3600 W 12th Ave, Vancouver BC', 49.261433, -123.185750);
INSERT INTO User(Phone_Number, Password) 
VALUES
('2505404348', SHA2('391', 256)), 
('1', SHA2('1', 256)), 
('7788921629', SHA2('391', 256)), 
('6047291463', SHA2('391', 256)), 
('6047108206', SHA2('391', 256)), 
('4', SHA2('391', 256));


INSERT INTO User(Phone_Number, Password,Age,Gender) 
VALUES
('2', SHA2('391', 256),10,0), 
('3', SHA2('1', 256),40,1), 
('5', SHA2('391', 256),11,1), 
('6', SHA2('391', 256),15,1), 
('7', SHA2('391', 256),30,0), 
('8', SHA2('391', 256),50,0);

INSERT INTO User(Phone_Number, Password,Age,Gender) 
VALUES
('9', SHA2('391', 256),20,0), 
('10', SHA2('1', 256),30,1), 
('11', SHA2('391', 256),21,1), 
('12', SHA2('391', 256),25,1), 
('13', SHA2('391', 256),40,0), 
('14', SHA2('391', 256),10,0);

INSERT INTO Book(Book_ID, Title, Author, Status) VALUES(0, 'A Game of Thrones', 'George R.R Martin', 0), (1, 'A Clash of Kings', 'George R.R. Martin', 0),
	(2, 'A Storm of Swords', 'George R.R. Martin', -1), (3, 'A Feast for Crows', 'George R.R. Martin', 0), (4, 'A Dance with Dragons', 'George R.R. Martin', -1),
	(5, 'Harry Potter and the Sorcerer\'s Stone', 'J.K. Rowling', -1), (6, 'Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 3),
	(7, 'Harry Potter and the Prisoner of Azkaban', 'J.K. Rowling', -1), (8, 'Harry Potter and the Goblet of Fire', 'J.K. Rowling', 2), 
	(9, 'Harry Potter and the Order of the Phoenix', 'J.K. Rowling', 2), (10, 'Harry Potter and the Half-Blood Prince', 'J.K. Rowling', 1),
	(11, 'Harry Potter and the Deathly Hallows', 'J.K. Rowling', 0),
	(12, 'The Hunger Games', 'Suzanne Collins', 1), (13, 'Catching Fire', 'Suzanne Collins', 1),
	(14, 'MockingJay', 'Suzanne Collins', 3);


INSERT INTO Book_Rental(Rental_ID, Phone_Number, Book_ID, Takeout_Date, Return_Date,Ratings) 
	VALUES
		
		(0, '2505404348', 10, NOW() - INTERVAL 65 DAY, NOW() - INTERVAL 45 DAY,2),
		(1, '6047291463', 12, NOW() - INTERVAL 56 DAY, NOW() - INTERVAL 36 DAY,3),
		(2, '2505404348', 11, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 25 DAY,4),
		#rental to send twillio to dianna
		(3, '7788921629', 15, NOW() - INTERVAL 18 DAY, NULL,5),
	
		(4, '6047108206', 14, NOW() - INTERVAL 17 DAY, NULL,2),
		(5, '6047291463', 17, NOW() - INTERVAL 12 DAY, NULL,1),
		(6, '2505404348', 12, NOW() - INTERVAL 1 DAY, NULL,3);
		
INSERT INTO Book_Rental(Rental_ID, Phone_Number, Book_ID, Takeout_Date, Return_Date,Ratings) 
	VALUES
		
		(7, '2505404348', 10, NOW() - INTERVAL 65 DAY, NOW() - INTERVAL 45 DAY,2),
		(8, '6047291463', 12, NOW() - INTERVAL 56 DAY, NOW() - INTERVAL 36 DAY,3),
		(9, '2505404348', 11, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 25 DAY,4),
		#rental to send twillio to dianna
		(10, '7788921629', 15, NOW() - INTERVAL 18 DAY, NULL,5),
	
		(11, '6047108206', 14, NOW() - INTERVAL 17 DAY, NULL,2),
		(12, '6047291463', 7, NOW() - INTERVAL 12 DAY, NULL,1),
		(13, '2505404348', 12, NOW() - INTERVAL 1 DAY, NULL,3);

INSERT INTO Book_Rental(Rental_ID, Phone_Number, Book_ID, Takeout_Date, Return_Date,Ratings) 
	VALUES
		
		(14, '2505404348', 3, NOW() - INTERVAL 65 DAY, NOW() - INTERVAL 45 DAY,2),
		(15, '6047291463', 6, NOW() - INTERVAL 56 DAY, NOW() - INTERVAL 36 DAY,3),
		(16, '2505404348', 8, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 25 DAY,4),
		#rental to send twillio to dianna
		(17, '7788921629', 9, NOW() - INTERVAL 18 DAY, NULL,5),
	
		(18, '6047108206', 14, NOW() - INTERVAL 17 DAY, NULL,2),
		(19, '6047291463', 13, NOW() - INTERVAL 12 DAY, NULL,1),
		(20, '2505404348', 1, NOW() - INTERVAL 1 DAY, NULL,3);

INSERT INTO Book(Book_ID, Title, Status)
Values 
(19,"Wuthering Heights",1),
(20,"Lord of the Flies",1),
(21,"The Curious Incident of the Dog in the Night-Time",1);

Insert into Author Values
(5,"Emily Brontë"),
(6," William Golding"),
(7," Mark Haddon");

Insert into Book_Authors Values
(5,18),
(5,19),
(6,20),
(7,21);


INSERT INTO Book(Book_ID, Title, Status)
Values 
(22,"Wuthering Heights",0),
(23,"Lord of the Flies",0),
(24,"The Curious Incident of the Dog in the Night-Time",0);

Insert into Book_Authors Values
(5,22),
(6,23),
(7,24);


INSERT INTO Book(Book_ID, Title, Status) values
(25, 'Harry Potter and the Sorcerer\'s Stone',3), 
(26, 'Harry Potter and the Chamber of Secrets',3),
(27, 'Harry Potter and the Prisoner of Azkaban',3),
(28, 'Harry Potter and the Goblet of Fire', 3), 
(29, 'Harry Potter and the Order of the Phoenix',3);

Insert into Book_Authors Values
(1,25),
(1,26),
(1,27),
(1,28),
(1,29);


INSERT INTO Book(Book_ID, Title, Status) values
(30, 'Harry Potter and the Sorcerer\'s Stone',2), 
(31, 'Harry Potter and the Chamber of Secrets',2),
(32, 'Harry Potter and the Prisoner of Azkaban',2),
(33, 'Harry Potter and the Goblet of Fire', 2), 
(34, 'Harry Potter and the Order of the Phoenix',2);

Insert into Book_Authors Values
(1,30),
(1,31),
(1,32),
(1,33),
(1,34);

insert into Author
value (10,"Ernest Hemingway");


insert into Book_Rental values
(29,"2505404348",16,NOW(),NOW(),3,0),
(30,"2505404348",17,NOW(),NOW(),4,0),
(31,"2505404348",18,NOW(),NOW(),2,0),
(32,"2505404348",19,NOW(),NOW(),5,0),
(33,"2505404348",20,NOW(),NOW(),1,0),
(34,"2505404348",21,NOW(),NOW(),1,0),
(35,"2505404348",22,NOW(),NOW(),3,0),
(36,"2505404348",23,NOW(),NOW(),5,0),
(37,"6047291463",24,NOW(),NOW(),3,0),
(38,"6047291463",25,NOW(),NOW(),4,0),
(39,"6047291463",26,NOW(),NOW(),2,0),
(40,"6047291463",27,NOW(),NOW(),5,0),
(41,"1",28,NOW(),NOW(),3,0),
(42,"1",29,NOW(),NOW(),4,0),
(43,"1",30,NOW(),NOW(),2,0),
(44,"7788921629",31,NOW(),NOW(),5,0),
(45,"7788921629",32,NOW(),NOW(),1,0),
(46,"7788921629",33,NOW(),NOW(),1,0),
(47,"6047108206",34,NOW(),NOW(),3,0),
(48,"6047108206",35,NOW(),NOW(),5,0),
(49,"6047108206",36,NOW(),NOW(),3,0),
(50,"1",37,NOW(),NOW(),4,0),
(51,"6047291463",37,NOW(),NOW(),2,0),
(52,"6047291463",37,NOW(),NOW(),5,0);


insert into Book_Rental values
(53,"2505404348",30,NOW(),NOW(),1,0),
(54,"2505404348",20,NOW(),NOW(),3,0),
(55,"2505404348",24,NOW(),NOW(),5,0),
(56,"2505404348",27,NOW(),NOW(),4,0),
(57,"2505404348",29,NOW(),NOW(),1,0),
(58,"2505404348",25,NOW(),NOW(),2,0),
(59,"2505404348",20,NOW(),NOW(),4,0),
(60,"2505404348",27,NOW(),NOW(),5,0),
(61,"6047291463",26,NOW(),NOW(),2,0),
(62,"6047291463",21,NOW(),NOW(),3,0),
(63,"6047291463",22,NOW(),NOW(),4,0),
(64,"6047291463",24,NOW(),NOW(),1,0),
(65,"1",20,NOW(),NOW(),1,0),
(66,"1",24,NOW(),NOW(),3,0),
(67,"1",37,NOW(),NOW(),2,0),
(68,"7788921629",39,NOW(),NOW(),3,0),
(69,"7788921629",37,NOW(),NOW(),4,0),
(70,"7788921629",23,NOW(),NOW(),2,0),
(71,"6047108206",27,NOW(),NOW(),5,0),
(72,"6047108206",27,NOW(),NOW(),1,0),
(73,"6047108206",30,NOW(),NOW(),3,0),
(74,"1",37,NOW(),NOW(),1,0),
(75,"6047291463",32,NOW(),NOW(),5,0),
(76,"6047291463",28,NOW(),NOW(),3,0);


update Book_Rental 
set Takeout_Date = '2019-03-05'
where Rental_ID >= 29 and Rental_ID <= 76;