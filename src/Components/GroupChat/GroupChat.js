import React from 'react';
import MessageFormat from '../MessageFormat/MessageFormat';
import MyMessage from '../MyMessage/MyMessage';

const GroupChat = ({message,UserID})=>{
    const Chat = message.map((message,index)=>{
        if(message.name !== UserID){
            return <MessageFormat key={index} name={message.name} message={message.message}/>
        }else{
            return <MyMessage key={index} name={message.name} message={message.message}/>
        }
    });
    return(
        <div id='my_chat_message'>
            {Chat}
        </div>
    );
}

export default GroupChat;