import React from "react";
import Avatar from 'react-avatar';
const CardParticipants = ({name})=>{
    return(
        <div>
            <Avatar name={name} round={true}/>
            <div>{name.toUpperCase()}</div>
        </div>
    );
}

export default CardParticipants;