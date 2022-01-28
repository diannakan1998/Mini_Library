/*
 * main.h
 *
 *  Created on: Feb 2, 2019
 *      Author: Xueqi Zeng
 */

#ifndef MAIN_H_
#define MAIN_H_

//#define DEBUG 1

void delay(double seconds);


/*
* touchscreen.c
*/
typedef struct { int x, y; } Point ;
void Init_Touch(void);
int readResponse(void);
int ScreenTouched(void);
void WaitForTouch(void);
void calibrate(void);
Point GetPress(void);
Point GetRelease(void);
int TestForReceivedData(void);
Point TouchGeneric(void);
void TCFlush(void);

/*
* BT.c 
*/
void Init_BT(void);
int testBT(void);
int getcharBT(void);
int putcharBT(int c);
void BTOutMessage(char* message);
void BTFlush(void);


void Init_BT1(void);
int testBT1(void);
int getcharBT1(void);
int putcharBT1(int c);
void BTOutMessage1(char* message);
void BTFlush1(void);

/*
* screens.c
*/
int MainScreen(int date);
void AccountScreen(int method);
void BookScreen(int method);

/*
* Helper.c
*/
void send(char method,char* phonenumber, char* password);
int detectKeyPressed(Point p);
void CreateKeyBoard(void);


/*
* graphics.c
*/
void Button(char text[], int x1, int y1, int x2, int y2, int borderColour, int borderThickness, int fillColour, int textColour, int fontNum);
void print(char text[], int x, int y, int textColour, int backgroundcolour, int fontNum);
void FilledRectangle(int x1, int y1, int x2, int y2, int Colour);
void FilledBorderedRectangle(int x1, int y1, int x2, int y2, int FillColour, int BorderColour, int BorderThickness);
void Rectangle(int x1, int y1, int x2, int y2, int Colour, int Thickness);
void FilledCircle(int x1, int y1, int radius, int Colour);

/*
* gps.c
*/
void Init_GPS(void);
void GetLocation(void);
double strToDouble(char* str);
void GPSOutMessage(char* message);

/*
 * wifi.c
 */
void Init_WIFI(void);
void sendTwilio(void);

#endif /* MAIN_H_ */
