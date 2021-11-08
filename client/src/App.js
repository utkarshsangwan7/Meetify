import React,{useState,useEffect}from 'react';
import GroupChat from './Components/GroupChat/GroupChat';
import Participants from './Components/Participants/Participants';
import brandIcon from './m.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone,faMicrophoneSlash,faVideo,faVideoSlash,faArrowUp,faHouseUser,faMess} from '@fortawesome/free-solid-svg-icons'
import Login from './Components/Login/Login';
import './App.css';
import Socketio from 'socket.io-client';
import Peer from 'peerjs';

const socket = Socketio(`${process.env.REACT_APP_SERVER_URL}`,{ transports: ['websocket', 'polling', 'flashsocket'] });
const my_peer = new Peer();
const screen_peer = new Peer();
function App() {
  const [message,setMessage] = useState([]);
  const [input,setInput] = useState('');
  const [MeetID,setMeetid] = useState('');
  const [UserID,setUserID] = useState('');
  const [VideoID,setVideoID] = useState('');
  const [ScreenID,setScreenID] = useState('');
  // eslint-disable-next-line
  const [Participants_list,setParticipants] = useState([]);
  const [Streams,setStreams] = useState([]);
  const [ScreenStream,setScreenStream] = useState(null);
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
      screen_peer.on('open',(id)=>{
          setScreenID(id);
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
        const div_element = document.getElementById('scrollable-chat');
        div_element.scrollTop = div_element.scrollHeight;
      });
      socket.on('UpdateParticipants',(user_list)=>{
        console.log(user_list);
        setParticipants(user_list);
      });
      socket.on('SetYourMediaStream',()=>{
        configure_media();
      });
      socket.on('RemoveParticipantLeft',(user)=>{
        const divElement = document.getElementById('video-tag'+user.StreamID);
        if(divElement)
        {
          divElement.remove();
          const index = Streams.findIndex((stream)=>{
            return stream.id===user.StreamID;
          });
          if(index){
            const temp = Streams;
            temp.splice(index,1);
            setStreams(temp);
          }
        }
      });
      socket.on('RemovingScreenDivFromWatching',(user)=>{
        console.log('client removing screen div from watching',user.ScreenStreamID);
        const div_element = document.getElementById('video-tag'+user.ScreenStreamID);
        if(div_element){
          div_element.remove();
          const index = Streams.findIndex((stream)=>{
            return stream.id===user.ScreenStreamID;
          });
          if(index){
            const temp = Streams;
            temp.splice(index,1);
            setStreams(temp);
          }
        }
        setScreenStream(null);
      });
      console.log('Streams in app.js',Streams);
      // eslint-disable-next-line
  },[socket]);

  useEffect(()=>{
    let new_element=null,divElement=null;
    if(Streams.length){
      new_element = document.createElement('video');
      new_element.id = 'video-tag'+Streams[Streams.length-1].id;
      new_element.className = 'video-tag';
      new_element.addEventListener('dblclick',(event)=>{onClickExpandStream(new_element.id)});
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

  useEffect(()=>{
    if(myStream){
      socket.emit('MediaStreamSet',MeetID,UserID,VideoID);
    }
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
      my_peer.off('call').on('call',(call)=>{
        console.log('this is the new stream in the new',myStream);
        if(myStream){
        call.answer(myStream);
        call.on('stream',(remoteStream)=>{
          if(remoteStream!==null){ 
            if(!callList[call.peer]){
              console.log('i am the oldest not getting back stream in the new',remoteStream);
              change_State_of_Streams(remoteStream);
              callList[call.peer] = call;
            }
          }
        });
      }
    });
  },[myStream]);
   
      if(myStream){
        socket.off('RecieveShareScreen').on('RecieveShareScreen',(user_videoID)=>{
          console.log('Ask for shared Screen',myStream);
            const call = screen_peer.call(user_videoID,myStream);
            call.on('stream',(remoteStream)=>{
              change_State_of_Streams(remoteStream);
            });
        });
      }

      if(ScreenStream){
        screen_peer.off('call').on('call',(call)=>{
          console.log('this is the new stream in the new',ScreenStream);
          call.answer(ScreenStream);
          call.on('stream',(remoteStream)=>{
            if(remoteStream===null)console.log('useless');
          });
      });
      }
      
  useEffect(()=>{
    if(myStream){
      const new_element = document.createElement('video');
      new_element.muted = true;
      new_element.id = 'video-tag'+myStream.id;
      new_element.className = 'video-tag';
      new_element.addEventListener('dblclick',(event)=>{onClickExpandStream(new_element.id)});
      const divElement = document.getElementById('testing-video');
      new_element.srcObject = myStream;
      new_element.onloadedmetadata = ()=>{
          new_element.play();
      };
      if(divElement&&new_element)
        divElement.appendChild(new_element);
      console.log('My stream type ',myStream);
    }
  },[myStream]);

  const configure_media = ()=>{
    navigator.mediaDevices.getUserMedia({video:true,audio:true})
    .then((stream)=>{
       setMyStream(stream);
       socket.emit('UpdateStreamId',stream.id);
    }).catch(console.log);
  }

  const onChangeInput = (e)=>{
      setInput(e.target.value);
  } 
  const onClickSend = ()=>{
    if(input){
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
  }
  
  const onClickMuteUnmute = ()=>{
    myStream.getTracks()[0].enabled = !myStream.getTracks()[0].enabled;
  }

  const onClickVideoOnOFF = ()=>{
    myStream.getTracks()[1].enabled = !myStream.getTracks()[1].enabled;
  }

  const displayMessages = ()=>{
    const chat = document.getElementById('chat');
    const part = document.getElementById('Participants');
    chat.style.display = "grid";
    part.style.display = "none";
  }

  const displayParticipants = ()=>{
    const chat = document.getElementById('chat');
    const part = document.getElementById('Participants');
    chat.style.display = "none";
    part.style.display = "block";
  }

  const onClickExpandStream = (id)=>{
    const main_video_div = document.createElement('div');
    const secondary_video_div = document.createElement('div');
    main_video_div.id = 'main_video_div';
    secondary_video_div.id = 'secondary_video_div';
    const div_element = document.getElementById(id);
    const main_div = document.getElementById('testing-video');
    let children = document.getElementById('testing-video').childNodes;
    if(main_div&&main_div.style.display==='grid'){
      let my_array = []
      for(let i=0;i<children.length;i++){
        if(div_element.id!==children[i].id){
          my_array.push(children[i]);
        }
      }
      console.log(my_array);
      main_div.textContent = '';
      console.log(my_array);
      for(let i=0;i<my_array.length;i++){
        secondary_video_div.appendChild(my_array[i]);
      }
      main_video_div.appendChild(div_element);
      main_video_div.style.cssText = 'width: 100%;';
      secondary_video_div.style.cssText = 'width: 100%;';
      main_div.style.cssText = 'grid-template-columns: 0.75fr 0.25fr;grid-template-rows: auto;';
      main_div.prepend(secondary_video_div);
      main_div.prepend(main_video_div);
    }
    else{
      main_div.style.cssText = ' display: grid;width: inherit;grid-template-columns: repeat(auto-fill,minmax(500px,1fr));grid-gap: 1vw;';
      for(let i=0;i<children.length;++i){
        children[i].style.cssText = 'border-radius:1vw;width: inherit;cursor: pointer;';
      }
      if(div_element)
        div_element.style.cssText='border-radius:1vw;width: inherit;cursor: pointer;';
    }
  }

  const onClickMedia = ()=>{
    const my_media = document.getElementsByClassName('mediaChat');
    const my_chat = document.getElementsByClassName('chat-wrapper');
    my_media[0].style.display = "flex";
    my_chat[0].style.display = "none";
  }
  const onClickChat = ()=>{
    const my_media = document.getElementsByClassName('mediaChat');
    const my_chat = document.getElementsByClassName('chat-wrapper');
    my_media[0].style.display = "none";
    my_chat[0].style.display = "block";
  }
  const onClickShareOnOFF = ()=>{
    navigator.mediaDevices.getDisplayMedia({
      captureStream:null
    }).then((stream)=>{
      if(stream){
        setScreenStream(stream);
        socket.emit('UpdateScreenStreamId',stream.id);
        socket.emit('ShareScreenInRoom',ScreenID,MeetID);
      }
    });
  }

  const onClickLeave = ()=>{
    socket.disconnect();
    myStream.getTracks().forEach(function(track) {
      track.stop();
    });
    setMeetid(null);
    setMyStream(null);
    setStreams([]);
    setUserID('');
    setScreenID('');
  }

  if(ScreenStream){
    ScreenStream.getVideoTracks()[0].addEventListener('ended', () => {
    console.log('Removing the Screen Share Div');
    socket.emit('RemoveShareScreenDiv',MeetID);
  });
  }
  return (
    <div className="App">
              <nav className="navbar navbar-top sticky-top navbar-light bg-light">
                <a className="navbar-brand" href="#">
                  <img src={brandIcon} width="50" height="50" className="d-inline-block" alt=""/>
                  meetify
                </a>
                {UserID?
                <h3>{`@${UserID}`}</h3>
                :<h3></h3>
                }
              </nav>
        {
          MeetID&&UserID?
            <div className='main-render-wrapper'>
            <div className='main-render-wrapper' id='main-render-wrapper'>
            <div className='main-render' id='main-render'>
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
                  <div>
                    <button onClick={displayMessages}>Messages</button>
                    <button onClick={displayParticipants}>Participants</button>
                  </div>
                  <div className='Participants' id='Participants'><Participants participants={Participants_list}/></div>
                  <div id='chat'>
                    <div className='chat' id='scrollable-chat'><GroupChat socket={socket} message={message} UserID={UserID}/></div>
                    <div className='message-box'>
                      <input className='message-textbox' id='message-input-field' onChange={onChangeInput} placeholder='Write your message..'></input>
                      <button className='btn btn-outline-success' onClick={onClickSend}>Send</button>
                    </div>
                  </div>
                </div>
                :<div></div>
              }
              </div>
            </div>
            </div>
            </div>
            </div>
          :
          <Login setMeetid={setMeetid} setUserID={setUserID} VideoID={VideoID} ScreenID={ScreenID} socket={socket}/>
        }
        {
           MeetID&&UserID?
              <nav className="navbar navbar-bottom sticky-bottom navbar-light bg-light">
              {/* <FontAwesomeIcon icon={faMicrophone} className='icon' color="black" size="3x"/>
              <FontAwesomeIcon icon={faMicrophoneSlash} className='icon' color="black"/>
              <FontAwesomeIcon icon={faVideo} className='icon' color="black"/>
              <FontAwesomeIcon icon={faVideoSlash} className='icon' color="black"/>
              <FontAwesomeIcon icon={faArrowUp} className='icon' color="black"/>
              <FontAwesomeIcon icon={faHouseUser} className='icon' color="black"/> */}
                <button type="button" className="btn-nav btn btn-light" data-toggle="button" aria-pressed="false" autocomplete="off" onClick={onClickMuteUnmute}>MUTE/UNMUTE</button>
                <button type="button" className="btn-nav btn btn-light" data-toggle="button" aria-pressed="false" autocomplete="off" onClick={onClickVideoOnOFF}>VIDEO ON/OFF</button>
                <button type="button" className="btn-nav btn btn-outline-warning" onClick={onClickShareOnOFF}>SHARE/UNSHARE SCREEN</button>
                <button type="button" className="btn-nav btn btn-danger" onClick={onClickLeave}>LEAVE MEET</button>
                <div className='Button-toggle'>
                  <button onClick={onClickMedia}>HOME</button>
                  <button onClick={onClickChat}>CHAT</button>
                </div>
                </nav>
              :<div></div>
        }
    </div>
  );
}

export default App;
