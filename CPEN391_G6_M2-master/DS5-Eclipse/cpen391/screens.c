#include <color.h>
#include <stdio.h>
#include <main.h>
#include <string.h>
#include <time.h>

void BTScreen(int date){
	char new_char;
	char phonenumber[20];
	int i = 0;
	char temp[20];

	//set screen background to navy
	FilledRectangle(0,0,799,479,NAVY);
	Button("Connect to Phone", 200, 205, 600, 275, WHITE, 1, LIGHT_CYAN, BLACK, 2);

	printf("here\n");
	strcpy(phonenumber, "");
	int e = -1;
	while(testBT1()){

		char temp = getcharBT1();
		if(temp == '!'){
			e = i;
		}
		if(e == -1){
			phonenumber[i]= temp;
		}
		printf("ph %i %c, %s\n",i,temp, phonenumber );
		i++;
	}

	char finalpn[10];
	for(int k = 0; k<e; k++){
		finalpn[k] =phonenumber[k];
	}

	printf("pn: %s\n", finalpn);

	strcpy(temp, "10, ");
	strcat(temp,finalpn);

	printf("phone: %s\n", temp);

	BTOutMessage(temp);
	BTOutMessage("5");

	while(1){
		if(testBT1()){
			new_char = getcharBT1();
			printf("new %c\n", new_char);
			//disconnect
			if(new_char == 'c'){
				BTOutMessage("6");
				MainScreen(date);
				printf("disconnect\n");
				break;
			}
			//take a book
			else if(new_char == 'a'){
//				BookScreen(1);
				BTOutMessage("11");
				char res[10];
				char bid[10];
				strcpy(res, "");
				strcpy(bid, "");
				int j=0;
				int s=-1;
				int e =-1;
				while(1)
				{
					if(testBT()){
						res[j] = getcharBT();
						printf("res %d %c\n",j, res[j]);
						if(res[j] == '!' && s!=-1){
							break;
						} else if(res[j] == '!' && s==-1){
							s=j;
							j++;
						}
						else {
							bid[j-s-1] = res[j];
							j++;
						}

						i = 0;
					}
				}
				printf("11: %s\n", bid);
				//pass response
				BTOutMessage1(bid);
				new_char = ' ';
				strcpy(res, "");
				strcpy(bid, "");

			}
			//return a book
			else if(new_char == 'b'){
				BTOutMessage("12");
				char res[10];
				char bid[10];
				strcpy(res, "");
				strcpy(bid, "");
				int j=0;
				int s=-1;
				while(1)
				{
					if(testBT()){
						res[j] = getcharBT();
						printf("res %d %c\n",j, res[j]);
						if(res[j] == '!' && s!=-1){
							break;
						} else if(res[j] == '!' && s==-1){
							s=j;
							j++;
						}
						else {
							bid[j-s-1] = res[j];
							j++;
						}

						i = 0;
					}
				}
				printf("12: %s\n", bid);
				//pass response
				BTOutMessage1(bid);
				new_char = ' ';
				strcpy(res, "");
				strcpy(bid, "");

			}
			//leave a book
			else if(new_char == '~'){
				char res[10];
				int j=0;
				int e = -1;
				for(i = 0; i < 2000000; i++)
				{
					while(testBT1()){
						char t = getcharBT1();
						printf("1, %d %c %s\n", j, t, res);
						if(t != '~' && e == -1){
							res[j] = t;
							j++;
						} else if (t=='~'){
							e=j;
						}

						i = 0;
					}
				}

				char ft[10];
				for(int k = 0; k<j; k++){
					ft[k]=res[k];
				}
				char temp3[20];
				strcpy(temp3, "1, ");
				strcat(temp3, ft);
				printf("1: %s\n", temp3);
				BTOutMessage(temp3);

			}
		}
	}
}

/*
* Main Screen for our GUI 
* Have 3 buttons: create account, take a book and leave a book 
*/
int MainScreen(int date)
{
	Point p;
	int count = 0;
	char new_char;


	//set screen background to navy
	FilledRectangle(0,0,799,479,NAVY);

	//create 3 buttons 
//    Button("Create Account", 200, 75, 600, 145, WHITE, 1, LIGHT_CYAN, BLACK, 2);
    Button("Take A Book", 200, 205, 600, 275, WHITE, 1, LIGHT_CYAN, BLACK, 2);
    Button("Return A Book", 200, 335, 600, 405, WHITE, 1, LIGHT_CYAN, BLACK, 2);

	//Hardcode: flush bluetooth and touchscreen 
	TCFlush();
	BTFlush();

//	GPSOutMessage("$PMTK184*22<CR><LF>"); //erase flash

    while(1)
	{
		//Get the touch point coordinate 
        p = TouchGeneric();

        printf("%d\n", count);
        //get connection from phone
        if(p.x == -10){
        	new_char = getcharBT1();

        	if(new_char == '!'){
        		//send library ID to phone
        		BTOutMessage1("1");
				BTScreen(date);
				break;
        	}
        }

		//send twilio message and location if date changes 
        if (count >= 2){

			//get current date and time 
			time_t t = time(NULL);
			struct tm tm = *localtime(&t);

			#ifdef DEBUG
			printf("now: %d-%d-%d %d:%d:%d\n", tm.tm_year + 1900, tm.tm_mon + 1, tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec);
			#endif 

			//date changed 
			if (date != tm.tm_mday){

				#ifdef DEBUG
				printf("change\n");
				#endif

				//send twilio reminder
				sendTwilio();

				//get location for the library
//				GetLocation();

				date = tm.tm_mday;
			}

			count = 0;
        }

        count++;

		//touchscreen isn't pressed 
        if (p.x == 1000){
        	continue;
        }

		//press create account button
    	if(p.x >= 150 && p.x <= 650 && p.y >= 45 && p.y <= 175)
    	{
    		AccountScreen(0);
    		break;
    	}

		//press take a book button 
    	else if(p.x >= 150 && p.x <= 650 && p.y >= 175 && p.y <= 305)
    	{
    		AccountScreen(1);
    		break;
    	}

		//press leave a book button 
    	else if(p.x >= 150 && p.x <= 650 && p.y >= 305 && p.y <= 405)
    	{
    		AccountScreen(2);
    		break;
    	}
    }

    return date;
}



/*
 * Method = 0: create account
 * Method = 1: login -> TakeABook
 * Method = 2: login -> LeaveABook
 * Flags = 0: input phonenumber
 * Flags = 1: input password
 */
void AccountScreen(int method)
{
	Point p;
    int flags,key;
    char phonenumber[20];
    char password[20];
    char showpassword[20]; //show * for password
    char tmp[1];

//    GPSOutMessage("$PMTK184*22<CR><LF>"); //erase flash

	//set screen background to navy
	FilledRectangle(0,0,799,479,NAVY);

	//create a box to input phone number 
	print("Phone \nNumber:",50,100,WHITE,SILVER,2);
	FilledBorderedRectangle(150,75,350,145,WHITE,SILVER,1);

	//create a box to input password 
	print("Password:",50,230,WHITE,SILVER,2);
	FilledBorderedRectangle(150,205,350,275,WHITE,SILVER,1);

	//create back button to return to main screen 
	FilledBorderedRectangle(0,0,130,70,WHITE,SILVER,1);
	print("Back",50,30,BLACK,SILVER,2);

	//create account button
	if(method == 0)
		Button("Create Account", 150, 335, 350, 405, WHITE, 1, CYAN, BLACK, 2);
	else //login button
		Button("Login", 150, 335, 350, 405, WHITE, 1, CYAN, BLACK, 2);

	//create 4 x 3 keyboard with numbers 
	CreateKeyBoard();// in helper.c 

    flags = 0; //input phonenumber first 

    //HardCode: remove wired characters
    while(strlen(phonenumber) >= 1){
    	phonenumber[strlen(phonenumber) - 1] = '\0';
    }

    while(strlen(password) >= 1){
        password[strlen(password) - 1] = '\0';
    }

    while(strlen(showpassword) >= 1){
        showpassword[strlen(showpassword) - 1] = '\0';
    }

	//Hardcode: flush bluetooth and touchscreen 
	TCFlush();
	BTFlush();

reenter:
	while(1)
	{
		p.x = 900;
		p.y = 900;
		
		//Get pressed points coordinate 
        p = TouchGeneric(); 

		//press phone number box to input phone number 
        if (p.x >= 100 && p.x <= 400 && p.y >= 50 && p.y < 175)
        {
        	Rectangle(150,75,350,145,CYAN,3);
        	Rectangle(150,205,350,275,WHITE,3);
            flags = 0; //input phone number now
        }

		//press password box to input password 
        if (p.x >= 100 && p.x <= 400 && p.y >= 175 && p.y < 300)
        {
        	Rectangle(150,75,350,145,WHITE,3);
        	Rectangle(150,205,350,275,CYAN,3);
            flags = 1; //input password now
        }

		//Press Back button, go back to main screen 
        if(p.x <= 150 && p.y <= 100)
        {
        	break;
        }

		char response;

		//Press the login/create account button 
		if(p.x >= 100 && p.x <= 400 && p.y >= 300 && p.y <= 405)
		{
			if(method == 0) //create account now 
			{

				//send verification request as well as phonenumber and password 
				send('1',phonenumber,password);

				// Get verfication response from respberry pi 
				// 0 means success, 1 means failed 
				response = getcharBT();

				#ifdef DEBUG
				//printf("veri:%s\n", response);
				#endif

				//create account failed
				if(response -'0' == 1)
				{

					//empty the stored password 
					strcpy(password, "");
					strcpy(showpassword, "");

					#ifdef DEBUG
					printf("%s\t %s  emp\n", password, showpassword);
					#endif 

					print("PHONE NUMBER EXISTS", 160, 30, RED, SILVER,2);

					//remove the input password from the screen  
					FilledBorderedRectangle(151,206,349,274,WHITE,WHITE,0);

					//re-enter password
					flags = 1;
					goto reenter;
				}

				else //create account success
				{
	        		print("CREATE SUCCESS", 350, 60, WHITE, SILVER,2);
					break;
				}
			}

			else  //login now 
			{

				//send login request as well as phone number and password 
				send('2',phonenumber,password);

				response = getcharBT();
				printf("veri:%d\n", response);

				//login success, go to bookScreen 
				if(response -'0'==0)
				{
					BookScreen(method);
					break;
				}
				else //login failed
				{

					//delete stored password 
					strcpy(password, "");
					strcpy(showpassword, "");

					#ifdef DEBUG
					printf("%s\t %s  emp\n", password, showpassword);
					#endif 

					//Display error msg 
					print("WRONG NUMBER OR PASSWORD", 160, 30, RED, WHITE,2);

					//flush password on the screen
					FilledBorderedRectangle(151,206,349,274,WHITE,WHITE,0);

					//reenter the password 
					flags = 1;
					goto reenter;
				}
			}
		}

		//handle corresponding key pressed events
		if(flags != -1)
        {
            key = detectKeyPressed(p);

            if(key != -1)
            {

                if(key >= 0 && key <= 9) //press numbers 
                {

                    //convert int to char array
                    sprintf(tmp,"%d",key);

                    if(flags == 0)
                    {
						//store the new input numbers to phonenumber
                        strcat(phonenumber,tmp);
                    }
                    else
                    {

						//store the new input numbers to password 
                        strcat(showpassword,tmp);
                        strcat(password,tmp);

                        //show new char of password user inputs for 0.3 second then show * 
                        FilledBorderedRectangle(151,206,349,274,WHITE,WHITE,0);
                        print(showpassword,175,240,BLACK,WHITE,2);
                        
                        delay(0.3);

						//After 0.3 seconds, show * for password
                        showpassword[strlen(showpassword) - 1] = '\0';
                        strcat(showpassword,"*");
                    }
                }
                else if(key == 10) //press backspace
                { 

                    if(flags == 0)
                    {

						//delete the last stored number of phonenumber 
                        if(strlen(phonenumber) >= 1)
                            phonenumber[strlen(phonenumber) - 1] = '\0';
                    }
                    else
                    {
						//delete the last stored number of password
                        if(strlen(password) >= 1)
                        {   
                            showpassword[strlen(showpassword) - 1] = '\0';
                            password[strlen(password) - 1] = '\0';
                        }
                    }
                }
                else if(key == 11) //press enter
                { 	

                	//if users input phone number now, allow user to input password
                    if(flags == 0)
                    {	
						//highlight password box to indicate user to input password now 
                    	Rectangle(150,75,350,145,WHITE,3);
                    	Rectangle(150,205,350,275,CYAN,3);
                        flags = 1;
                    }
                    else{
                    	Rectangle(150,205,350,275,WHITE,3);
                        flags = -1;
                    }
                }

				//show new phonenumber and password on the screen  
                FilledBorderedRectangle(153,76,349,142,WHITE,WHITE,0);
	            FilledBorderedRectangle(153,206,349,272,WHITE,WHITE,0);
                print(phonenumber,175,110,BLACK,SILVER,2);
                print(showpassword,175,240,BLACK,SILVER,2);
            }
        }
	}
}

/*
* Method = 1: Take a book
* Method = 2: Return a book
*/
void BookScreen(int method)
{
	Point p;
	int i,j, count=0;
	char title[1000];

	//Hardcode: flush bluetooth and touchscreen 
	TCFlush();
	BTFlush();

	//We can scan books now 
	BTOutMessage("5");

	//set screen background to navy
	FilledRectangle(0,0,799,479,NAVY);

	//Create Done button. Press it when user finish taking a book or leaving a book
	Button("Done", 200, 395, 600, 450, BLACK, 1,CYAN, BLACK, 2);

	//create scan another book button
	Button("Scan Another Book", 200, 310, 600, 365, BLACK, 1, CYAN, BLACK, 2);

	//Boxes to display the title of book users scan
	FilledRectangle(200,50,600,280,WHITE);

	//Take a book now
	if(method == 1){

		print("Please Scan the Book You Are Taking", 200, 25, WHITE, SILVER, 2);
		BTOutMessage("4");
	}
	//return a book now
	else{

		print("Please Scan the Book And Place It In the Box", 200, 25, WHITE, SILVER, 2);
		BTOutMessage("3");
	}

	while(1)
	{
		p.x = 900;
		p.y = 900;

        //If user presses the touch screen 
        if(TestForReceivedData()){
        	p = TouchGeneric();

			//If user presses done button, 
        	if(p.x >= 150 && p.x <= 650 && p.y >= 380 && p.y <= 465)
        	{

        		BTOutMessage("6");
        		return;
        	}

        	//if scan another book is pressed
        	else if(p.x >= 150 && p.x <= 650 && p.y >= 280 && p.y <= 380){

        		FilledRectangle(0,0,800,50,NAVY);
        		delay(0.3);

        		if(method == 1){

        			print("Please Scan the Book You Are Taking", 200, 25, WHITE, SILVER, 2);
        			BTOutMessage("4");
        		}
        		else{

        			print("Please Scan the Book And Place It In the Box", 200, 25, WHITE, SILVER, 2);
        			BTOutMessage("3");
        		}

        	}
        }

		//Retrieve book title from bluetooth 
        else if(testBT()){

        	char ret = getcharBT();

        	int flag = 0;

        	if(ret -'0' == 0){

        		j = 0;
        		count++; //count the number of received title

        		strcpy(title, "");

				//Read title from Bluetooth, will timeout in 0.2 seconds
        	    for(i = 0; i < 200000; i++)
        	    {
        	    	while(testBT()){
        	    		flag = 1;
        	    		title[j] = getcharBT();
        	    		j++;
        	    		i = 0;
        	    	}
        	    }
//        	    BTFlush();

        	    if(flag == 0)
        	    	FilledRectangle(200,50,600,280,WHITE);

        	    printf("resp:%s end\n", title);

				//if it is a valid title with more than 1 character, parse it and display the title on the screen
        	    if(strlen(title) > 3){
        	    	int s = -1,e = -1,flag = 0,k = 0;
        	    	char t2[e];
        	    	strcpy(t2, "");

					//obtain the title start and end in the string to eliminate random characters
        	    	for(i = 0; i < 100000; i++){

						//get the title start
        	    		if(title[i] == '\"' && s == -1){
        	    			s = i + 1;
        	    			flag = 1;
        	    		}

						//get the title end
        	    		else if(title[i] == '\"' && s != -1){
        	    			e = i;
        	    			title[i]= '\0';

							#ifdef DEBUG
        	    			printf("e: %d\n", e);
							#endif

        	    			break;
        	    		}

        	    		//copy valid title part
        	    		if(flag){
        	    			if (flag == 1)
        	    				flag++;

        	    			else
        	    			{
								t2[k] = title[i];
								k++;
        	    			}
        	    		}
        	    	}

					#ifdef DEBUG
        	    	printf("title2: %s, %d, %d \n", t2, s, e);
					#endif

        	    	char t3[e-s+1];

        	    	strcpy(t3,"");

        	    	i = 0;

        	    	while(t2[i] != '\n' || t2[i] != '\"'){
        	    		if(i >= e - s)
        	    			break;

        	    		t3[i] = t2[i];
        	    		i++;
        	    	}

        	    	t3[i] ='\0';

					#ifdef DEBUG
        	    	printf("title3: %s \n", t3);
					#endif

					//display received title on the screen 
					print(t3, 220, 40 + count * 20, BLACK, WHITE,2);

					strcpy(t2, "");
					strcpy(t3, "");

					#ifdef DEBUG
					printf("now: %s\n", t2);
					#endif 


	        		FilledRectangle(0,0,800,50,NAVY);

        	    }
        	}
        }
	}
}


