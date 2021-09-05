import React from 'react';
import VideoDiv from '../VideoDiv/VideoDiv';

const VideoElement = ({StreamList})=>{
        console.log(StreamList);
        const streams = StreamList.map((stream,index)=>{
            return <VideoDiv key={index} Stream={stream}/>
        });
    return(
        <div>
           {streams}
        </div>
    );
}

export default VideoElement;