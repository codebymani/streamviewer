import React, { Component} from 'react';
import { Button, StyleSheet, StatusBar, ActivityIndicator, Text, View, TouchableOpacity, ToastAndroid, Platform } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
import WEBCLIENT_ID from './gconfig';
import { createStackNavigator, createSwitchNavigator } from 'react-navigation';
import HomeScreen from './components/HomeScreen';

class SignInScreen extends React.Component {

  _signIn = async () => {
    try {
      const user = await GoogleSignin.signIn();
      this.props.navigation.navigate('App');
    } catch (error) {
      console.log(error);
      if (error.code === 'CANCELED') {
        error.message = 'user canceled the login flow';
      }
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }
  };

  _signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      this.setState({ user: null });
    } catch (error) {
      this.setState({
        error,
      });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <GoogleSigninButton
          style={{ width: 230, height: 48 }}
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Auto}
          onPress={this._signIn}
        />
      </View>
    );
  }
}


class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props); 
  }
  async componentDidMount(){
    await this._configureGoogleSignIn();
    await this._getCurrentUser();
  }

  async _configureGoogleSignIn() {
    await GoogleSignin.hasPlayServices({ autoResolve: true });
    const configPlatform = {
      ...Platform.select({
        ios: {},
        android: {},
      }),
    };

    await GoogleSignin.configure({
      ...configPlatform,
      webClientId: WEBCLIENT_ID,
      offlineAccess: false,
      scopes: ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube','https://www.googleapis.com/auth/youtube.force-ssl']
    });
  }

  async _getCurrentUser() {
    try {
      const user = await GoogleSignin.currentUserAsync();
      console.log(user);
      this.props.navigation.navigate(user ? 'App' : 'Auth');
    } catch (error) {
      this.setState({
        error,
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

const AppStack = createStackNavigator({ Home: HomeScreen }, { headerMode: 'none',headerTitle: 'Home'} );
const AuthStack = createStackNavigator({ SignIn: SignInScreen},{ headerMode: 'none'});

export default createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
);

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