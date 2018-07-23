import React, { Component } from 'react';
import { Button,StyleSheet, Text, View, TouchableOpacity,TouchableNativeFeedback, Platform } from 'react-native';
import { GoogleSignin } from 'react-native-google-signin';
import { createBottomTabNavigator, createStackNavigator} from 'react-navigation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ListLiveStreams from './ListLiveStreams';
import LiveStreamView from './LiveStreamView';


class HomeScreen extends Component {
    constructor(props){
        super(props);
    }
    static navigationOptions = {
        title: 'Home',
        headerStyle: {
            backgroundColor: '#161223',
        },
        headerTintColor: 'tomato',
        headerTitleStyle: {
            fontWeight: '400',
        },
    };

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ListLiveStreams navigation={this.props.navigation} />
            </View>
        );
    }
}

class StatsScreen extends Component {
    
    static navigationOptions = {
        title: 'Statistics'
    };

    render() {
        return (
            <View style={styles.container}>
                <Button title="Actually, sign me out :)" onPress={this._signOut} />
            </View>
        );
    }

    _signOut = async () => {
        try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            this.props.navigation.navigate('Auth');
        } catch (error) {
            this.setState({
                error,
            });
        }
    };
}

const HomeStack = createStackNavigator({ HomeScreen: HomeScreen ,LiveStreamView: LiveStreamView });

HomeStack.navigationOptions = ({ navigation }) => {
    let tabBarVisible = true;
    if (navigation.state.index > 0) {
        tabBarVisible = false;
    }
    return {
        tabBarVisible,
    };
};

export default createBottomTabNavigator({
    Home: HomeStack,
    Stats: StatsScreen,
},{
    navigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ tintColor }) => {
            const { routeName } = navigation.state;
            let iconName;
            if (routeName === 'Home') {
                iconName = `live-tv`;
            } else if (routeName === 'Stats') {
                iconName = `trending-up`;
            }
            return <MaterialIcons name={iconName} size={25} color={tintColor} />;
        },
    }),
    tabBarOptions: {
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
        style: {
            backgroundColor: '#161223',
        },
    },
});


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6200EE',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});