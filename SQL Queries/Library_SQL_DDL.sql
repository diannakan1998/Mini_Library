CREATE TABLE Library (

	Library_ID INT,
	
	Address varchar(25) ,
	lattitude DOUBLE,
	longitude DOUBLE,


	PRIMARY KEY (Library_ID)

);



CREATE TABLE Book (

	Book_ID INT,
	
	Title VARCHAR (80),
    Author varchar (20),
	STATUS SMALLINT,

	PRIMARY KEY (Book_ID)

);

CREATE TABLE User (

	Phone_Number varchar(12),
	PASSWORD CHAR (64),

	PRIMARY KEY (Phone_Number)

);


CREATE TABLE Book_Rental (


	Rental_ID INT,
	
	Phone_Number varchar(12),
	Book_ID INT,

	Takeout_Date DATE,
	Return_Date DATE,

	PRIMARY KEY (Rental_ID),
	
	FOREIGN KEY Phone_Number(Phone_Number) 
		REFERENCES User(Phone_Number)
		ON UPDATE CASCADE
		ON DELETE NO ACTION,
	
	FOREIGN KEY Book_ID(Book_ID) 
		REFERENCES Book(Book_ID)
		ON UPDATE CASCADE
		ON DELETE NO ACTION
);

