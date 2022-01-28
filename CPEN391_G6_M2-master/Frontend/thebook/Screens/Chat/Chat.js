import React from 'react';
import {View,StyleSheet, AsyncStorage} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Head from '../Components/Head';
import {DirectLine} from "botframework-directlinejs";
import {Container} from "native-base";
import Geocode from "react-geocode";


//API Key for Google
Geocode.setApiKey("AIzaSyCXVvN-WgMeA5ztKGsjNrP0JbMh2-OI8B8");


//Network connection to connect to bot
const directLine = new DirectLine({
  secret: "RXqnJyo47Gc.AlYOchKeXqGS8k9eNGB9IluZVLYzswDjcUujweY-BbY"
});


//function to add on information to the bot message object so it can be displayed with
//Gifted Chat
const botMessageToGiftedMessage = botMessage => ({
  ...botMessage,
  _id: botMessage.id,
  createdAt: botMessage.timestamp,
  user: {
    _id: 2,
    name: "React Native",
    avatar:
      "https://cdn.iconscout.com/public/images/icon/free/png-512/avatar-user-business-man-399587fe24739d5a-512x512.png"
  }
});


//function to create new message in a format for the bot to understand with the user's text
function giftedMessageToBotMessage(message) {
  return {
    from: { id: 1, name: "John Doe" },
    type: "message",
    text: message.text
  };
}




export default class Chat extends React.Component {
  

  static navigationOptions = {
    header: null
    };

    constructor(props) {
      super(props);

      global.messages = [];

      this.state = {
        messages: [],
        //place to store data that needs to be saved
        data: [{}],
        //users location when they open this page, used to handle some of the chatbot requests that are location based
        location: {},
        //user's phone number
        phoneNumber: "",
        address: ""
      }

      this.getRecommendations = this.getRecommendations.bind(this);

        //opens connection to bot and adds a listener for new messages
        directLine.activity$.subscribe(botMessage => {

          //when a new message is received, concatonate the apropriate data to the bots message
          this.addResults(botMessage, this.state.phoneNumber).then((newMessage) => {
            if(botMessage.from.id == "TABLAB_Chat_Bot")

            //clear state data
            this.setState({data: [{}]});
            console.log("State after message added:\n\n" + JSON.stringify(this.state.messages))
          });

          
        });
     
    }



/*
  * Convert Latitude, Longitude to Address with Google API
  */
 convertAddress(latitude, longitude) {

    return new Promise(function(resolve, reject){

      Geocode.fromLatLng(latitude, longitude).then(
        response => {
          const address = response.results[0].formatted_address;
          this.setState({
            address: address
          })

          resolve(address);
          //console.log("\n\nAddress: " + this.state.address);
        },
        error => {
          console.error(error);
        }
      );
    }.bind(this));

      
}

  //on component mount, get current logged in user's phone number
  componentDidMount(){

    AsyncStorage.getItem('@loginInfo:phoneNumber').then(num =>{

      this.setState({phoneNumber: num});
    });

  }


  //before component mounts
  componentWillMount() {

  //set the current location before mounting
    navigator.geolocation.getCurrentPosition(
      pos=> {

        this.setState({ location: pos });
      },
      err => Alert.alert(err.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

   
    //create the first message from the assistant before the chat is displayed
    this.setState({
      

      messages: [
        {
          _id: 1,
          text: 'Hello, I am your Library Assistant, here are some things I can assist you with:\n\nViewing library stock\nChecking your current rentals or history\nProviding book recomendations.',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
      ],
    })
  }


  //when a message is to be sent, send it, and add the message to the list of messages
  onSend = messages => {
    this.setState({ messages: [...messages, ...this.state.messages] });
    global.messages = [messages].concat(global.messages);
    messages.forEach(message => {
      directLine
        .postActivity(giftedMessageToBotMessage(message))
        .subscribe(() => console.log("success"), () => console.log("failed"));
    });
  };




  /*
   *Function used to add query data to bot message

    Function first identifies bot response, (determines what data needs to be added)
    second, makes nessicary API calls to get data for message, and places data in state data
    third, takes data, formats it and updates the botMessage passed to it to include the data
    last, adds the new message to the message list to be displayed

  */
  addResults(botMessage, phoneNumber){

    return new Promise(async function(resolve, reject){

      if(botMessage.from.id == "TABLAB_Chat_Bot")
       console.log("Oroginal Bot Message:\n\n" + JSON.stringify(botMessage)+ "\n\n");
  
      //If the user requested a recomendation
      if(botMessage.text == "I would recommend these books:"){
  
        //get the recomendations for the user and format them
        await this.getRecommendations(phoneNumber);
        this.state.data.forEach(book =>{
  
          botMessage.text += "\n\n" + book.title + "\nBy: " + book.Name;
        });
  
        //update the message state with the new message
        this.setState({messages: [botMessageToGiftedMessage(botMessage), ...this.state.messages]});

      }
      //If the user wanted to see their current rentals
      else if(botMessage.text == "Here are your current rentals:"){
  
          try {

            //get the list of current rentals 
            let req = fetch('http://13.59.131.180:3001/curRentals', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                phoneNumber: phoneNumber,
              }),
            }).then(async (response) => {
              let res = JSON.parse(response._bodyText)
              
              botMessage.text += "\n";
    
              //format the rentals
              await res.forEach(rental => {
    
                botMessage.text += "\n\n" + rental.Title + "\nBy: " + rental.NAME + "\nTaken out on: " + rental.Takeout_Date.substring(0, rental.Takeout_Date.indexOf("T"));
              });
             
              
              resolve(await botMessageToGiftedMessage(botMessage) );
  
              if(botMessage.from.id == "TABLAB_Chat_Bot")
                //add the new message to the list of messages
                this.setState({messages: [botMessageToGiftedMessage(botMessage), ...this.state.messages]});
  
  
            })
          } catch (error) {
            console.error(error);
          };  
        
  
      }
      //If the user requested to see their rental history
      else if(botMessage.text == "Here is your recent rental history, to view the full history please visit your profile information:"){
  
        //get the rental history
        await this.loadBookRentalHistory(phoneNumber);
  
        //format it
        for(var i = 0; i < 3; i++){
  
          botMessage.text += "\n\n" + this.state.data[i].Title + "\nBy: " + this.state.data[i].NAME + "\nTaken out on: " + this.state.data[i].Takeout_Date.substring(0, this.state.data[i].Takeout_Date.indexOf("T"))
            + "\nReturned on: " + this.state.data[i].Return_Date.substring(0, this.state.data[i].Return_Date.indexOf("T"));
        }

        if(botMessage.from.id == "TABLAB_Chat_Bot")
        //add the message to the list of messages
        this.setState({messages: [botMessageToGiftedMessage(botMessage), ...this.state.messages]});
  
      }
      //if the user wanted to find local libraries that have a specific book
      else if(botMessage.text.substring(0, 36) == "Here are the libraries near you with"){
  

        //save the book title from the message
        bookTitle = botMessage.text.substring(37, botMessage.text.length - 10);
  
        //find the libraries with the book
        await this.getLibrariesWBook(bookTitle, this.state.location.coords.latitude, this.state.location.coords.longitude);

        //format the data
        for(var i = 0; i < this.state.data.length; i ++){

          result = await this.convertAddress(this.state.data[i].lattitude, this.state.data[i].longitude)
          botMessage.text += "\n\n" + result;

        }
  
        
        if(botMessage.from.id == "TABLAB_Chat_Bot")
              //update the list of messages
                this.setState({messages: [botMessageToGiftedMessage(botMessage), ...this.state.messages]});
      }

      //if the user wanted to find local libraries
      else if(botMessage.text == "Here are the libraries close to you:"){

        //find the local libraries
        await this.getLocalLibraries(this.state.location.coords.latitude, this.state.location.coords.longitude);
  
        //format the data
          for(var i = 0; i < this.state.data.length; i ++){
            result = await this.convertAddress(this.state.data[i].lattitude, this.state.data[i].longitude)

              botMessage.text += "\n\n" + result; 
        }  


        if(botMessage.from.id == "TABLAB_Chat_Bot"){
            //add the message to the list of messages
                this.setState({messages: [botMessageToGiftedMessage(botMessage), ...this.state.messages]});
  

        }


      }

      //if the user wanted to see the stock at a specific library
      else if(botMessage.text.substring(0, 29) == "Here is the stock at Library "){

        //get the library id
        var libraryID = botMessage.text.substring(29, botMessage.text.indexOf(" l"))
        
        //get the locations of all local libraries
        await this.getLocalLibraries(this.state.location.coords.latitude, this.state.location.coords.longitude);

        //get the address of the library requested
        this.state.data.forEach(async library => {

          if(library.Library_ID == libraryID){

            await this.convertAddress(library.lattitude, library.longitude)
            botMessage.text += " " + this.state.address
          }

        });

        //get the stock at the library requested
        await this.getLibraryStock(libraryID);
  
        //format the data
        this.state.data.forEach(book => {
  
          botMessage.text += "\n\n" + book.title + "\nBy: " + book.Name;
        });

        if(botMessage.from.id == "TABLAB_Chat_Bot")
          //add the message to the list of messages
                this.setState({messages: [botMessageToGiftedMessage(botMessage), ...this.state.messages]});


      }
      //if the message is a greeting or the bot did not understand, don't add anything to the message
      else{

        if(botMessage.from.id == "TABLAB_Chat_Bot"){
          //add the message to the list of messages
          this.setState({messages: [botMessageToGiftedMessage(botMessage), ...this.state.messages]});

        resolve(await botMessageToGiftedMessage(botMessage));

        }

      }
  
  
  
    }.bind(this));
  }
  

  //function that makes backend api call to get the stock at a library given its ID
  getLibraryStock = (libraryID) => {

    console.log("param inside: " + libraryID + "\n\n");

    return new Promise(async function(resolve, reject){
  
      try {
  
          //fetch
          let req = await fetch('http://13.59.131.180:3001/available', {
              method: 'POST',
              headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                //provide library ID to backend
                libraryID: libraryID
              }),
          }).then((response) => {
              //parse JSON and sotck and put in objects in state data
              let res = JSON.parse(response._bodyText)
              this.setState({
                  data: res
              })
              console.log(res);
  
              resolve(res);
  
          })
      } catch (error) {
          console.error(error);
      };
  
    }.bind(this));
  
    }


  //function that makes backend api call to get the location of libraries nearby
getLocalLibraries = (userLat, userLong) => {

  return new Promise(async function(resolve, reject){

    try {

        //fetch
        let req = await fetch('http://13.59.131.180:3001/findLibraryBook', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              //provide backend with user lattitude and longitude
              userLat: userLat,
              userLong: userLong,
              bookTitle: ''
            }),
        }).then((response) => {

            //store data as objects and save in state data
            let res = JSON.parse(response._bodyText)
            this.setState({
                data: res
            })

            console.log("responce: " + JSON.stringify(response))

            resolve(res);

        })
    } catch (error) {
        console.error(error);
    };

  }.bind(this));

  }





  //function that makes backend api call to get the libraries nearby with a specific book
getLibrariesWBook = (bookTitle, userLat, userLong) => {



  return new Promise(async function(resolve, reject){

    try {
        
        //fetch
        let req = await fetch('http://13.59.131.180:3001/findLibraryBook', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              //pass backend user location and book title
              userLat: userLat,
              userLong: userLong,
              bookTitle: bookTitle,
            }),
        }).then((response) => {

            //parse data, store it in object array in state data
            let res = JSON.parse(response._bodyText)
            this.setState({
                data: res
            })

            resolve(res);

        })
    } catch (error) {
        console.error(error);
    };

  }.bind(this));

}



  //function that makes backend api call to get recomendations for a user
getRecommendations = async (phoneNumber) => {

  return new Promise(async function(resolve, reject){

    try {
      
      phoneNumber = phoneNumber;
      let req = await fetch('http://13.59.131.180:3001/recommendation', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          //pass backend user phone number
          phoneNumber: phoneNumber,
        }),
      }).then((response) => {

        //parse data and store in object array in state data
        var resp = response._bodyText;
        let res = JSON.parse(response._bodyText.replace(/'/g, '"'))
        
        this.setState({data: res});
        resolve(res);


      })
    } catch (error) {
      console.error(error);
    };

  }.bind(this));

}


  //function that makes backend api call to get the current rentals for a user
loadBookRentals = async (botMessage, phoneNumber) => {

  return new Promise(async function(resolve, reject){


      try {
       //fetch
        let req = fetch('http://13.59.131.180:3001/curRentals', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            //pass phone number to backend
            phoneNumber: phoneNumber,
          }),
        }).then(async (response) => {

          //parse data store in object array
          let res = JSON.parse(response._bodyText)
          

          await res.forEach(rental => {
            //format rentals data
            botMessage.text += rental.Title + "By: " + rental.NAME + "\nTaken out on: " + rental.Takeout_Date + "\n";
          });
          
          

        })
      } catch (error) {
        console.error(error);
      };

        //return the bot message
        resolve(botMessage);
    });
}


  //function that makes backend api call to get the rental history of a user
loadBookRentalHistory = async (phoneNumber) => {

  return new Promise(async function(resolve, reject){

    try {
        //fetch
        let req = await fetch('http://13.59.131.180:3001/history', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              //pass backend user's data
              phoneNumber: phoneNumber,
            }),
        }).then((response) => {
            //parse data and store in object array in state data
            let res = JSON.parse(response._bodyText)
            this.setState({
                data: res
            })

            resolve(res);

        })
    } catch (error) {
        console.error(error);
    };

  }.bind(this));

}

  render() {
    return (

    <View style={styles.container}>

      <Head title="Chat Bot" navigation={this.props.navigation}/>
      
      <Container  style={{position: "absolute", width: "100%", top: 75, height:"88%"}}>
        <GiftedChat
            messages={this.state.messages}
            keyboardShouldPersistTaps={"handled"}
            onSend={messages => this.onSend(messages)}
            user={{
            _id: 1,
            }}
        />
        <KeyboardSpacer/>
      </Container>
    </View>
    )
  }


}


const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    height: 75,
    color: "#284e8c",

  },
});




