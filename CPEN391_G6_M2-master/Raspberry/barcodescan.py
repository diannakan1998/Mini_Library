import RPi.GPIO as GPIO
import time
import pymysql
import serial
import os
import datetime
from thermalprinter import *

#import sys
#import termios

#hardcoded ID for this library (every library has an RPI running a python script with a different library id)
LIBRARY_ID = '0'

#library lattitude and longitude
LATTITUDE = ''
LONGITUDE = ''

#Last Input from barcode scanner
BARCODE_NUM = ''

#Last input from Login
userPhoneNumber = ''


#function to send a query to the MySQL DB
def sendDBQuery(query, cur):
        return cur.execute(query)


#function to send data to bluetooth chip over serial
def sendBTData(message):
        ser.write(message.encode())
        return message


#function to receive bluetooth data
def receiveBTData():
        
        data = ''
        seen = False

        #keep saving chars
        while True:
                #read one char at a time (decode the binrary to a char)
                temp = ser.read().decode()
                print(temp)
                
                #save the char
                data += temp
                
                #mark if the first ~ is found
                if temp == '~' and seen == False:
                        seen = True
                
                elif temp == '~' and seen == True:

                    #if the second ~ is found return the data
                    return data



#function to decode bluetooth message, removing noise and organising parameters
'''
function finds the first ~ and ignores everything before it to iliminate garbage
function then organises all parameters seperated by commas and spaces into an array of strings
once the function sees another ~ it stops parsing
'''
def decodeMessage(message):
        #init the array
        data = ['' for x in range(10)] 
        params = 0
        i = 0
        print(message)

        #find the first ~
        while message[i] != '~':
                i += 1

        #record the current parse position and mark the start point
        i += 1
        eol = i
        while True:

                #if a comma or ~ is seen
                if message[i] == ',' or message[i] == '~':

                        #record the data from the endpoint of the last parameter to the current position
                        data[params] = message[eol:i]

                        #if the character was a ~, exit and return the array
                        if message[i] == '~':
                                return data
                        #otherwise increment the current pos, save the end location of the current param
                        #and inc number of params to index the array
                        i += 1
                        eol = i + 1
                        params += 1

                        
                #if the character was not a comma or a ~ move onto the next character    
                i += 1



                        
def parseBarcode(BARCODE_NUM):

        for i in range(len(BARCODE_NUM)):
                print("i: {} num: ".format(i))
                print(BARCODE_NUM[i:i+3] )
                if BARCODE_NUM[i:i+3] == '09 ':

                    for j in range(i+3, len(BARCODE_NUM)):
                        print('\n j {}\n'.format(j))
                        if BARCODE_NUM[j] not in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] or j == len(BARCODE_NUM) - 1:

                            temp = BARCODE_NUM[i+3:j+1]
                            return temp[:len(temp)].strip()

                        


#function to open the latch with the servo
def latchOpen():

        servo.ChangeDutyCycle(7.5)
        time.sleep(1)
        servo.ChangeDutyCycle(2.5)


#function to close the latch with the servo
def latchClose():
        servo.ChangeDutyCycle(2.5)
        time.sleep(1)
        servo.ChangeDutyCycle(7.5)




#Servo GPIO
GPIO.setmode(GPIO.BOARD)

GPIO.setup(33, GPIO.OUT)

servo = GPIO.PWM(33, 50)

servo.start(7.5)



#serial variable
ser = serial.Serial( port = '/dev/serial0',
                        baudrate = 115200,
                        parity = serial.PARITY_NONE,
                        stopbits = serial.STOPBITS_ONE,
                        bytesize = serial.EIGHTBITS,
                        timeout = 2)



        


def mainLoop():

        connected = False

        #since script runs on startup, keep trying to connect to the DB since it may not be connected to wifi right away
        while not connected:
        
                try:
                        #DB connection
                        db = pymysql.connect(host ='librarydbg6.cbzmnqguqshv.us-east-2.rds.amazonaws.com', 
                                        user = 'LibraryMaster', passwd = 'CPEN391Library',
                                        db = 'LibraryMaster')
                        cur = db.cursor()


                
                        connected = True
                except:
                        print("Failed to connect, retrying")

                        
        try:
                print("Connected to DB")
                #message = '~1, Bob Ross How to Paint, Bob Ross~'
                while True:

                        
                        
                        print("Waiting for serial data")
                        message = receiveBTData()
                        data = decodeMessage(message)
                        print(data)
                        message = ''
                        

                        if data[0] == '1':

                                try:
                                        
                                        #leave a new book
                                        printer.barcode_height(80)
                                        printer.barcode_position(BarCodePosition.BELOW)
                                        printer.barcode_width(3)
                                        printer.barcode(str(int(data[1])), BarCode.CODE39)
                                        printer.feed(2)
                                        sendBTData('0')

                                        '''
                                        query = '(SELECT * FROM (SELECT MAX(Book_ID) FROM Book)MaxID)'
                                        sendDBQuery(query, cur)
                                        newBookID = cur.fetchall()[0][0]
                                        print(newBookID)
                                        print(data[1])
                                        print(data[2])
                                                
                                        query = "INSERT INTO Book(Book_ID, Title, STATUS) VALUES(%s + 1, \'%s\', %s);" %(newBookID, data[1], LIBRARY_ID)

                                        try:
                                                print(sendDBQuery(query, cur))
                                                print(db.commit())

                                        except:
                                                print('sql failed')
                                        

                                        query = "SELECT COUNT(*) FROM Author WHERE Name = \'%s\'" %(data[2])
                                        sendDBQuery(query, cur)
                                        authorCheck = cur.fetchall()[0][0]

                                        
                                        if authorCheck > 0:
                                                #Author Exists

                                                query = "SELECT Author_ID FROM Author WHERE Name = \'%s\'" %(data[2])
                                                sendDBQuery(query, cur)
                                                authorID = cur.fetchall()[0][0]
                                                
                                                query = "INSERT INTO Book_Authors(Author_ID, Book_ID) VALUES(%s, %s + 1)" %(authorID, newBookID)
                                                sendDBQuery(query, cur)
                                                db.commit()

                                        else:
                                                #need to add new author
                                                query = "SELECT MAX(Author_ID) FROM Author"
                                                sendDBQuery(query, cur)
                                                newAuthorID = cur.fetchall()[0][0]

                                                query = "INSERT INTO Author(Author_ID, Name) VALUES(%s + 1, \'%s\');" %(newAuthorID, data[2])
                                                sendDBQuery(query, cur)

                                                
                                                query = "INSERT INTO Book_Authors(Author_ID, Book_ID) VALUES(%s + 1, %s + 1)" %(newAuthorID, newBookID)
                                                sendDBQuery(query, cur)
                                                db.commit()
                                        '''

                                        
                                        
                                        


                                except:
        
                                        sendBTData('1')

                                                




                                '''
                                #create account

                                #sql query to create a new account
                                query = "INSERT INTO User(Phone_Number, Password) VALUES(%s, SHA2(\'%s\', 256));" %(data[1], data[2])
                                try:
                                        sendDBQuery(query, cur)
                                        db.commit()
                                        sendBTData('0')
                                        
                                except:
                                        sendBTData('1')
                                '''
                                
                                
                         
                        elif data[0] == '2':
                                #login verification
                                        
                                if data[1] != '' and data[2] != '':
                                        print(data[0] + '\n' + data[1] + '\n' + data[2] + '\n')

                                        query = 'SELECT COUNT(*) FROM User WHERE Phone_Number = %s AND Password = SHA2(\"%s\", 256);' %(data[1], data[2])
                                        sendDBQuery(query, cur)

                                        #print(cur.fetchall()[0][0])
                                        dbData = cur.fetchall()
                                        print(dbData)

                                        if dbData[0][0] > 0:

                                                sendBTData('0')
                                                userPhoneNumber = data[1]
                                                
                                                print('Good Pass')
                                        else:
                                                sendBTData('1')
                                                print('Bad Pass')
                                                
                                                
                                else:
                                        
                                        sendBTData('1')
                                        print('Bad Pass')

                                        
                        elif data[0] == '3':
                                #return scan
                                
                                
                                BARCODE_NUM = input("Scan Barcode")
                                BARCODE_NUM = parseBarcode(BARCODE_NUM)
                                
                                print(BARCODE_NUM)
                                query = "UPDATE Book SET STATUS = %s WHERE Book_ID = %s" %(LIBRARY_ID, BARCODE_NUM)
                                print(sendDBQuery(query, cur))
                                db.commit()
                                print(query)

                                query = "UPDATE Book_Rental SET Return_Date = NOW() - INTERVAL 1 DAY WHERE Rental_ID = (SELECT * FROM (SELECT MAX(Rental_ID) FROM Book_Rental WHERE Phone_Number = %s AND Book_ID = %s AND Takeout_Date >= NOW() - INTERVAL 30 DAY)ID)" %(userPhoneNumber, BARCODE_NUM)
                                print(sendDBQuery(query, cur))
                                db.commit()
                                print(query)

                                query = 'SELECT Title FROM Book WHERE Book_ID = %s' %(BARCODE_NUM)
                                sendDBQuery(query, cur)
                                #print(cur.fetchall()[0][0])
                                

                                sendBTData('0 \"{}\"'.format(cur.fetchall()[0][0]))
                                
                        
                        elif data[0] == '4':
                                #borrow scan

                               
                                BARCODE_NUM = input("Scan Barcode")
                                BARCODE_NUM = parseBarcode(BARCODE_NUM)

                                print(BARCODE_NUM)
                                        
                                query = "UPDATE Book SET STATUS = -1 WHERE Book_ID = %s" %(BARCODE_NUM)
                                print(sendDBQuery(query, cur))
                                db.commit()

                                query = "INSERT INTO Book_Rental(Rental_ID, Phone_Number, Book_ID, Takeout_Date, Return_Date) VALUES((SELECT * FROM (SELECT MAX(Rental_ID) FROM Book_Rental)MaxID) + 1, %s, %s, NOW() - INTERVAL 1 DAY, NULL)" %(userPhoneNumber, BARCODE_NUM)
                                print(query)
                                sendDBQuery(query, cur)
                                db.commit()

                                query = 'SELECT Title FROM Book WHERE Book_ID = %s' %(BARCODE_NUM)
                                sendDBQuery(query, cur)
                                #print(cur.fetchall()[0][0])

                                print(sendBTData('0 \"{}\"'.format(cur.fetchall()[0][0])))

                                


                        elif data[0] == '5':
                                #open latch
                                print('Opening Latch')
                                latchOpen()
                                sendBTData('0')
                                
                        elif data[0] == '6':
                                #close latch
                                print('Closing Latch')
                                latchClose()
                                sendBTData('0')


                        elif data[0] == '7':
                                #get phone numbers for return reminder

                                
                                #change <= to = 
                                query = 'SELECT Phone_Number, Title, Takeout_Date, DATE_ADD(Takeout_Date, INTERVAL 21 * (Renew + 1)DAY) AS Sched_Return_Date FROM User NATURAL JOIN Book_Rental NATURAL JOIN Book WHERE Takeout_Date <= DATE_ADD(NOW(), INTERVAL 18 * -(Renew + 1)DAY) AND Return_Date IS NULL;'
                                print(sendDBQuery(query, cur))
                                #print(cur.fetchall())

                                responce = ''

                           

                                #formats data for proper responce message
                                for row in cur.fetchall():

                                        print(row)

                                        responce += '{\"('
                                        responce += row[0][:3]
                                        responce += ') '
                                        responce += row[0][3:6]
                                        responce += '-'
                                        responce += row[0][6:10]
                                        responce += '\",\"'
                                        responce += row[1]
                                        responce += '\",\"'
                                        responce += row[2].strftime('%d-%m-%y')
                                        
                                        responce += '\"}'

                                responce += '|'

                                print(responce + '\n')

                                sendBTData(responce)

                        elif data[0] == '8':
                                #update gps of libary on DB

                                LATTITUDE = data[1]
                                LONGITUDE = data[2]

                                print(LATTITUDE + ', ' + LONGITUDE + '\n')


                                query = 'UPDATE Library SET lattitude = %s, longitude = %s WHERE Library_ID = %s;' %(LATTITUDE, LONGITUDE, LIBRARY_ID)

                                print(query)
                                print(sendDBQuery(query, cur))
                                db.commit()

                                #sendBTData('0')

                        elif data[0] == '10':
                                #app login
                                userPhoneNumber = data[1]

                        elif data[0] == '11':
                                #app take a book

                                
                                BARCODE_NUM = input("Scan Barcode")
                                BARCODE_NUM = parseBarcode(BARCODE_NUM)

                                print(BARCODE_NUM)
                                        
                                query = "UPDATE Book SET STATUS = -1 WHERE Book_ID = %s" %(BARCODE_NUM)
                                print(sendDBQuery(query, cur))
                                db.commit()

                                query = "INSERT INTO Book_Rental(Rental_ID, Phone_Number, Book_ID, Takeout_Date, Return_Date) VALUES((SELECT * FROM (SELECT MAX(Rental_ID) FROM Book_Rental)MaxID) + 1, %s, %s, NOW() - INTERVAL 1 DAY, NULL)" %(userPhoneNumber, BARCODE_NUM)
                                print(query)
                                sendDBQuery(query, cur)
                                db.commit()

                                

                                sendBTData("!" + BARCODE_NUM + "!")
                                print("done")

                        elif data[0] == '12':
                                      
                                #app return a book
                                BARCODE_NUM = input("Scan Barcode")
                                BARCODE_NUM = parseBarcode(BARCODE_NUM)
                                
                                print(BARCODE_NUM)
                                query = "UPDATE Book SET STATUS = %s WHERE Book_ID = %s" %(LIBRARY_ID, BARCODE_NUM)
                                print(sendDBQuery(query, cur))
                                db.commit()
                                print(query)

                                query = "UPDATE Book_Rental SET Return_Date = NOW() - INTERVAL 1 DAY WHERE Rental_ID = (SELECT * FROM (SELECT MAX(Rental_ID) FROM Book_Rental WHERE Phone_Number = %s AND Book_ID = %s AND Takeout_Date >= NOW() - INTERVAL 30 DAY)ID)" %(userPhoneNumber, BARCODE_NUM)
                                print(sendDBQuery(query, cur))
                                db.commit()
                                print(query)

                                

                                sendBTData("!" + BARCODE_NUM+ "!")
                        else:

                                print("Command Not Recognised")

                        
                                


        except ConnectionResetError:
                print("Lost Connection Reconnecting...")
                mainLoop()

                

        finally:
                GPIO.cleanup()


with ThermalPrinter(port='/dev/ttyUSB0') as printer:

        mainLoop()
        



