import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socketClient";

function connectWithSocket(user) {
  socket.emit("register", user);
  return;
}

function ChatPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  
  const [isUserConnected, setIsUserConnected] = useState(false);

  // States for chatting
  const [searchUser, setSearchUser] = useState("");
  const [receiverId, setReceiverId] = useState("");   
  const [manualReceiver, setManualReceiver] = useState(""); 
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  // Navigate to home if no username
  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }
    
    
    if (username && !isUserConnected) {
      connectWithSocket(username);
      setIsUserConnected(true);
    }

    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    
    socket.emit("getUsers");
    socket.on("userList", (userList) => {
      setUsers(userList);
    });

    
    return () => {
      socket.off("message");
      socket.off("userList");
    };
  }, [username, navigate, isUserConnected]);

  // Send message
  function sendMessage() {
    const selectedReceiver = manualReceiver || receiverId;

    if (!selectedReceiver) {
      alert("Please select or enter a receiver!");
      return;
    }

    if (message.trim()) {
      const msgData = {
        sender: username,
        message,
        reciver: selectedReceiver,
      };
      setMessages((prev) => [...prev, msgData]);

      // Emit to server
      socket.emit("message", msgData);
      setMessage("");
    }
  }

  // Filtered user list based on search input
  const filteredUsers = users.filter((user) =>
    user.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      
      <div className="w-1/4 border-r border-gray-300 flex flex-col">
        {/* Current User */}
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-semibold">User1: {username}</h2>
        </div>

        {/* Search User */}
        <div className="p-4 border-b bg-white">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Search user..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
        </div>

        {/* Manually enter a user to chat with */}
        <div className="p-4 border-b bg-white">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Enter username manually"
            value={manualReceiver}
            onChange={(e) => setManualReceiver(e.target.value)}
          />
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user, index) => (
            <div
              key={index}
              onClick={() => {
                setReceiverId(user);
                setManualReceiver("");
              }}
              className={`cursor-pointer p-2 border-b hover:bg-gray-100 ${
                user === receiverId ? "bg-blue-100" : ""
              }`}
            >
              {user}
            </div>
          ))}
        </div>
      </div>
      <div className="w-3/4 flex flex-col">
        {/* Opponent Name / Chat Header */}
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-semibold">
            Opponent: {receiverId || manualReceiver || "No user selected"}
          </h2>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-white">
          {messages.map((msg, index) => {
            const isMe = msg.sender === username;
            return (
              <div
                key={index}
                className={`flex mb-2 ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg p-3 max-w-xs break-words ${
                    isMe
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <div className="text-sm font-semibold">{msg.sender}</div>
                  <div className="text-sm">{msg.message}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Send Message Input */}
        <div className="p-4 border-t bg-white flex">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-lg"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={sendMessage}
            className="ml-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
