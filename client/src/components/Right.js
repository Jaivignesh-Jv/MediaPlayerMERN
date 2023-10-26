import React, { useState } from "react";
import axios from "axios";
import "./player.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Songs from "./Songs";

function Right(props) {
  const nav = useNavigate();
  const [uploadToggle, setUploadToggle] = useState(false);
  const [songFile, setSongFile] = useState(null);
  const [uploading, setuploading] = useState("upload");
  const [searchValue, setSearchValue] = useState("");
  const [songs, setSongs] = useState([]);
  const [local, setLocal] = useState(false);
  const handleSubmitSearch = (async) => {
    console.log(searchValue);
    try {
      axios
        .post("https://musicappbackend.azurewebsites.net/api/searchforsongs", {
          search: searchValue,
        })
        .then((res) => {
          setSongs(res.data);
          console.log(res);
          console.log(songs);
        });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = axios.post(
        "https://musicappbackend.azurewebsites.net/api/delete",
        {
          id: id,
        }
      );
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSongFileChange = (event) => {
    setSongFile(event.target.files[0]);
  };
  const handleLogout = () => {
    localStorage.removeItem("username");
    nav("/");
  };
  const handleSubmit = async (event) => {
    console.log("submitting");
    event.preventDefault();
    const formData = new FormData();
    formData.append("song", songFile);
    try {
      const response = await axios.post(
        `https://musicappbackend.azurewebsites.net/api/upload?user=${localStorage.getItem(
          "username"
        )}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setuploading("uploading");
      setTimeout(() => {
        window.location.reload();
      }, 8000);
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="right_container ">
      <div className="songs_container">
        {props.songs.length === 0 ? (
          <h2>upload songs to start listening </h2>
        ) : (
          <h2>Songs</h2>
        )}

        <ul>
          {props.songs.map((song) => (
            <li key={song._id}>
              <div className="song_item">
                <div className="song_info">
                  <h3>{song.title}</h3>
                </div>
                <div className="song_actions">
                  <button onClick={() => handleDelete(song._id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {uploadToggle && (
        <div className="upload_container">
          {local ? (
            <div className="uploadfromlocal">
              <form onSubmit={handleSubmit}>
                <div>
                  {/* <label htmlFor="song">Song: </label> */}
                  <input
                    type="file"
                    id="song"
                    onChange={handleSongFileChange}
                  />
                </div>

                <button
                  onClick={() => {
                    toast.success(" uploading! please wait! ", {
                      position: "bottom-right",
                      autoClose: 5000,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "light",
                    });
                  }}
                  type="submit"
                >
                  upload
                </button>
              </form>
            </div>
          ) : null}
          <div className="upload_login_continer">
            <input
              style={{
                width: "100%",
              }}
              type="text"
              placeholder="song name"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
            />
            <button onClick={handleSubmitSearch}>Search</button>
            <button
              style={{
                position: "relative",
                left: "10px",
              }}
              onClick={() => {
                setLocal(!local);
              }}
            >
              Local
            </button>
          </div>
          <div className="searched_songs">
            <Songs songs={songs} />
          </div>
        </div>
      )}
      <div className="logout">
        <button onClick={handleLogout}>createnew</button>
      </div>
      <div className="upload">
        <button
          onClick={() => {
            setUploadToggle(!uploadToggle);
          }}
        >
          {uploading}
        </button>
      </div>
      <div className="share">
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Copied to clipboard", {
              position: "bottom-right",
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
          }}
        >
          share
        </button>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeButton={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default Right;
