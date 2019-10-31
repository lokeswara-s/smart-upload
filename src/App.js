import React from 'react';
import './App.css';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import DropzoneComponent from 'react-dropzone-component';

import io from "socket.io-client";
 
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Cloud from './cloud.png'
import FileIcon, { defaultStyles } from 'react-file-icon';
import { IconButton, LinearProgress, Button } from '@material-ui/core';

const percentage = 66;

var djsConfig = { autoProcessQueue: false }
var componentConfig = {
  postUrl: '/uploadHandler'
};

class App extends React.Component{

  state={
    currentPercentage: 0,
    files:[],
    fileStatus:{},
    showCircle:false,
    index: 0,
    currentFile:{},
    circleProgress:0,
    fReader: new FileReader()
  }

  componentDidMount(){
    this.socket= io("http://localhost:3001");
    this.socket.on("MoreData", data => {
      this.uploadPercent = data["percent"];
      let startingRange = data["startingRange"] * 5000000; //The Next Blocks Starting Position
      let newFile; //The Variable that will hold the new Block of data
      newFile = this.state.currentFile.slice(
        startingRange,
        startingRange +
          Math.min(5000000, this.state.currentFile.size - startingRange)
      );
      this.setState({
        fileStatus:{
          ...this.state.fileStatus,
          [this.state.currentFile.name]:{
            progress:  data["percent"]
          }
        }
      })  
      this.state.fReader.readAsBinaryString(newFile);
    });

    this.socket.on("Done", data => {
      this.uploadPercent = 100;
      if(Object.keys(this.state.files).length > 1 && this.state.index < Object.keys(this.state.files).length - 1){
        this.setState({
          index: this.state.index + 1,
          fileStatus:{
            ...this.state.fileStatus,
            [this.state.currentFile.name]:{
              progress: 100
            }
          }
        },()=>{
          console.log(this.state.index)
          this.handleUploadFiles()
        })
      }
      console.log("File uploaded successfully");
    });
  }

  fileList=(e)=>{
    this.setState({
      files: e.target.files
    })
  }

  handleUploadFiles=()=>{
    this.setState({
      showCircle:true,
      currentPercentage: parseInt(( Object.keys(this.state.files).length/this.state.index ))* 100,
      currentFile: this.state.files[this.state.index]
    },()=>{
      this.state.fReader.onload = evnt => {
        this.socket.emit("Upload", { fileName:  this.state.currentFile.name, data: evnt.target.result });
      };
      this.socket.emit("Start", { fileName:  this.state.currentFile.name, size: this.state.currentFile.size });
    })  
  }
  
  render() {
    return (
      <div className="App">
        <div style={{padding:"5%", display:"flex", flexFlow:"wrap", width:"50%"}}>
          <div style={{width:"10%", padding:"5%", flex:"1 0 20%"}}> 
            {!this.state.showCircle ? 
              <div className="image-upload">
              <label for="file-input">
                  <img src={Cloud} id="cloud-image"/>
              </label>
              <input id="file-input" type="file" multiple onChange={this.fileList}/>
          </div>
           : <div style={{height: "300px", width: "300px", margin: "auto"}}>
              <CircularProgressbar value={this.state.currentPercentage} text={`${this.state.currentPercentage}%`} />
            </div>
            }
          </div>
          <div style={{flex:"1 0 20%"}}>
          <List component="nav" aria-label="mailbox folders">
            {
              Object.values(this.state.files).map(item=>{
                return <FileItem  file={item} fileStatus={this.state.fileStatus[item.name]}/>
              })
            }
          </List>
          </div>
        </div>
        <Button variant="contained" color="primary" onClick={()=>{
          this.handleUploadFiles()
        }}>Begin Upload</Button>
        <div>

        </div>
      </div>
    );
  }
}

const FileItem=(props)=>{
  let type = props.file.name.split(".")[1]
  return(
    <ListItem button>
      <ListItemAvatar>
          <div style={{padding: 8}}>
            <FileIcon extension={type} {...defaultStyles[type]} />
          </div>
        </ListItemAvatar>
        <ListItemText primary={props.file.name} secondary={<div>
          <span>sample text</span>
          <LinearProgress variant="determinate" value={props.fileStatus && props.fileStatus.progress || 0}/>
        </div>}/>
        
    </ListItem>
  )
}

export default App;
