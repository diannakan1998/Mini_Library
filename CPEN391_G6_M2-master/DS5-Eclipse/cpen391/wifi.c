/*
 * wifi.c
 *
 *  Created on: Jan 22, 2019
 *      Author: dianna
 */
#include <main.h>
#include <string.h>
#include <stdio.h>


//define some registers
#define WIFI_ReceiverFifo                  (*(volatile unsigned char *)(0xFF210240))
#define WIFI_TransmitterFifo               (*(volatile unsigned char *)(0xFF210240))
#define WIFI_InterruptEnableReg            (*(volatile unsigned char *)(0xFF210242))
#define WIFI_InterruptIdentificationReg    (*(volatile unsigned char *)(0xFF210244))
#define WIFI_FifoControlReg                (*(volatile unsigned char *)(0xFF210244))
#define WIFI_LineControlReg                (*(volatile unsigned char *)(0xFF210246))
#define WIFI_ModemControlReg               (*(volatile unsigned char *)(0xFF210248))
#define WIFI_LineStatusReg                 (*(volatile unsigned char *)(0xFF21024A))
#define WIFI_ModemStatusReg                (*(volatile unsigned char *)(0xFF21024C))
#define WIFI_ScratchReg                    (*(volatile unsigned char *)(0xFF21024E))
#define WIFI_DivisorLatchLSB               (*(volatile unsigned char *)(0xFF210240))
#define WIFI_DivisorLatchMSB               (*(volatile unsigned char *)(0xFF210242))


/*
* Init WIFI Serial port
*/
void Init_WIFI(void)
{
    // set bit 7 of Line Control Register to 1, to gain access to the baud rate registers
    // set Divisor latch (LSB and MSB) with correct value for required baud rate
    // set bit 7 of Line control register back to 0 and
    // program other bits in that reg for 8 bit data, 1 stop bit, no parity etc
    // Reset the Fifo抯 in the FiFo Control Reg by setting bits 1 & 2
    // Now Clear all bits in the FiFo control registers
    WIFI_LineControlReg = 0x80; // set bit 7 of Line Control Register to 1,

    //Baud rate divisor value = (frequency of BR_clk) / (desired baud rate x 16)
    //desired baud rate: 115200 --27
    WIFI_DivisorLatchLSB = 27;
    WIFI_DivisorLatchMSB = 0;

    WIFI_LineControlReg = 0x03;

    WIFI_FifoControlReg = 0x06; //Reset FIFO
    WIFI_FifoControlReg = 0;//de-assert reset of FIFO

}

/*
* Send 1 char to WIFI serial port 
*/
int putcharWIFI(int c)
{
    // wait for Transmitter Holding Register bit (5) of line status register to be '1'
    // indicating we can write to the device
    // write character to Transmitter fifo register
    // return the character we printed
    while((WIFI_LineStatusReg >> 5) % 2 == 0); //wait until bit 5 of LSR = 1

    WIFI_TransmitterFifo = c;

    return c;

}

/*
* Return the char WIFI gets from WIFI 
*/
int getcharWIFI(void)
{
// wait for Data Ready bit (0) of line status register to be '1'
// read new character from ReceiverFiFo register
// return new character
    int new_char;

    while(WIFI_LineStatusReg % 2 == 0); //wait until bit 0 of LSR is 1

    new_char = WIFI_ReceiverFifo;

    return new_char;
}

/*
* Determine if WIFI receives response 
* 1 means receive FIFO is not empty, 0 means receive FIFO is empty now 
*/
int WIFITestForReceivedData(void)
{
    return (WIFI_LineStatusReg % 2 == 1);
}

/*
* Remove/flush the UART receiver buffer by removing any unread characters
*/
void WIFIFlush(void)
{
    int c;

    // while bit 0 of Line Status Register == 1
    // read unwanted char out of fifo receiver buffer
    while(WIFI_LineStatusReg % 2 == 1)
    {
        c = WIFI_ReceiverFifo;
    }

    return; //nomorecharacterssoreturn
}

/*
* Send a string message to WIFI 
*/
void WIFISendMessage(char* message)
{
    int length,i;

    length = strlen(message);

    for(i = 0; i < length; i++)
    {
        putcharWIFI(message[i]);
    }
}

/*
* Send Twilio message 
*/
void sendTwilio(void){
	int i,j=0;
	char response[10000];

	//flush bluetooth and wifi 
	BTFlush();
	WIFIFlush();

	strcpy(response, "");

	#ifdef DEBUG
	printf("response: %s end\n", response);
	#endif

	BTOutMessage("7");

	//get response from bluetooth 
	for(i = 0; i < 2000000; i++)
	{
		if(testBT()){
			response[j] = getcharBT();
			j++;
			i = 0;
		}
	}

//	#ifdef DEBUG
	printf("response in send twilio function%s\n", response);
//	#endif

	char *instance;
	char *rest = response;
	j = 0;

	//separating the whole response into separate small instances by splitting with }{
	 while (instance = strtok_r(rest, "}{", &rest)){
		 char *temp = strcpy(temp, instance);

		 #ifdef DEBUG
		 printf("temp:%s\n", temp);
		 #endif 

		// check if the instance starts with "  then it is a valid instance
		 if(temp[0] == '\"'){

			 //generate twilio command message to send to wifi 
			 char msg[200] = "check_wifi(";
			 strcat(msg,temp);
			 strcat(msg, ")\n");

			 printf("msg: %s", msg);

			//send message to WIFI 
			 WIFISendMessage(msg);
			 delay(1);
			 
			 //flush WIFI response 
			 WIFIFlush();

			 j++;

			 #ifdef DEBUG
			 printf("j: %d\n", j);
			 #endif

		 }
		 else{
			 break;
		 }
	 }

	#ifdef DEBUG
	printf("done send twilio");
	#endif 
}


