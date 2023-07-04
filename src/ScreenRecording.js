import React, { useState, useRef } from 'react';
import socketIOClient from 'socket.io-client';

const ScreenRecording = () => {
  const [recording, setRecording] = useState(false);
  const [chunks, setChunks] = useState([]);
  const videoRef = useRef(null);
  let mediaRecorder = null;
  const socket = socketIOClient('http://localhost:3001/'); // Replace with your socket server URL

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Error accessing screen:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
    socket.emit('stop-sharing');
  };

  const handleDataAvailable = (event) => {
    console.log("Recieved");
    if (event.data.size > 0) {
      setChunks((prevChunks) => [...prevChunks, event.data]);
      socket.emit('screen-chunk', event.data); // Send the chunk to the socket server
    }
  };

  const downloadRecording = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'screen_recording.webm';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Screen Recording</h1>
      {recording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}
      {chunks.length > 0 && (
        <div>
          <video ref={videoRef} controls>
            {chunks.map((chunk, index) => (
              <source key={index} src={URL.createObjectURL(chunk)} type="video/webm" />
            ))}
          </video>
          <button onClick={downloadRecording}>Download Recording</button>
        </div>
      )}
    </div>
  );
};

export default ScreenRecording;
