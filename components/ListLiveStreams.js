import React, { Component } from 'react';
import { Image, FlatList, Text, View, TouchableNativeFeedback, ActivityIndicator } from 'react-native';
import { GoogleSignin } from 'react-native-google-signin';
import { YOUTUBE_API_KEY } from '../gconfig';

class LiveSteamItem extends Component{
    constructor(props){
        super(props);
        this.state = {
            user:{}
        }
    }

    render(){

        const { imageStyle, container, title, metaInfo ,channelTitle} = styles;
        const { navigate } = this.props.navigation;
        
        return (
            <TouchableNativeFeedback onPress={() => navigate('LiveStreamView', { data: this.props.itemData, user:this.props.user })} >
                <View style={container}>
                    <Image resizeMode="cover" source={{ uri: this.props.itemData.snippet.thumbnails.high.url }} style={imageStyle} /> 
                    <View style={metaInfo}>
                        <Text numberOfLines={1} style={channelTitle}>{this.props.itemData.snippet.channelTitle}</Text>
                        <Text numberOfLines={1} style={title}>{this.props.itemData.snippet.title}</Text>
                    </View>
                </View>
            </TouchableNativeFeedback>
        );
    }
}

const styles = {
    container:{
        flex:1,
        marginHorizontal:5,
        marginTop:5,
        marginBottom:15,
        backgroundColor:'#27252d',
        elevation:1

    },
    metaInfo:{
        margin:16
    },
    imageStyle:{
        height:160,
        width:null
    },
 
    title:{
        color:'rgba(255,255,255,0.65)',
        fontSize:16,
    },
    channelTitle:{
        color: 'tomato',
        fontWeight:'400',
        fontSize: 12,
        marginVertical: 3
    }
}

export default class ListLiveStreams extends Component{
    constructor(props){
        super(props);
        this.state = {
            data:[],
            isLoading: true,
            nextPageToken:'',
            user:{}
        }
    }

    async componentWillMount() {
        await this._getCurrentUser();
        await this.makeRemoteRequest();
    }

    async _getCurrentUser() {
        try {
            const user = await GoogleSignin.currentUserAsync();
            this.setState({ user: user });

        } catch (error) {
            this.setState({
                error,
            });
        }
    }

    componentDidMount(){
        this.makeRemoteRequest();
    }

    makeRemoteRequest = () => {
        let URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&chart=mostPopular&regionCode=US&eventType=live&type=video&maxResults=50&key=${YOUTUBE_API_KEY}&maxResults=10${this.state.nextPageToken == "" ? "" : ("&pageToken=" + this.state.nextPageToken)}`;
        return fetch(URL)
        .then((response) => response.json())
        .then((responseJson) => {
            console.log(responseJson);
            this.setState({
                isLoading: false,
                data: [...this.state.data, ...responseJson.items],
                nextPageToken: responseJson.nextPageToken
            });
            console.log(this.state);
        })
        .catch((error) => {
            console.error(error);
        });
    }


    render() {
        console.log(this.state);
        if (this.state.isLoading || !this.state.user.hasOwnProperty('accessToken')) {
            return (
                <View style={{ flex: 1, padding: 20 }}>
                    <ActivityIndicator />
                </View>
            )
        }

        return (
            <View style={{ flex: 1, backgroundColor:'#161223'}}>
                <FlatList
                    data={this.state.data}
                    renderItem={({ item }) => <LiveSteamItem user={this.state.user} navigation={this.props.navigation} itemData={item} />}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={()=>this.makeRemoteRequest()}
                />
            </View>
        );
    }
}