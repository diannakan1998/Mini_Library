#include <main.h>
#include <color.h>
#include <time.h>
#include <stdio.h>
#include <string.h>

#define HEX0_1                            (volatile unsigned int *)(0xFF200030)
#define HEX2_3                            (volatile unsigned int *)(0xFF200040)
#define HEX4_5                            (volatile unsigned int *)(0xFF200050)

void main(void)
{
	Init_BT();
	char c, Message[100] ;
	int i;
	while(1){
		printf("\r\nEnter Message for Bluetooth Controller:") ;
 		gets(Message); // get command string from user keyboard
 		BTOutMessage(Message) ; // write string to BT device
 		// if the command string was NOT "$$$" send \r\n
 		if(strcmp(Message, "$$$") != 0) { // $$$ puts BT module into command mode
			putcharBT('\r') ;
 			putcharBT('\n') ;
 		}
 		// now read back acknowledge string from device and display on console,
 		// will timeout after no communication for about 2 seconds
 		for(i = 0; i < 2000000; i ++) {
 			if(testBT() == 1) {
				c = getcharBT() ;
				putchar(c) ;
				i=0 ; // reset timer if we got something back
 			}
 		}

	}
}


//int main(void){
//
//	//init serial ports
//	Init_Touch();
//
//	Init_BT();
//	Init_BT1();
//
//	Init_WIFI();
//	*HEX2_3 = 0;
//	*HEX0_1 = 0;
//	*HEX4_5=0;
//
//	printf("something");
////	calibrate();
//
//	int date = 0;
//
//	while(1){
//		date =MainScreen(date);
//	}
//
//    return 0 ;
//}

void delay(double seconds){
	clock_t start;

	start = clock();

	while(clock() - start <= seconds * CLOCKS_PER_SEC);
}
