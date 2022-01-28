-- Calculate Average Rating for Each book 
create view book_rating as 
select b.Book_ID, avg(Ratings) as Rating from Book b
left join Book_Rental br on b.Book_ID = br.Book_ID
group by b.Book_ID;

select * from book_rating;

-- Create Book_ID and Author_Name Mapping
create view book_author_name as 
select Book_ID,Name from Author a, Book_Authors ba
where ba.Author_ID = a.Author_ID;

select * from book_author_name;