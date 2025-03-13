import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socketClient";
function connectWithSocket(user) {
  socket.emit("register", user);
  return;
}
function Chat() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [isUserConnected, setIsUserConnected] = useState(false);
  const [receiverId, setReceiverId] = useState("");
  const [manualReceiver, setManualReceiver] = useState(""); // For manual input
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }
    if (username && !isUserConnected) {
      connectWithSocket(username)
      setIsUserConnected(true);
    }

    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.emit("getUsers");
    socket.on("userList", (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off("message");
      socket.off("userList");
    };
  }, [username, navigate]);

  function sendMessage() {
    const selectedReceiver = manualReceiver || receiverId;

    if (!selectedReceiver) {
      alert("Please select or enter a receiver!");
      return;
    }

    if (message.trim()) {
      const msgData = { sender: username, message, reciver: selectedReceiver };
      socket.emit("message", msgData);
      setMessage("");
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <p className="font-bold mb-2">You: {username}</p>

        {/* Manual Receiver Input */}
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-lg mb-2"
          placeholder="Enter username to chat"
          value={manualReceiver}
          onChange={(e) => setManualReceiver(e.target.value)}
        />

        {/* User List */}
        <ul>
          {users.map((user, index) => (
            <li
              key={index}
              className={`p-2 rounded-lg cursor-pointer ${
                user === receiverId ? "bg-blue-300" : "bg-white"
              }`}
              onClick={() => {
                setReceiverId(user);
                setManualReceiver(""); // Clear manual input
              }}
            >
              {user}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Section */}
      <div className="w-3/4 flex flex-col p-4">
        <h2 className="text-lg font-semibold mb-2">Chat</h2>

        {/* Search Bar */}
        <input
          type="text"
          className="p-2 border border-gray-300 rounded-lg mb-2"
          placeholder="Search messages..."
        />

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto border p-4 bg-white shadow-md rounded-lg">
          {messages.map((msg, index) => (
            <div key={index} className="p-2 my-2 rounded-lg bg-gray-200">
              <strong>{msg.sender}:</strong> {msg.message}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="mt-2 flex">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-lg"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="ml-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
