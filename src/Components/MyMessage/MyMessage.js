import React from 'react';
import './MyMessage.css';
const MyMessage = ({name,message})=>{
    return(
        <div id='my'>
            <div className='my-message-wrapper'>
                <h3 className='format'>{name}</h3>
                <div className='my-message'>
                    <h1 className='format'>{message}</h1>
                </div>
            </div>
        </div>
    )
}

export default MyMessage;