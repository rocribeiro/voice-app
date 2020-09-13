import React, { Component } from 'react';
import { View, TouchableWithoutFeedback, Text,Image,Vibration,StyleSheet,TouchableOpacity } from 'react-native'
import { Audio } from 'expo-av'
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
import axios from 'react-native-axios';
import fetchWithTimeout from 'fetch-timeout';


export default class Record extends Component {
    state = {

        isRecording: false,
        isLoading: false,
        borderColor:"#00FF00",
        btnText:'Aperte para falar com a Sofia!'
      }
    
      constructor(props) {
        super(props);
      }
    
      componentMount() {
        Permissions.askAsync(Permissions.AUDIO_RECORDING)
      }


      _updateScreenForRecordingStatus = status => {
        if (status.canRecord) {
          this.setState({
            isRecording: status.isRecording,
            recordingDuration: status.durationMillis,
          });
        } else if (status.isDoneRecording) {
          this.setState({
            isRecording: false,
            recordingDuration: status.durationMillis,
          });
          if (!this.state.isLoading) {
            this._stopRecordingAndEnablePlayback();
          }
        }
      };  
      async StartRecord() {
        Permissions.askAsync(Permissions.AUDIO_RECORDING)
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: true
        });
        const recording = new Audio.Recording();
        recording.setOnRecordingStatusUpdate(() => ({ durationMillis, isRecording, isDoneRecording }) =>
          ({ durationMillis, isRecording, isDoneRecording }));
        recording.setProgressUpdateInterval(200);
    
        this.setState({ text: 'Start', record: true })
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recording.startAsync();
      }
      
      render() {

        const recordingOptions = {
          android: {
            extension: '.mpeg',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG2TS,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        };
          
         stopGravacao = async () => {
            await this.recording.stopAndUnloadAsync();
            let url = this.recording.getURI();
            console.log(url);
            const base64 = await FileSystem.readAsStringAsync(url,{
              encoding: FileSystem.EncodingType.Base64
            })
            console.log(base64);
            method='POST'
            headers={
              'Content-Type': 'application/json',
              'Authorization':'Token dc2d9fe14e318c2204c1764b2b74f273a6c9065a',
              'Transfer-Encoding': 'chunked'
            }
            body =JSON.stringify({
              nome_arquivo: 'audio.wav',
              encoded_audio: base64,
            })
            const requestInfo = {
                method,
                headers,
                body,
            };
            
            console.log(requestInfo.method);
            console.log(requestInfo.body);
            console.log(requestInfo.headers);
            const url1 = 'https://safravoice.herokuapp.com/api/process_voice'
            let data = await fetchWithTimeout(url1, requestInfo, 30000).then(res => {
              if (res.status !== 200) {
                throw new Error('Status code not OK', res.status);
              } else {
                return res.json();
              }
            });
            console.log(data.intention);
            if(data.intention =='Banking_Transfer_Money'){
              const soundObject = new Audio.Sound();
              try {
                const { sound: soundObject, status } = await Audio.Sound.createAsync(
                  require('../Sofia/pedirtransferencia.wav'),
                  { shouldPlay: true }
                );
                // Your sound is playing!
              } catch (error) {
                // An error occurred!
              }
            }else if(data.intention == 'VocalizaTelefone'){
              const soundObject = new Audio.Sound();
              try {
                const { sound: soundObject, status } = await Audio.Sound.createAsync(
                  require('../Sofia/compreendertelefone.wav'),
                  { shouldPlay: true }
                );
                // Your sound is playing!
              } catch (error) {
                // An error occurred!
              }
            }else if(data.intention=='welcome'){
              const soundObject = new Audio.Sound();
              try {
                const { sound: soundObject, status } = await Audio.Sound.createAsync(
                  require('../Sofia/bemvindo.wav'),
                  { shouldPlay: true }
                );
                // Your sound is playing!
              } catch (error) {
                // An error occurred!
              }
              
            }else if(data.intention=='GeneralEnding'){
              const soundObject = new Audio.Sound();
              try {
                const { sound: soundObject, status } = await Audio.Sound.createAsync(
                  require( '../Sofia/adeus02.wav'),
                  { shouldPlay: true }
                );
                // Your sound is playing!
              } catch (error) {
                // An error occurred!
              }
            }else if(data.intention=='General_Agent_Capabilities'){
              const soundObject = new Audio.Sound();
              try {
                const { sound: soundObject, status } = await Audio.Sound.createAsync(
                  require('../Sofia/listaracoes.wav'),
                  { shouldPlay: true }
                );
                // Your sound is playing!
              } catch (error) {
                // An error occurred!
              }
              
            }else if(data.intention=='sucesso'){
              const soundObject = new Audio.Sound();
              try {
                const { sound: soundObject, status } = await Audio.Sound.createAsync(
                  require('../Sofia/validar.wav'),
                  { shouldPlay: true }
                );
                // Your sound is playing!
              } catch (error) {
                // An error occurred!
              }
              
            }
          
          }

          startGravacao = async () => {
            const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
            if (status !== 'granted') return;
      
            this.setState({ isRecording: true });
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
              playsInSilentModeIOS: true,
              shouldDuckAndroid: true,
              interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
              playThroughEarpieceAndroid: false,
            });
            const recording = new Audio.Recording();
            try {
              await recording.prepareToRecordAsync(recordingOptions);
              recording.setOnRecordingStatusUpdate(() => { })
              await recording.startAsync();
      
            } catch (error) {
              console.log(error);
              stopGravacao();
            }
            this.recording = recording;
            console.log(this.state.isRecording+" Gravando");
          }
      
          RecordPress = () => {
            Vibration.vibrate(50)
            if(this.state.borderColor =="#00FF00"){
              this.setState({borderColor: '#ff0000', btnText:'Pode falar!'});
            }else{
              this.setState({borderColor: '#00FF00',btnText:'Aperte para falar com a Sofia!'});
            }       
            if (this.state.isRecording) {
              this.setState({ isRecording: false })
              stopGravacao()
      
            } else {
              this.setState({ isRecording: true })
              startGravacao()
            }
          }
        return (
          <TouchableOpacity onPress={() => RecordPress()} >
            <View style={{borderWidth: 4,borderColor:this.state.borderColor,color: 'black',height: 300,width: 300,borderRadius:400,backgroundColor:'rgb( 220, 193, 102)',justifyContent: 'center',alignItems: 'center'}}>
        <Text style={{ fontWeight: 'bold', fontSize:20,color:'#17293f' }}>{this.state.btnText}</Text>
            </View>
          </TouchableOpacity>
        )
      }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#17293f',
  }
});