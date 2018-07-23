import React, { Component } from 'react';
import { Text, View, StyleSheet, Image, ScrollView, TextInput, TouchableHighlight, Keyboard,ActivityIndicator } from 'react-native';
import { YOUTUBE_API_KEY } from '../gconfig';

export default class ChatView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      inputBarText: '',
      isLoading: false,
      nextPageToken: '',
      pollingIntervalMillis: '',
      isMessagesMounted:false
    }
  }

  componentWillMount () {
    this.getChatDetails();
  }

  getChatDetails() {
    // Get List of Live Chat Messages 
    this.setState({ isLoading: true });
    let URL = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${this.props.liveChatId}&part=snippet,authorDetails&key=${YOUTUBE_API_KEY}${this.state.nextPageToken == "" ? "" : ("&pageToken=" + this.state.nextPageToken)}`;
    console.log(URL);
    return fetch(URL)
    .then((response) => response.json())
    .then((responseJson) => {
        console.log(responseJson);
        if(responseJson.hasOwnProperty('items')){
          if(!this.state.isMessagesMounted){
            this.setState({
              isMessagesMounted:true
            })
          }
          this.setState({
              isLoading: false,
              messages: [...this.state.messages, ...responseJson.items],
              nextPageToken: responseJson.nextPageToken,
              pollingIntervalMillis: responseJson.pollingIntervalMillis
          });

          // Next Request should be in "pollingIntervalMillis"
          if (parseInt(responseJson.pollingIntervalMillis) > 0) {
              setTimeout(() => {
                  this.getChatDetails();
              }, responseJson.pollingIntervalMillis);
          }
        }
      })
      .catch((error) => {
          console.log(error);
      });
  }

  componentDidUpdate() {
    if(this.state.isMessagesMounted)
      setTimeout(function() {
        this.scrollView.scrollToEnd();
      }.bind(this));
  }

  _sendMessage() {
    return fetch('https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet', { 
      method: 'post', 
      headers: new Headers({
        'Authorization': `Bearer ${this.props.user.accessToken}`, 
        'Content-Type': 'application/json'
      }), 
      
      body: JSON.stringify({
        "snippet":{
          "liveChatId":this.props.liveChatId,
          "type":"textMessageEvent",
          "textMessageDetails":{
           "messageText":this.state.inputBarText
          }
        }
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson.hasOwnProperty('id')){
        this.getChatDetails();
        this.setState({
          inputBarText:''
        });
      }
    });
    // this.state.messages.push({direction: "left", text: this.state.inputBarText});
  }

  _onChangeInputBarText(text) {
    this.setState({
      inputBarText: text
    });
  }

  _onInputSizeChange() {
    setTimeout(function() {
      this.scrollView.scrollToEnd({animated: false});
    }.bind(this))
  }

  render() {
    
    let messages = [];
    this.state.messages.forEach(function(message, index) {
      messages.push(
        <MessageBubble key={index} direction="left" text={message.snippet.displayMessage} author={message.authorDetails}/>
        );
    });

    if(!this.state.isMessagesMounted)
      return(
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
          <ActivityIndicator/>
        </View>
      );

    if(this.state.isMessagesMounted && this.state.messages.length == 0)
      return(
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text>Live Chat Unavailable</Text>
        </View>
      );  

    return (
      
      
      <View style={styles.outer}>
        <ScrollView keyboardShouldPersistTaps={'always'} ref={(ref) => { this.scrollView = ref }} style={styles.messages}>
          {messages}
        </ScrollView>
        <InputBar 
          onSendPressed={() => this._sendMessage()} 
          onSizeChange={() => this._onInputSizeChange()}
          onChangeText={(text) => this._onChangeInputBarText(text)}
          text={this.state.inputBarText}
        />
      </View> );
  }
}

class MessageBubble extends Component {
  render() {

    let bubbleAuthorStyle = styles.authorName;
    let bubbleStyles = [styles.messageBubble, styles.messageBubbleLeft];
    let bubbleTextStyle = styles.messageBubbleTextLeft;

    return (
        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
            <View>
              <View style={{marginLeft:10,marginTop:15}}>
            <Image style={{ height: 30, width: 30, borderRadius: 15 }} source={{ uri: this.props.author.profileImageUrl}}
              />
              </View>
            </View>
            <View style={bubbleStyles}>
              <Text style={bubbleAuthorStyle}>{this.props.author.displayName}</Text>
              <Text style={bubbleTextStyle}>
                {this.props.text}
              </Text>
            </View>
          </View>
      );
  }
}

class InputBar extends Component {
  render() {
    return (
        <View style={styles.inputBar}>
          <TextInput 
            style={styles.textBox}
            multiline={true}
            underlineColorAndroid="#efefef"
            defaultHeight={30}
            onChangeText={(text) => this.props.onChangeText(text)}
            onContentSizeChange={this.props.onSizeChange}
            value={this.props.text}
          />
          <TouchableHighlight style={styles.sendButton} onPress={() => this.props.onSendPressed()}>
              <Text style={{color: 'white'}}>Send</Text>
          </TouchableHighlight>
        </View> 
      );
  }
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'white'
  },

  messages: {
    flex: 1
  },
  inputBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 3
  },

  textBox: {
    height:40,
    borderRadius: 4,
    backgroundColor:'#efefef',
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10
  },

  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 15,
    marginLeft: 5,
    paddingRight: 15,
    borderRadius: 5,
    backgroundColor: '#161223'
  },
  messageBubble: {
      borderRadius: 5,
      marginTop: 8,
      marginRight: 10,
      marginLeft: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      flexDirection:'row',
      flex: 1
  },

  messageBubbleLeft: {
    flexDirection:'column',
    backgroundColor: '#d5d8d4',
  },

  messageBubbleTextLeft: {
    color: 'black'
  },

  authorName:{
    fontSize:13,
    fontWeight:'500'
  },

  messageBubbleRight: {
    backgroundColor: '#66db30'
  },

  messageBubbleTextRight: {
    color: 'white'
  },
})
