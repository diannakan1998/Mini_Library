/*
 * touchscreen.c
 *
 *  Created on: Feb 2, 2019
 *      Author: Xueqi Zeng
 */
#include <stdio.h>
#include <main.h>
#include <color.h>

#define TOUCHSCREEN_ReceiverFifo                  (*(volatile unsigned char *)(0xFF210230))
#define TOUCHSCREEN_TransmitterFifo               (*(volatile unsigned char *)(0xFF210230))
#define TOUCHSCREEN_FifoControlReg                (*(volatile unsigned char *)(0xFF210234))
#define TOUCHSCREEN_LineControlReg                (*(volatile unsigned char *)(0xFF210236))
#define TOUCHSCREEN_LineStatusReg                 (*(volatile unsigned char *)(0xFF21023A))
#define TOUCHSCREEN_DivisorLatchLSB               (*(volatile unsigned char *)(0xFF210230))
#define TOUCHSCREEN_DivisorLatchMSB               (*(volatile unsigned char *)(0xFF210232))

/*
* Send 1 char to touchscreen serial port 
*/
int sendCommand(int c)
{
    while((TOUCHSCREEN_LineStatusReg >> 5) % 2 == 0); //wait until bit 5 of LSR = 1

    TOUCHSCREEN_TransmitterFifo = c;

    return c;
}

/*
* Read 1 char response from touchscreen serial port 
*/
int readResponse(void)
{
    int new_char;

    while(TOUCHSCREEN_LineStatusReg % 2 == 0); //wait until bit 0 of LSR is 1

    new_char = TOUCHSCREEN_ReceiverFifo;

    return new_char;
}

/*****************************************************************************
 ** Initialise touch screen controller
 ******************************************************************************/
 void Init_Touch(void)
{
    // 1. Program serial port to communicate with touchscreen
    TOUCHSCREEN_LineControlReg = 0x80; // set bit 7 of Line Control Register to 1,

    //Baud rate divisor value = (frequency of BR_clk) / (desired baud rate x 16) = 0x145
    //desired baud rate: 9600
    TOUCHSCREEN_DivisorLatchLSB = 0x45;
    TOUCHSCREEN_DivisorLatchMSB = 1;

    TOUCHSCREEN_LineControlReg = 0x03;

    TOUCHSCREEN_FifoControlReg = 0x06; //Reset FIFO
    TOUCHSCREEN_FifoControlReg = 0;//de-assert reset of FIFO

    // 2. send touchscreen controller an "enable touch" command
    sendCommand(0x55);
    sendCommand(0x01);
    sendCommand(0x12);
}

/*****************************************************************************
** test if screen touched
*****************************************************************************/
int ScreenTouched(void)
{
    // return TRUE if any data received from serial port connected to
    // touchscreen or FALSE otherwise
    return (TOUCHSCREEN_LineStatusReg % 2 == 1);
}

/*****************************************************************************
 ** wait for screen to be touched
 *****************************************************************************/
void WaitForTouch()
{
    while(!ScreenTouched());

}

/*
* Fluch touchscreen received data 
*/
void TCFlush(void)
{
    int c;

    while(TestForReceivedData()){
        c = TOUCHSCREEN_ReceiverFifo;
    }
}

/*
* Test if touchscreen received any response 
* 1 means receive FIFO is not empty, 0 means receive FIFO is empty now 
*/
int TestForReceivedData(void)
{
    return (TOUCHSCREEN_LineStatusReg % 2 == 1);
}

/* a data type to hold a point/coord */
//typedef struct { int x, y; } Point ;

/*****************************************************************************
 * This function waits for a touch screen press event and returns X,Y coord
 * *****************************************************************************/
Point GetPress(void)
{
    Point p1;
    int packet[4];
    int response,x,y;
    // wait for a pen down command then return the X,Y coord of the point
    // calibrated correctly so that it maps to a pixel on screen

    //wait for pen down command: 1 
    while(1)
    {
        response = readResponse();
        if(( response >> 7) % 2 == 1 && response % 2 == 1)
            break;
    }

    //read 4 packets 
    for(int i = 0; i < 4; i++)
    {
        packet[i] = readResponse();
    }

    //read x,y coordinate from packets 
    x = ((packet[1] & 0x1F) << 7) | (packet[0] & 0x7F);
    y = ((packet[3] & 0x1F) << 7) | (packet[2] & 0x7F);

    //calibrate x,y coordinate
    p1.x = (x * 800) / 4096;
    p1.y = (y * 480) / 4096;

    return p1;
}

/*****************************************************************************
 *This function waits for a touch screen release event and returns X,Y coord
 *****************************************************************************/
Point GetRelease(void)
{
    Point p1;
    int packet[4];
    int x,y,response;
    // wait for a pen up command then return the X,Y coord of the point
    // calibrated correctly so that it maps to a pixel on screen

    //wait for pen up command: 0 
     while(1)
     {
         response = readResponse();
         if(( response >> 7) % 2 == 1 && response % 2 == 0)
             break;
     }


    for(int i = 0; i < 4; i++)
    {
        packet[i] = readResponse();
    }

    //read x,y coordinate from packets
    x = ((packet[1] & 0x1F) << 7) | (packet[0] & 0x7F);
    y = ((packet[3] & 0x1F) << 7) | (packet[2] & 0x7F);

    //calibrate x,y coordinate
    p1.x = (x * 800) / 4096;
    p1.y = (y * 480) / 4096;

    return p1;

}

/*
* Manually calibrate touch screen only in UART and HID-GENERIC MODE
* STATUS: 0x0 OK, 0x01 Unrecognized, 0x04 Timeout, 0x05 ERR_PARAM, 0xFC CAL_CANCEL
*/
void calibrate(void)
{	
	int i,j,response;

	//send calibrate command 
	sendCommand(0x55);
	sendCommand(0x02);
	sendCommand(0x14);
	sendCommand(0x02); // 9 points calibrate 

	//response: 0x55, 0x07, 0x00, 0x14, 0xFE(enter calibration mode)
	while(TestForReceivedData())
	{

		printf("%x	",TOUCHSCREEN_ReceiverFifo);
	}

	//read response for calibration of 9 points
	for(i = 1; i < 10; i++)
	{

		printf("\r\n calibrate point %d		",i);
		
		//response: 0x55, 0x02, 0x00, 0x14
		for(j = 0; j < 4; j++)
		{
			response = readResponse();
			printf("%x	",response);
		}
	}

}




