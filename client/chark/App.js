// MyCHIPs Mobile Application
// Copyright MyCHIPs.org
// TODO:
//- Connection:
//X-  Wrap websocket module
//X-  Can we do without origin in wsoptions?
//X-  entcli still works
//X- Can connect with token
//X- Save key locally when generated
//X- Can connect with saved key
//X- Status line shows connection state
//- Add real QR scanner screen
//- Read QR connection ticket (framework for other types)
//- Can launch from deep link to connection ticket
//- 

import React, { Component, useEffect } from 'react';
import { Button, View, Text, StyleSheet, TouchableOpacity, Image, NativeModules, Linking, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PolyfillCrypto from 'react-native-webview-crypto'
import AsyncStorage from '@react-native-async-storage/async-storage'

import ServIcon from './src/servicon'
import { parse } from './src/utils/query-string';
import constants from './src/config/constants';

//import TallyInvite from './src/invite'
import Invite from './src/screens/Invite'
import Home from './src/screens/Home';
const Connect = require('./src/connect')

const listen = ['mychips_user','wylib']		//Listen for these notifies from the DB
const httpPort = 8000
const wsPort = 54320
const Wm = require('./src/wyseman')

const debug = console.log
var conn = new Connect({
  webcrypto: window.crypto,
  httpPort, wsPort, listen,
  wm: Wm
})

var pktId = 1
function query_users() {
  Wm.request(pktId++, 'select', {
    view: 'mychips.users_v_me',
    fields: ['id', 'std_name', 'peer_cid', 'peer_agent']
  }, data => {
console.log('Data:', JSON.stringify(data,null,2))
  })
}
function query_user() {		
  Wm.request(pktId++, 'select', {
    view: 'base.ent_v',
    table: 'base.curr_eid',
    params: []
  }, data => {
console.log('Data:', JSON.stringify(data,null,2))
  })
}

function GlobalMenu(p) {
//console.log('HI:',p.nav)
  return (
    <View style={styles.global}>
      <TouchableOpacity style={styles.buttonBox} onPress={()=>{p.nav.navigate('Home')}}>
        <Image style={styles.button} source={require("./assets/icon-home.png")}/>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonBox} onPress={()=>{p.nav.navigate('Receive')}}>
        <Image style={styles.button} source={require("./assets/icon-receive.png")}/>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonBox} onPress={()=>{p.nav.navigate('Scan')}}>
        <Image style={styles.button} source={require("./assets/icon-scan.png")}/>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonBox} onPress={()=>{p.nav.navigate('Invite')}}>
        <Image style={styles.button} source={require("./assets/icon-invite.png")}/>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonBox} onPress={()=>{p.nav.navigate('Settings')}}>
        <Image style={styles.button} source={require("./assets/icon-settings.png")}/>
      </TouchableOpacity>
    </View>
  );
}

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Home conn={conn} />
      <GlobalMenu nav={navigation} />
    </View>
  );
}

function ReceiveScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Receive Screen</Text>
      <GlobalMenu nav={navigation} />
    </View>
  );
}

function ScanScreen(p) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Scan Screen</Text>
      <GlobalMenu nav={p.navigation} />
    </View>
  );
}

function InviteScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flex: 1, marginBottom: 60 }}>
        <Invite wm={Wm}/> 
      </View>

      <GlobalMenu nav={navigation} />
    </View>
  );
}

function SettingsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Settings Screen</Text>
      <GlobalMenu nav={navigation} />
    </View>
  );
}

const Stack = createNativeStackNavigator();
const linking = {
  prefixes: ["mychips0"],
  config: {
    screens:{
      HomeScreen: "Home",
    },
  },
};  

function App() {
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      AsyncStorage.getItem(constants.keyTag).then(val => {
        console.log(JSON.parse(val), 'val')
      })
      if(url) {
        const obj = parse(url);
        conn.connect({
          ticket: obj,
        })
      }
    });

    const listener = Linking.addEventListener('url', ({url}) => {
      if(url) {
        const obj = parse(url);
        console.log(obj, 'obj')
        conn.connect({
          ticket: obj,
        })
      }
    })

    return () => {
      conn.disconnect();
      listener.remove();
    };
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <ServIcon wm={Wm}/>
      <PolyfillCrypto />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{title: 'Tallies'}}/>
        <Stack.Screen name="Receive" component={ReceiveScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="Invite" component={InviteScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

setTimeout(() => {
  console.log("W:", window)
}, 1000)

const styles = StyleSheet.create({
  global: {
    flex: 1,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
  },
  buttonBox: {
    alignItems: 'center',
//    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    flex: 1,
  },
  button: {
//    position: 'absolute',
//    padding: 10,
//    marginBottom: 20,
//    shadowColor: '#303838',
//    shadowOffset: { width: 0, height: 5 },
//    shadowRadius: 10,
//    shadowOpacity: 0.35,
  },
})

export default App;

