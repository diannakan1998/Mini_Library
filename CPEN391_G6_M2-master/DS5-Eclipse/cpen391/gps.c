
#include <stdio.h>
#include <string.h>
#include <main.h>
#include <math.h>

#define GPS_ReceiverFifo                  (*(volatile unsigned char *)(0xFF210210))
#define GPS_TransmitterFifo               (*(volatile unsigned char *)(0xFF210210))
#define GPS_FifoControlReg                (*(volatile unsigned char *)(0xFF210214))
#define GPS_LineControlReg                (*(volatile unsigned char *)(0xFF210216))
#define GPS_LineStatusReg                 (*(volatile unsigned char *)(0xFF21021A))
#define GPS_DivisorLatchLSB               (*(volatile unsigned char *)(0xFF210210))
#define GPS_DivisorLatchMSB               (*(volatile unsigned char *)(0xFF210212))

#define HEX0_1                            (volatile unsigned int *)(0xFF200030)
#define HEX2_3                            (volatile unsigned int *)(0xFF200040)
#define HEX4_5                            (volatile unsigned int *)(0xFF200050)

/*
* Init GPS serial port
*/
void Init_GPS(void)
{
   // set bit 7 of Line Control Register to 1, to gain access to the baud rate registers
   // set Divisor latch (LSB and MSB) with correct value for required baud rate
   // set bit 7 of Line control register (LCR) back to 0 and
   // program other bits in (LCR) for 8 bit data, 1 stop bit, no parity etc
   // Reset the Fifol Reg by setting bits 1 & 2
   // Now Clear all bits in the FIFO control registers
    GPS_LineControlReg = 0x80; // set bit 7 of Line Control Register to 1,

    //Baud rate divisor value = (frequency of BR_clk) / (desired baud rate x 16)
    //desired baud rate: 9600
    GPS_DivisorLatchLSB = 0x45;
    GPS_DivisorLatchMSB = 1;

    GPS_LineControlReg = 0x03;

    GPS_FifoControlReg = 0x06; //Reset FIFO
    GPS_FifoControlReg = 0;//de-assert reset of FIFO
}

/*
* Send 1 char to GPS receiver FIFO register
*/
int putcharGPS(int c)
{
    // wait for Transmitter Holding Register bit (5) of line status register to be '1��
    // indicating we can write to the device
    // write character to Transmitter fifo register
    // return the character we printed
    while((GPS_LineStatusReg >> 5) % 2 == 0); //wait until bit 5 of LSR = 1

    GPS_TransmitterFifo = c;
    return c;
}

/*
* Read 1 char response from GPS serial port
*/
int getcharGPS(void)
{
    // wait for Data Ready bit (0) of line status register to be '1'
    // read new character from ReceiverFiFo register
    // return new character
    int new_char;

    while(GPS_LineStatusReg % 2 == 0); //wait until bit 0 of LSR is 1

    new_char = GPS_ReceiverFifo;
    return new_char;
}

/*
* Determine if GPS receives response
* 1 means receive FIFO is not empty, 0 means receive FIFO is empty now
*/
int GPS_TestForReceivedData(void)
{
    return (GPS_LineStatusReg % 2 == 1);
}

/*
* Send message string to GPS serial port
*/
void GPSOutMessage(char* message)
{
    int length,i;

    length = strlen(message);

    for(i = 0; i < length; i++)
    {
        putcharGPS(message[i]);
    }

}

/**
Get current location and send the current location of the library to the raspberry pi to the server
**/
void GetLocation(void)
{
    //take a log snap shot: $PMTK186,1*20<CR><LF>
    //reply: $PMTK001,186,3*3F
    //erase flash: $PMTK184*22<CR><LF>
    //reply: $PMTK001,184,3*3D
    //stop logging: $PMTK185,1*23<CR><LF>
    //reply: $PMTK001,185,3*3C

    int i,j;
    char response[1000];
    i = 0;

    double lat, lon;
    char *latitude;
    char *longitude;
    int latf=0, lonf=0;

	GPSOutMessage("$PMTK184*22<CR><LF>"); //erase flash
	GPSOutMessage("$PMTK186,1*20<CR><LF>");//take a log snap shot
	GPSOutMessage("$PMTK622,1*29<CR><LF>");//dump content of gps data logger

	// read response from gps data logger
	// will timeout after no communication for about 0.05 seconds
	i = 0;

	for(j = 0; j < 500000; j++){

		if(GPS_TestForReceivedData())
		{
			response[i] = GPS_ReceiverFifo;
			i++;
			j = 0;

			if (i > 900)
				break;
		}
	}

	i = 0;

	#ifdef DEBUG
    printf("%s\n",response);
	#endif

	char ggack[] = "GPGGA";
	int k = 0;
	char gga[100];

	char *instance;
	char *rest = response;

	//find gpgga string by splitting the response by $
	while ((instance = strtok_r(rest, "$", &rest))){

		  char tempck[7];
		  memcpy(tempck, &instance[0], 5);
		  tempck[5] = '\0';

		  #ifdef DEBUG
		  printf("ins1: %s\n", instance);
		  printf("\n here\n %s\n\n", tempck);
		  #endif

		  if (strcmp(ggack, tempck) == 0)
		  {
			  if (k > 0)
			  {
				  strcpy(gga, instance);

				  #ifdef DEBUG
				  printf("%s", gga);
				  #endif

				  break;
			  }
			  k++;
		  }
	  }


	//finding the correct string to parse
	  printf("%s", gga);

	 rest = gga;

	 //parse gga to latitude and longitude
	 while ((instance = strtok_r(rest, ",", &rest))){

		 #ifdef DEBUG
		 printf("ins2: %s\n", instance);
		 #endif

		 if (k == 3)
		 {
			 latitude = instance;
		 }
		 else if(k == 4)
		 {
			 //if the latitude is south then standardize the number to be negative
			 if(strcmp(instance,"S") == 0)
			 {
				 latf = 1;
			 }
		 }
		 else if (k == 5)
		 {
			 longitude = instance;
		 }
		 else if(k == 6)
		 {
			 //if the longitude is west then standardize the number to be negative
			 if(strcmp(instance, "W")==0){
				 lonf = 1;
			 }
			 break;
		 }

		 k++;
	 }

	#ifdef DEBUG
	printf("lat, long: %s %d, %s %d\n",latitude, latf, longitude, lonf);
	#endif

	 //latitude/longitude parse to double
	 lat = strToDouble(latitude);
	 lon = strToDouble(longitude);
	 int lat2,lon2;
	 lat2 = lat;
	 lon2=lon;
	//change signs according to flags
	 if(latf)
	 {
		 lat = 0- lat;
	 }

	 if(lonf)
	 {
		 lon = 0- lon;
	 }

	#ifdef DEBUG
	 printf("lat: %lf, long: %lf\n", lat, lon);
	#endif

	 //generating message to be sent to raspberry pi for updating the location
	 char msg[100] = "8, ";
	 char temp[50], temp2[50];

	//change the type to double
	snprintf(temp, 50, "%f", lat);
	strcat(msg, temp);

	//change the type to double
	 snprintf(temp2, 50, "%f", lon);
	 strcat(msg, ", ");
	 strcat(msg, temp2);

	 //#ifdef DEBUG
	 printf("msg: %s, temp: %s\n", msg, temp2);
	 //#endif

	BTFlush();

	//sending the msg to bluetooth
	 BTOutMessage(msg);

	//getting the return response
	 char ret = getcharBT();

	 #ifdef DEBUG
	 printf("respn: %s\n", ret);
	 #endif

	 //clear response string
	 strcpy(response, "");
	 *HEX2_3= (int)lat2;
	 *HEX0_1 = (int) lon2;

}

/*
* helper function to change latitude or longitude from string to double
*/
double strToDouble(char* str){
    char *instance;
    char *rest;
    rest = str;

	//separate by .
    instance = strtok_r(rest, ".", &rest);

    double n =0;
    int j;

    //degree parse--> the whole number
    int len = strlen(instance);

	for (j = 0; j < len - 2; j++)
    {

		#ifdef DEBUG
		printf("i: %d, %lf\n", instance[j]-'0', n);
		#endif

        n = n * 10 + instance[j] - '0';
    }

	#ifdef DEBUG
    printf("%lf\t", n);
	#endif

	//minute parse
	//getting the whole number for minutes
    double min = (instance[j] - '0') * 10 + instance[j + 1] - '0';

	//getting the decimals for minutes
    instance = strtok_r(rest, ".", &rest);

	//parse decimal
    for(j = 0; j < strlen(instance); j++){

        min += ((double)(instance[j] - '0'))/ pow(10,j + 1);
    }

	//convert minute to degrees
    n += min / 60;

	#ifdef DEBUG
    printf("min: %lf, lat: %lf\n", min, n);
	#endif

    return n;
}
