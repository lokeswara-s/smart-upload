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
import { IconButton } from '@material-ui/core';

const percentage = 66;

var djsConfig = { autoProcessQueue: false }
var componentConfig = {
  postUrl: '/uploadHandler'
};

class App extends React.Component{

  state={
    currentPercentage: 0,
    files:[]
  }

  componentDidMount(){
    this.socket= io("http://localhost:3000");
    this.socket.on("MoreData", data => {
      this.uploadPercent = data["percent"];
      let startingRange = data["startingRange"] * 5000000; //The Next Blocks Starting Position
      let newFile; //The Variable that will hold the new Block of data
      newFile = this.selectedFile.slice(
        startingRange,
        startingRange +
          Math.min(5000000, this.selectedFile.size - startingRange)
      );

      this.fReader.readAsBinaryString(newFile);
    });

    this.socket.on("Done", data => {
      this.uploadPercent = 100;
      console.log("File uploaded successfully");
    });
  }

  fileList=(e)=>{
    this.setState({
      files: e.target.files
    })
  }
  
  render() {
    return (
      <div className="App">
        <div style={{padding:"5%", display:"flex", flexFlow:"wrap"}}>
          <div style={{width:"10%", padding:"5%", flex:"1 0 20%"}}> 
            <div class="image-upload">
                <label for="file-input">
                    <img src={Cloud} id="cloud-image"/>
                </label>
                <input id="file-input" type="file" multiple onChange={this.fileList}/>
            </div>
          </div>
          <div style={{flex:"1 0 20%"}}>
          <List component="nav" aria-label="mailbox folders">
            {
              Object.values(this.state.files).map(item=>{
                return <FileItem  file={item}/>
              })
            }
          </List>
          </div>
        </div>
        <div>

        </div>
        <div style={{height: "300px", width: "300px"}}>
          <CircularProgressbar value={this.state.currentPercentage} text={`${this.state.currentPercentage}%`} />;
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
        <ListItemText primary={props.file.name} secondary={"sda"}/>
        
    </ListItem>
  )
}

export default App;
