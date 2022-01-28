import mysql.connector
from sklearn.neighbors import NearestNeighbors
from scipy.sparse import csr_matrix as sparse_matrix
import numpy as np
import json,ast
import sys

'''
    Library Book Product Recommendation Using Amazon Product Recommendation Algorithm 
    Using Normalized KNN to Find the Most Similar Items of User's Current Rentals 
        By Constructing User-Product Sparse Matrix Whose Values Are Ratings
    Input: Rental History and Ratings  
    Output: 5 Nearest Neighbours of Curr-Rental
'''

def ProductRecommendation():
    PhoneNumber = sys.argv[1]

    db = mysql.connector.connect(user='LibraryMaster',
                                 password='CPEN391Library',
                                 host='librarydbg6.cbzmnqguqshv.us-east-2.rds.amazonaws.com',
                                 database='LibraryMaster')

    cursor = db.cursor()

    cursor.execute("SELECT * FROM Book_Rental WHERE Phone_Number = %s GROUP BY Takeout_Date",(PhoneNumber,))
    result = cursor.fetchall()
   
    jsonObjRoot = []

    #New Users
    if len(result) == 0:
        cursor.execute("Select title,NAME,image,rating from Book b,book_rating br,book_author_name ba where ba.Book_ID = b.Book_ID and b.Book_ID = br.Book_ID order by rating desc")
        book = cursor.fetchall()
        book = np.array(book)
        
        for i in range(5):
            jsonObj = {
                "title":book[i,0],
                "Name": book[i,1],
                "image": book[i,2],
                "rating":float(book[i,3])
            }
            jsonObjRoot.append(jsonObj)

        jdata = ast.literal_eval(json.dumps(jsonObjRoot))
        print(jdata)
        db.close()
        return

    #find the recent borrowed book
    cur_item = result[len(result) - 1][2]

    cursor.execute("SELECT Book_ID,Ratings,Gender,Age FROM Book_Rental LEFT JOIN User ON Book_Rental.Phone_Number = User.Phone_Number")

    result = cursor.fetchall()

    #create user array
    users = np.zeros(len(result),dtype='int')
    index = 0

    num_rentals = len(result)
    result = np.array(result)

    items = result[:,0]
    ratings = result[:,1]
    
    #assign user_id for each rentals
    for i in range(num_rentals):
        index = index + 1
        users[i] = index

        #assign same user id if 2 rentals have same gender and age difference is less than 5
        for j in range(i):
            if result[j,2] == result[i,2] and np.absolute(result[j,3] - result[i,3]) < 5:
                users[i] = users[j]
                index = index - 1
                break

    num_users = np.max(users) + 1
    num_items = np.max(items) + 1

    #construct user, item sparse matrix
    sa = sparse_matrix((ratings, (items, users)), shape=(num_items,num_users))

    sample = sa != 0
    
    # Use K-Nearest Neighbor Algorithm to Train the Model 
    model = NearestNeighbors(n_neighbors = 5,metric = 'cosine')
    model.fit(sample)

    # Retrieve The Index of 5 Most Similar Items 
    index = model.kneighbors(sample[cur_item,:])[1].ravel()

    cursor.execute("SELECT b.Book_ID,Title,Name,Image,br.rating from Book b left join book_rating br on br.Book_ID = b.Book_ID left join book_author_name ba on ba.Book_ID = b.Book_ID")
    res = np.array(cursor.fetchall())
    book_list = res[:,][index]

    book = np.array(book_list)

    n,d = book.shape

    jsonObjRoot = []
    
    for i in range(n):
        jsonObj = {
            "title": book[i,1], 
            "Name": book[i,2],
            "image": book[i,3], 
            "rating":float(book[i,4])
        }
        jsonObjRoot.append(jsonObj)

    db.close()

    jdata = ast.literal_eval(json.dumps(jsonObjRoot))
    print(jdata)

ProductRecommendation()
