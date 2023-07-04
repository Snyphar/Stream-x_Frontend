import React, { useEffect, useRef, useState } from 'react';
import socketIOClient from 'socket.io-client';

const Viewer = () => {
  const videoRef = useRef(null);
  const [screenChunks, setScreenChunks] = useState([]);
  const socket = socketIOClient('http://localhost:3001/');

  useEffect(() => {
    socket.on('screen-chunk', (chunk) => {
      setScreenChunks((prevChunks) => [...prevChunks, chunk]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (screenChunks.length > 0 && videoRef.current) {
      const mediaSource = new MediaSource();
      videoRef.current.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener('sourceopen', () => {
        const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        sourceBuffer.addEventListener('updateend', () => {
          if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
            mediaSource.endOfStream();
          }
        });

        screenChunks.forEach((chunk) => {
          sourceBuffer.appendBuffer(chunk);
        });
      });
    }
  }, [screenChunks]);

  return (
    <div>
      <h1>Screen Viewer</h1>
      {screenChunks.length > 0 ? (
        <video ref={videoRef} controls autoPlay />
      ) : (
        <p>Waiting for screen chunks...</p>
      )}
    </div>
  );
};

export default Viewer;
