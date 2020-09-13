import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View ,Image} from 'react-native';
import Record from './src/Record';

export default function App() {
  return (
    <View style={styles.container}>
      <Record/>
      <Image 
            source={require('./img/logo_safra.jpg')} 
            style={{marginTop:50}} 
            />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17293f',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
