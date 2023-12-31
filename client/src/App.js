import React from 'react';
import LoginRegister from './LoginRegister/LoginRegister';
import MainPage from './MainPage/MainPage'
import { useState } from 'react';
import './App.css';

function App() {
  const [logged, setLogged] = useState(localStorage.getItem("userId"));
  if(logged)
  {
    return <MainPage/>;
  }
  return <LoginRegister setLogged={setLogged}/>;
}

export default App;
