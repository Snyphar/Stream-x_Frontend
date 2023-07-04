import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';


const App = () => {
  const [socket, setSocket] = useState(null);
  const [playerTime, setPlayerTime] = useState(0);
  const videoRef = useRef(null);
  var seeked = useRef(true);
  var videoFiles = useRef(null);

  const [selectedFile, setSelectedFile] = useState('');
  const videoFolder = '/videos';

  const folderPath = '../screen-sharing-website/public/videos/';
  const fserver = "http://localhost:3000";
  const bserver = "http://localhost:3001";

  // Make an HTTP request to the server endpoint
  
  

  const handleFileChange = (event) => {
    const selectedFile = event.target.value;
    setSelectedFile(selectedFile);
    const videoElement = videoRef.current;
    videoElement.src = fserver+"/videos/"+selectedFile;
    
    socket.emit('file-change', selectedFile);
  };

  useEffect(() => {
    fetch(bserver+'/getFilenames', {
      method: 'POST',
      body: JSON.stringify({ folderPath }), // Send the folder path as payload
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      // Collect all filenames in a single array
      const allFilenames = data.filenames;
      console.log(allFilenames);
      
      // Log all filenames
      console.log('All Filenames:');
      const selectElement = document.getElementById('filename-select');
      allFilenames.forEach(filename => {
        console.log(filename);
        const option = document.createElement('option');
        option.value = filename;
        option.text = filename;
        selectElement.appendChild(option);
        
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
    fetch(bserver+'/get_file')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const playFile = data.playFile;
        if(playFile.length >= 0)
        {
          const videoElement = videoRef.current;
          videoElement.src = fserver+"/videos/"+playFile;
        }
      })
      .catch(error => {
        console.error('Error:', error);
    });

    const newSocket = io(bserver);
    
    setSocket(newSocket);

    // Event handler for receiving the player time from the server
    newSocket.on('play', (time) => {
      const videoElement = videoRef.current;
      console.log('Play:', time);
      console.log(videoElement.currentTime);
      setPlayerTime(time);
      if (playerTime !== 0 && videoElement.paused) {
        try {
          videoElement.play();
          throw new Error('An error occurred');
        } catch (error) {
          // Error handling
          console.log('Error:', error.message);
        }
        
      }
    });
    newSocket.on('file-change', (file) => {
      const videoElement = videoRef.current;
      videoElement.src = fserver+"/videos/"+file;
    });
    const ALLOWED_TIME_DIFFERENCE = 5; // Set the allowed time difference in seconds

    newSocket.on('player-time', (time) => {
      const videoElement = videoRef.current;
      console.log(time);
      console.log(videoElement.currentTime);

      // Calculate the absolute difference between videoElement.currentTime and time
      const timeDifference = Math.abs(videoElement.currentTime - time);

      if (timeDifference > ALLOWED_TIME_DIFFERENCE) {
        setPlayerTime(time);
        seeked = true;
      }
    });

    newSocket.on('pause', () => {
      console.log('pause');
      const videoElement = videoRef.current;
      videoElement.pause();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;

    // Event handler for playing the video
    const handlePlay = () => {
      if(!seeked){

        socket.emit('play', videoElement.currentTime);
      }
      seeked =false
      
    };
    const handlePause = () => {
      if(!seeked){
        socket.emit('pause');
      }
      
    };
    // Event handler for seeking the video
    const handleSeeked = () => {
      socket.emit('player-time', videoElement.currentTime);
    };

    if (videoElement) {
      videoElement.autoplay = true;
      try {
        // Code that might throw an error
        
        videoElement.load();
        throw new Error('An error occurred');
      } catch (error) {
        // Error handling
        console.log('Error:', error.message);
      }
      
      
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
      videoElement.addEventListener('seeked', handleSeeked);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('seeked', handleSeeked);
      }
    };
  }, [socket]);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.autoplay = true;
      try {
        // Code that might throw an error
        videoElement.load();
        
      } catch (error) {
        // Error handling
        console.log('Error:', error.message);
      }
    }

    if (videoElement) {
      videoElement.currentTime = playerTime;
    }
  }, [playerTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      const videoElement = videoRef.current;
      if (socket && videoElement) {
        socket.emit('player-time', videoElement.currentTime);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [socket]);

  return (
    
    <div>
      <div>
        <select id='filename-select' value={selectedFile} onChange={handleFileChange}>
          <option value="">Select a video</option>
          
        </select>
      </div>
      <div>
        <h1>Video Player</h1>
        
        <video ref={videoRef} src="videos/video.mp4" controls height={400} width={500}/>
      </div>
      
    </div>
  );
};

export default App;
