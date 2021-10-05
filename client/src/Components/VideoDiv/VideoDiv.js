import React from 'react';

const VideoDiv = ({Stream})=>{
     const videoElement = document.createElement("video");
        // console.log(VideoElement);
        videoElement.srcObject = Stream;
        videoElement.onloadedmetadata = ()=>{
            videoElement.play();
        }
    const divElement = document.getElementById('video-element-wrapper');
    if(divElement&&divElement.childElementCount===0)
    divElement.appendChild(videoElement);
    return(
        <div id='video-element-wrapper'>
        </div>
    );
}

export default VideoDiv;