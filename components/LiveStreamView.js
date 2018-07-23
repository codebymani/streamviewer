import React, { Component } from 'react';
import {View,ActivityIndicator,ScrollView } from 'react-native';
import YouTube from 'react-native-youtube';
import ChatView from './ChatView';
import { YOUTUBE_API_KEY } from '../gconfig';

class YoutubeWidget extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (<YouTube
            videoId={this.props.videoId} // The YouTube video ID
            play={true}             // control playback of video with true/false
            fullscreen={false}       // control whether the video should play in fullscreen or inline
            loop={true}             // control whether the video should loop when ended
            onReady={e => this.setState({ isReady: true })}
            onChangeState={e => this.setState({ status: e.state })}
            onChangeQuality={e => this.setState({ quality: e.quality })}
            onError={e => this.setState({ error: e.error })}
            style={{ alignSelf: 'stretch', height: 200 }}
            apiKey={YOUTUBE_API_KEY}
        />);
    }
}

export default class LiveStreamView extends Component {
    constructor(props) {
        super(props);
        this.state={
            liveChatId:'',
            loading:true,
            data:[]
        };
        console.log(this.props);
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.state.params.data.snippet.title,
            headerStyle: {
                backgroundColor: '#000',
            },
            headerTintColor: 'tomato',
            headerTitleStyle: {
                fontWeight: '400',
            },
            tabBarVisible: false
        };
    };

    componentDidMount(){
        this.getLiveChatId(); // Get LiveChatId from VideoID of Selected Video
    }
        
    getLiveChatId = () => {
        
        this.setState({  loading: true });
        let URL = `https://www.googleapis.com/youtube/v3/videos?id=${this.props.navigation.state.params.data.id.videoId}&part=liveStreamingDetails&key=${YOUTUBE_API_KEY}`;
        return fetch(URL)
        .then((response) => response.json())
        .then((responseJson) => {
            this.setState({
                liveChatId: responseJson.items[0].liveStreamingDetails.activeLiveChatId,
                loading:false
            });
        })
        .catch((error) => {
            // Handle Network Fail
        });
    }

    render() {
        if(this.state.loading)
            return (<View><ActivityIndicator/></View>);

        return(
            <ScrollView> 
                <View>
                    <YoutubeWidget videoId={this.props.navigation.state.params.data.id.videoId}/>
                </View>
                <View style={{height:300}}>
                    <ChatView videoId={this.props.navigation.state.params.data.id.videoId} liveChatId={this.state.liveChatId} user={this.props.navigation.state.params.user}/>
                </View>
            </ScrollView>
        );
    }
}
