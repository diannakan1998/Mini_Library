#include <stdio.h>
#include <string.h>
#include <main.h>

#define BT_ReceiverFifo                  (*(volatile unsigned char *)(0xFF210200))
#define BT_TransmitterFifo               (*(volatile unsigned char *)(0xFF210200))
#define BT_FifoControlReg                (*(volatile unsigned char *)(0xFF210204))
#define BT_LineControlReg                (*(volatile unsigned char *)(0xFF210206))
#define BT_LineStatusReg                 (*(volatile unsigned char *)(0xFF21020A))
#define BT_DivisorLatchLSB               (*(volatile unsigned char *)(0xFF210200))
#define BT_DivisorLatchMSB               (*(volatile unsigned char *)(0xFF210202))

#define TimeOut 2000000

/*
* Init Bluetooth Serial port
*/
void Init_BT1(void)
{
   // set bit 7 of Line Control Register to 1, to gain access to the baud rate registers
   // set Divisor latch (LSB and MSB) with correct value for required baud rate
   // set bit 7 of Line control register (LCR) back to 0 and
   // program other bits in (LCR) for 8 bit data, 1 stop bit, no parity etc
   // Reset the Fifo¡¯s in the FIFO Control Reg by setting bits 1 & 2
   // Now Clear all bits in the FIFO control registers
    BT_LineControlReg = 0x80; // set bit 7 of Line Control Register to 1,

    //Baud rate divisor value = (frequency of BR_clk) / (desired baud rate x 16)
    //desired baud rate: 115000 -- 27
    BT_DivisorLatchLSB = 27;
    BT_DivisorLatchMSB = 0;

    BT_FifoControlReg = 0x06; //Reset FIFO
    BT_FifoControlReg = 0;//de-assert reset of FIFO

    BT_LineControlReg = 0x03;

}

/*
* Send 1 char to Bluetooth Transmit FIFO register
*/
int putcharBT1(int c)
{
    // wait for Transmitter Holding Register bit (5) of line status register to be '1¡®
    // indicating we can write to the device
    // write character to Transmitter fifo register
    // return the character we printed
    while((BT_LineStatusReg >> 5) % 2 == 0); //wait until bit 5 of LSR = 1

    BT_TransmitterFifo = c;

    return c;
}

/*
* Read 1 char response from bluetooth receiver FIFO register
*/
int getcharBT1(void)
{
    // wait for Data Ready bit (0) of line status register to be '1'
    // read new character from ReceiverFiFo register
    // return new character
    int new_char,i;

    for(i = 0; i < TimeOut; i++){

    	if(testBT1())
    		break;
    }

    if(i == TimeOut)
    	return 10000;

    new_char = BT_ReceiverFifo;

    return new_char;
}

/*
* Test if bluetooth received any response
* 1 means receive FIFO is not empty, 0 means receive FIFO is empty now
*/
int testBT1(void)
{
    return (BT_LineStatusReg % 2 == 1);
}

/*
* Flush BT received data
*/
void BTFlush1(void)
{
    int c;

    while(testBT1()){
    	c = BT_ReceiverFifo;
    }
}

/*
* Send a message string to bluetooth
*/
void BTOutMessage1(char* message)
{
    int length,i;

    length = strlen(message);

//    putcharBT('~'); //start of message

    for(i = 0; i < length; i++)
    {
        putcharBT1(message[i]);
    }

    putcharBT1('~'); //end of message

}

