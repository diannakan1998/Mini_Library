#include <main.h>
#include <color.h>
#include <time.h>
#include <stdio.h>
#include <string.h>

#define HEX0_1                            (volatile unsigned int *)(0xFF200030)
#define HEX2_3                            (volatile unsigned int *)(0xFF200040)
#define HEX4_5                            (volatile unsigned int *)(0xFF200050)


int main(void){

	//init serial ports
	Init_Touch();

	Init_BT();

	Init_GPS();

	Init_WIFI();
	*HEX2_3 = 0;
	*HEX0_1 = 0;
	*HEX4_5=0;

//	calibrate();

	int date = 0;

	while(1){
		date =MainScreen(date);
	}

    return 0 ;
}

void delay(double seconds){
	clock_t start;

	start = clock();

	while(clock() - start <= seconds * CLOCKS_PER_SEC);
}
