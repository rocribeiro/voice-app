import React, { Component } from 'react';
import { View, TouchableWithoutFeedback, Text,Image,Vibration,StyleSheet,TouchableOpacity } from 'react-native'
import { Audio } from 'expo-av'
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';




export default class Record extends Component {
    state = {

        isRecording: false,
        isLoading: false,
        borderColor:"#00FF00",
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
            extension: '.wav',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
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
            const data = await FileSystem.readAsStringAsync(url,{
              encoding: FileSystem.EncodingType.Base64
            })
            console.log(data);
            const soundObject = new Audio.Sound();
            try {
              soundObject.loadAsync({ uri: url }).then(() => {
                soundObject.playAsync()
              })      
            } catch (error) {
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
            console.log(this.state.isRecording+" Gravando")
          }
      
          RecordPress = () => {
            Vibration.vibrate(400)
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
            <View style={styles.myButton}>
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
  },
  myButton:{
    borderWidth: 4,
    padding: 5,
    height: 300,
    width: 300,  //The Width must be the same as the height
    borderRadius:400, //Then Make the Border Radius twice the size of width or Height   
    backgroundColor:'rgb( 220, 193, 102)',

  }
});