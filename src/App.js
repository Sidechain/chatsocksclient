import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io.connect("http://localhost:5000", {
  autoConnect: false,
  reconnection: false
});

const App = () => {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [nickname, setNickname] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");

  socket.on("error", errorMessage => {
    setError(errorMessage);
    console.log("Client received an error!");
  });

  socket.on("connect_error", () => {
    setError("Server problems, try again later");
  });

  socket.on("chat message", ({ nickname, msg }) => {
    setChat([...chat, { nickname: nickname, msg: msg }]);
  });

  socket.on("accept nickname", () => setLoggedIn(true));

  socket.on("disconnect", reason => {
    setChat([]);
    setNickname("");
    setLoggedIn(false);
  });

  useEffect(() => {
    console.log("Am I connected?", socket.connected);
  }, []);

  const onNicknameChange = e => {
    setError("");
    setNickname(e.target.value);
  };

  const onNicknameSubmit = () => {
    socket.emit("register nickname", nickname);
    socket.open();
  };

  const onTextChange = e => {
    setError("");
    setMsg(e.target.value);
  };

  const onMessageSubmit = () => {
    console.log("sending this", { nickname, msg });
    socket.emit("chat message", { nickname, msg });
    setMsg("");
  };

  const renderChat = () => {
    return chat.map(({ nickname, msg }, idx) => (
      <div key={idx}>
        <span style={{ color: "black", fontWeight: "bold" }}>{nickname}: </span>
        <span>{msg}</span>
      </div>
    ));
  };

  return (
    <div className="App">
      {!loggedIn && (
        <div className="nickname-div">
          <p>Enter your desired nickname and start chatting! :)</p>
          <input
            className="nickname-input"
            name="nickname"
            onChange={onNicknameChange}
            value={nickname}
          />
          <button className="nickname-button" onClick={onNicknameSubmit}>
            Login
          </button>
          <div>
            <p style={{ color: "red", height: 16, margin: 8 }}>{error}</p>
          </div>
        </div>
      )}
      {loggedIn && (
        <div className="chat-div">
          <div className="chat-messages-div">{renderChat()}</div>
          <div className="chat-input-div">
            <input
              className="chat-input"
              name="msg"
              onChange={onTextChange}
              value={msg}
            />
            <button className="chat-button" onClick={onMessageSubmit}>
              Send
            </button>
          </div>
          <div>
            <p style={{ color: "red", height: 16, margin: 8 }}>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
