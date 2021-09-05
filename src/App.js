import React,{useState,useEffect}from 'react';
import GroupChat from './Components/GroupChat/GroupChat';
import Login from './Components/Login/Login';
import './App.css';
import Socketio from 'socket.io-client';
import Peer from 'peerjs';

const socket = Socketio('http://localhost:2000/',{ transports: ['websocket', 'polling', 'flashsocket'] });
const my_peer = new Peer();
function App() {
  const [message,setMessage] = useState([]);
  const [input,setInput] = useState('');
  const [MeetID,setMeetid] = useState('');
  const [UserID,setUserID] = useState('');
  const [VideoID,setVideoID] = useState('');
  // eslint-disable-next-line
  const [Participants,setParticipants] = useState([]);
  const [Streams,setStreams] = useState([]);
  const [myStream,setMyStream] = useState(null);
  const callList = [];

  const change_State_of_Streams = (remoteStream)=>{
    console.log('CHECK STREAMS',Streams);
    setStreams(Streams=>Streams.concat(remoteStream));
  }

  useEffect(()=>{
      my_peer.on('open',(id)=>{
          setVideoID(id);
      });
      socket.on('Welcome',(chat)=>{
        console.log(chat);
        setMessage([
          ...message,
          {
            name:'BOT',
            message:chat
          }
        ]);
      });
      
      socket.on('GroupChat',(message)=>{
        setMessage(message);
      });
      socket.on('UpdateParticipants',(user_list)=>{
        console.log(user_list);
        setParticipants(user_list);
      });
      console.log('Streams in app.js',Streams);
      // eslint-disable-next-line
  },[socket]);

  useEffect(()=>{
    if(!myStream&&MeetID)configure_media();
  },[MeetID]);

  useEffect(()=>{
    let new_element=null,divElement=null;
    if(Streams.length){
      new_element = document.createElement('video');
      new_element.id = 'video-tag';
      divElement = document.getElementById('testing-video');
      new_element.srcObject = Streams[Streams.length-1];
      console.log('last index stream',Streams[Streams.length-1]);
      new_element.onloadedmetadata = ()=>{
              new_element.play();
      }
    }
    if(divElement&&new_element){
      divElement.appendChild(new_element);
    }
  },[Streams]);

    if(myStream){
      socket.off('CallNewUser').on('CallNewUser',(name,user_videoID)=>{
          console.log('this is the new stream in the old',myStream);
          const call = my_peer.call(user_videoID,myStream);
          call.on('stream',(remoteStream)=>{
            if(!callList[call.peer]){
              console.log(`getting back stream of ${name}`,remoteStream);
              change_State_of_Streams(remoteStream);
              callList[call.peer] = call;
            }
          });
      });}
      
  useEffect(()=>{
    if(myStream){
      const new_element = document.createElement('video');
      new_element.id = 'video-tag';
      const divElement = document.getElementById('testing-video');
      console.log('only video',myStream.getVideoTracks()[0]);
      new_element.srcObject = myStream;
      new_element.onloadedmetadata = ()=>{
          new_element.play();
      };
      if(divElement&&new_element)
        divElement.appendChild(new_element);
    }
  },[myStream]);
      if(myStream){
        my_peer.off('call').on('call',(call)=>{
            console.log('this is the new stream in the new',myStream);
            call.answer(myStream);
            call.on('stream',(remoteStream)=>{ 
              if(!callList[call.peer]){
                console.log('i am the oldest not getting back stream in the new',remoteStream);
                change_State_of_Streams(remoteStream);
                callList[call.peer] = call;
              }
            });
        });
      }

  const configure_media = ()=>{
    navigator.mediaDevices.getUserMedia({video:true,audio:true})
    .then((stream)=>{
       setMyStream(stream);
    }).catch(console.log);
  }

  const onChangeInput = (e)=>{
      setInput(e.target.value);
  } 
  const onClickSend = ()=>{
      setMessage([
        ...message,
          {
            name:UserID,
            message:input
          }
      ]);
      socket.emit('conversation',input,MeetID,UserID);
      const inputfield = document.getElementById('message-input-field');
      inputfield.value = '';
  }
  return (
    <div className="App">
        {
          MeetID&&UserID?
            <div className='main-render-wrapper'>
              <div className='Button-toggle'>
                 <button>Home</button>
                 <button>Chat</button>
              </div>
            <div className='main-render'>
            <div className='media-wrapper'>
              <div className='mediaChat'>
                  <div id='testing-video'></div>
              </div>
            </div>
            <div className='groupChat-wrapper'>
              <div className='groupChat'>
              {message?
                <div className='chat-wrapper'>
                  <h1>Group Chat</h1>
                  <div className='chat'><GroupChat socket={socket} message={message} UserID={UserID}/></div>
                  <div className='message-box'>
                    <input className='message-textbox' id='message-input-field' onChange={onChangeInput} placeholder='Write your message..'></input>
                    <button onClick={onClickSend}>Send</button>
                  </div>
                </div>
                :<div></div>
              }
              </div>
            </div>
            </div>
            </div>
          :
          <Login setMeetid={setMeetid} setUserID={setUserID} VideoID={VideoID} socket={socket}/>
        }
    </div>
  );
}

export default App;
