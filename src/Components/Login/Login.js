import React,{useState} from 'react';

const Login = ({setMeetid,setUserID,socket,VideoID})=>{
    const [MeetInput,setMeetInput] = useState('');
    const [UserInput,setUserInput] = useState('');

    const onMeetID = (e)=>{
        setMeetInput(e.target.value);
    }
    const onUserID = (e)=>{
        setUserInput(e.target.value);
    }
    const onClickJoin = ()=>{
        setMeetid(MeetInput);
        setUserID(UserInput);
        socket.emit('Join',MeetInput,UserInput,VideoID);
        const input1 = document.getElementById('Meetid');
        const input2 = document.getElementById('Userid');
        input1.value = '';
        input2.value = '';
    }
    return(
        <div>
            <input id='Meetid' placeholder='Meeting ID' onChange={onMeetID}></input>
            <input id='Userid' placeholder='User ID' onChange={onUserID}></input>
            <button onClick={onClickJoin}>Join</button>
        </div>
    );
}

export default Login;