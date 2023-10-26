import React, { useEffect, useRef, useState } from "react";
import "./player.css";

import Details from "./Details";
import Controls from "./Controls";

const Player = (props) => {
  console.log(props);
  const audioEl = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      audioEl.current.play();
    } else {
      audioEl.current.pause();
    }
  });

  const SkipSong = (forwards = true) => {
    if (forwards) {
      props.setCurrentSongIndex(() => {
        let temp = props.currentSongIndex;
        temp++;

        if (temp > props.songs.length - 1) {
          temp = 0;
        }

        return temp;
      });
    } else {
      props.setCurrentSongIndex(() => {
        let temp = props.currentSongIndex;
        temp--;

        if (temp < 0) {
          temp = props.songs.length - 1;
        }

        return temp;
      });
    }
  };

  return (
    <div className="player_container">
      <h1> Player </h1>
      <Details song={props.songs[props.currentSongIndex]} />
      <Controls
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        SkipSong={SkipSong}
      />
      <audio
        className="player__audio"
        src={props.songs[props.currentSongIndex].src}
        ref={audioEl}
        controls
        // controlsList="nodownload "
      ></audio>
      {/* gidyai - audio tag */}

      <p>
        Next Up : <span>{props.songs[props.nextSongIndex].title}</span>
      </p>
    </div>
  );
};

export default Player;
