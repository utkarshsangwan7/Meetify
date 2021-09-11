import React from "react";
import CardParticipants from "./CardParticipants";

const Participants = ({participants})=>{
    let participants_list=null;
    if(participants.length>0){
        console.log(participants);
        participants_list = participants.map((user,i)=>{
            return <CardParticipants key={i} name={user.name}/>
        });
    }
    return(
        <div>
            {   
               participants_list
            }
        </div>
    );
}

export default Participants;