import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch('http://localhost:4003/mytesting', {
      method: 'get', // Use POST method
      headers: {
        'Content-Type': 'application/json',
        authorization: "12345" 
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setPosts(data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);
  return (
    <div className="App">
      <h1>
        Test App
      </h1>
    </div>
  );
}

export default App;





