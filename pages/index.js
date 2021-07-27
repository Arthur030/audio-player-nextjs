import React, { useState, useRef, useEffect } from 'react';
import tracks from './api/tracks';
import { FaPlay, FaPause, FaBackward, FaForward, FaVolumeMute, FaVolumeUp } from 'react-icons/fa'
import Image from 'next/image'

function App() {
  //track Index of tracks from tracks.js
  const [tracksIndex, setTracksIndex] = useState(0);
  //track if isPlaying for Play or Pause button
  const [isPlaying, setIsPlaying] = useState(false);
  //total duration of audio
  const [duration, setDuration] = useState(0);
  //current time of audio
  const [currentTime, setCurrentTime] = useState(0);
  //toggle mute or unMute
  const [isMuted, setIsMuted] = useState(true);
  //tracks in tracks.json
  const {title, artist, audio, img} = tracks[tracksIndex];
  

  const audioRef = useRef();
  const progressBarRef = useRef();
  //to have the player paused on first render
  const isReady = useRef(false);
  const volume = useRef();
  
  // everytime we change song
  useEffect( () => {
    pause();
    // for first render of the page, makes the player on pause
    if (isReady.current) {
      // fix the error promise undeffined when skipping songs too fast
        // const playPromise = audioRef.current.play();
        // if (playPromise !== undefined) {
        //   playPromise.then(() => {
          play();
          setIsPlaying(true);
          setDuration(audioRef.current.duration)
        // })
        // .catch(error => {
        //   console.log("handling error promise play()");
        // })
        // }
    } else {
      // once page has loaded once
      isReady.current = true;
    }
  }, [tracksIndex]);

  // update on the current time of audio
  useEffect(() => {
    // console.log(audioRef.current.currentTime)
    onLoadedMetadata();
    progressBarRef.current.value = Math.floor(audioRef.current.currentTime);
    progressBarRef.current.style.setProperty('--move-progressbar', `${progressBarRef.current.value / calculateTime(audioRef.current.duration) * 100}%`);

    if (currentTime >= audioRef.current.duration) {
      setTracksIndex(tracksIndex + 1)
    }
  }, [audioRef?.current?.onLoadedMetadata, audioRef?.current?.readyState]);

  // run on first load
  useEffect(() => {
    onLoadedMetadata()
  }, [])


  // set duration everytime the player has loaded metadata
  const onLoadedMetadata = async() => {
    await audioRef.current.onLoadedMetadata
    const seconds = Math.floor(audioRef.current.duration)
    setDuration(seconds)
    progressBarRef.current.max = seconds
  
    // try {
    //   await audioRef.current.onLoadedMetadata
    //   console.log("onLoadedMetadata try")
    //   const seconds = Math.floor(audioRef.current.duration);
    //   setDuration(seconds);
    //   progressBarRef.current.max = seconds;
    // } catch {
    //   console.log("onLoadedMetadata catch")
    // }
  };
  
  const togglePlayPause = () => {
    const prevState = isPlaying;
    setIsPlaying(!prevState);
    if (!prevState) {
      play();
    } else {
      pause();
    }
  };

  const play = async () => {
    try {
      await audioRef.current.play()
      console.log("play promise success")
    } catch {
      console.log("play promise failed, retrying...")
    }
      
  };

  const pause = () => {
    audioRef.current.pause();
  };
  
  const changeAudioToProgressBar = async () => {
      await audioRef.current.onLoadedMetadata
      audioRef.current.currentTime = progressBarRef.current.value;
      setCurrentTime(progressBarRef.current.value);
  }

  const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${returnedMinutes}:${returnedSeconds}`;
  }


  const next = () => {
    if (tracksIndex < tracks.length - 1) {
      setTracksIndex(tracksIndex + 1);
    } else {
      setTracksIndex(0);
    }
  }

  const prev = () => {
    if (tracksIndex -1 < 0) {
      setTracksIndex(tracks.length -1);
    } else {
      setTracksIndex(tracksIndex - 1);
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      audioRef.current.volume = volume.current.value / 100;
    } else {
      audioRef.current.volume = 0;
    }
  };

  const changeVolume = () => {
    audioRef.current.volume = volume.current.value / 100;
  }

  return (
    <div className="App">
      <audio 
      ref={audioRef} 
      src={audio} 
      preload="metadata"
      onLoadedMetadata={onLoadedMetadata}
      onTimeUpdate={ () => setCurrentTime(audioRef.current.currentTime)}
      >
      </audio>
      <div className="image-container">
      <Image
      height="250"
      width="250"
      className="image" 
      src={img} 
      alt={`track art for ${title} by ${artist}`}
      />
      </div>
      <div className="player-container">

      <h5 className="author">{artist}</h5>
      <h5 className="title">{title}</h5>
      <div className="button-container">
      <button onClick={prev}>
        <FaBackward />
      </button>
      <button onClick={togglePlayPause}>
      {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      <button onClick={next}>
        <FaForward />
      </button>

      <div className="volume-container">
      <button onClick={toggleMute}>
        {isMuted ? <FaVolumeUp /> : <FaVolumeMute />}
      </button>
      <input 
          type="range"
          className="volume-bar"
          min="0"
          max="100"
          defaultValue="50"
          ref={volume}
          onChange={changeVolume}
          />
      </div>

      </div>
      <div>
      </div>
      <input 
        className="progress-bar"
        type="range"
        defaultValue="0"
        ref={progressBarRef}
        onChange={changeAudioToProgressBar}
      />
      <div className="time-container">
        <h5>{calculateTime(currentTime)}</h5>
        <h5>{ duration ? calculateTime(duration) : "00:00" }</h5>
      </div>

      </div>
      <h1>audio-player-nextjs</h1>
    </div>

  );
}


export default App;