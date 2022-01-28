#include <color.h>
#include <stdio.h>
#include <main.h>
#include <string.h>

#define TimeOut 3000000

/*
* Remove out-of-range press and release points 
*/
Point TouchGeneric(void)
{
    Point p1, p2;
    int i;

    //TimeOut in 3 second if user doesn't press touchscreen 
    for(i = 0; i < TimeOut;i++){

    	if(ScreenTouched()){
    		break;
    	}

    	if(testBT1()){
    		printf("gobt1\n");
    		p1.x = -10;
    		p1.y = -10;
    		return p1;
    	}
    }

    if(i == TimeOut){

    	p1.x = 1000;
    	p1.y = 1000;
    	return p1;
    }

    //get press event 
    p1 = GetPress();

    //get release event 
    p2 = GetRelease();

   #ifdef DEBUG
    printf("Press x is %d,y is %d\n",p1.x,p1.y);
    printf("Release x is %d,y is %d\n",p2.x,p2.y);
    #endif

    if(p2.x >= 800 || p2.x < 0 || p2.y >= 480 || p2.y < 0)
        return p1;
    else 
        return p2;
}

/*
* Create keyboard 
*/ 
void CreateKeyBoard(void)
{
	Button("1",450,40,550,140,SILVER,1,WHITE,BLACK,3);
	Button("2",550,40,650,140,SILVER,1,WHITE,BLACK,3);
	Button("3",650,40,750,140,SILVER,1,WHITE,BLACK,3);
	Button("4",450,140,550,240,SILVER,1,WHITE,BLACK,3);
	Button("5",550,140,650,240,SILVER,1,WHITE,BLACK,3);
	Button("6",650,140,750,240,SILVER,1,WHITE,BLACK,3);
	Button("7",450,240,550,340,SILVER,1,WHITE,BLACK,3);
	Button("8",550,240,650,340,SILVER,1,WHITE,BLACK,3);
	Button("9",650,240,750,340,SILVER,1,WHITE,BLACK,3);
	Button("Delete",450,340,550,440,SILVER,1,WHITE,BLACK,3);
	Button("0",550,340,650,440,SILVER,1,WHITE,BLACK,3);
	Button("Enter",650,340,750,440,SILVER,1,WHITE,BLACK,3);
}

/*
* Helper Function to detect which key is pressed 
*/
int detectKeyPressed(Point p)
{
    if(p.x >= 450 && p.x <= 550 && p.y >= 40 && p.y <= 140)
        return 1;
    else if(p.x >= 550 && p.x <= 650 && p.y >= 40 && p.y <= 140)
        return 2;
    else if(p.x >= 650 && p.x <= 750 && p.y >= 40 && p.y <= 140)
        return 3;
    else if(p.x >= 450 && p.x <= 550 && p.y >= 140 && p.y <= 240)
        return 4;
    else if(p.x >= 550 && p.x <= 650 && p.y >= 140 && p.y <= 240)
        return 5;
    else if(p.x >= 650 && p.x <= 750 && p.y >= 140 && p.y <= 240)
        return 6;
    else if(p.x >= 450 && p.x <= 550 && p.y >= 240 && p.y <= 340)
        return 7;
    else if(p.x >= 550 && p.x <= 650 && p.y >= 240 && p.y <= 340)
        return 8;
    else if(p.x >= 650 && p.x <= 750 && p.y >= 240 && p.y <= 340)
        return 9;
    else if(p.x >= 450 && p.x <= 550 && p.y >= 340 && p.y <= 440)
        return 10; //press delete 
    else if(p.x >= 550 && p.x <= 650 && p.y >= 340 && p.y <= 440)
        return 0;
    else if(p.x >= 650 && p.x <= 750 && p.y >= 340 && p.y <= 440)
        return 11; //press enter 
    return -1; // no key is pressed 
}

/*
* Send phonenumber and password to repsberry pi for verification
*/
void send(char method,char* phonenumber, char* password)
{
	char temp[100];
	temp[0] = method;
	temp[1] = ',';
	temp[2] = ' ';

	strcat(temp,phonenumber);
	strcat(temp,", ");
	strcat(temp,password);

    #ifdef DEBUG
	printf("%s\n",temp);
    #endif 
    
	BTOutMessage(temp);
}

