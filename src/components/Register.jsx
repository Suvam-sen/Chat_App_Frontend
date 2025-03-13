import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socketClient";

function Register() {
  const [username , setUsername] = useState(localStorage.getItem("username") || "")
  const [userNameForSocket , setUserNameForSocket] = useState("")
  const navigate = useNavigate();


  function connectWithSocket(user) {
    socket.emit("register", user);
    return;
  }
  function registerUser() {
    localStorage.setItem("username", userNameForSocket);
    if (!userNameForSocket.trim()) {
      alert("Please enter a username");
      return;
    }
    connectWithSocket(userNameForSocket)
    navigate("/chat"); // Redirect to Chat page
  }
 

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="mb-4 text-xl font-semibold">Register</h2>
      <div className="w-full max-w-md p-4 bg-gray-100 rounded-xl shadow-md">
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-lg mb-2"
          placeholder="Enter username"
          value={userNameForSocket}
          onChange={(e) => setUserNameForSocket(e.target.value)}
        />
        <button
          className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
          onClick={registerUser} hidden={userNameForSocket === "" ? true : false}
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Register;
