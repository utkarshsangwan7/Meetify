import React from 'react';
import './MessageFormat.css';
const MessageFormat = ({name,message})=>{
    return(
        <div id='other'>
            <div className='other-message-wrapper'>
                <h3 className='format'>{name}</h3>
                <div className='message'>
                    <h1 className='format'>{message}</h1>
                </div>
            </div>
        </div>
    )
}

export default MessageFormat;