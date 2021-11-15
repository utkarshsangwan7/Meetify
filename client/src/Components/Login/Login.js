import React,{useState} from 'react';
import landImage from '../../land-bg.png';
import './Login.css';

const Login = ({setMeetid,setUserID,socket,VideoID,ScreenID})=>{
    const [MeetInput,setMeetInput] = useState('');
    const [UserInput,setUserInput] = useState('');

    const onMeetID = (e)=>{
        setMeetInput(e.target.value);
    }
    const onUserID = (e)=>{
        setUserInput(e.target.value);
    }
    const onClickJoin = ()=>{
        if(MeetInput&&UserInput){
            setMeetid(MeetInput);
            setUserID(UserInput);
            socket.emit('Join',MeetInput,UserInput,VideoID,ScreenID);
            const input1 = document.getElementById('Meetid');
            const input2 = document.getElementById('Userid');
            input1.value = '';
            input2.value = '';
        }
    }
    return(
        <div className='landing-main'>
            <div className="card mb-3 main-card" >
            <div className="row g-0 main-card-inner">
                <div className='col-md-8 back'>
                    <div className="col-md-8 card-image">
                        <img src={landImage} className="img-fluid rounded-start" alt="..."></img>
                    </div>
                    <div className="col-md-6">
                        <div className="card-body">
                        <h3 className="card-title">Breaking Barriers & Bringing People Together.</h3>
                        <p className="card-text"><small class="text-muted">Dream it. Find It. Love It!</small></p>
                    </div>
                     </div>
                </div>
                <div className="col-md-4 write-up">
                    <div className='login-wrap'>
                    <div className='login-heading'><h1>LOGIN</h1></div>
                    <div className='login'>
                        <input id='Meetid' placeholder='Meeting ID' onChange={onMeetID} autoComplete="off"></input>
                        <input id='Userid' placeholder='User ID' onChange={onUserID} autoComplete="off"></input>
                        <button className="btn btn-dark join" onClick={onClickJoin}>Join</button>
                    </div>
                     </div>
                </div>
            </div>
            </div>
        </div>
    );
}

export default Login;