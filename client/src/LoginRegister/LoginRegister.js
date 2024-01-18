import Button from '../Button/Button';
import './LoginRegister.css';
import { login, register } from '../networking'
import { useState } from 'react';

const LoginRegister = ({setLogged}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [registerForm, setRegisterForm] = useState(false);
  return (
    <div className="loginForm">
      < div style={{ display: 'grid', gap: "20px", justifyItems: "center" }}>
        <input id="login" style={{
          fontSize: "24px",
        }} type={"text"} placeholder={registerForm ? "Register" :"Login"} />

        <input id="password" style={{
          fontSize: "24px",
        }} type={"password"} placeholder='Password' />

        <Button text={registerForm ? "Register" :"Login"} onClick={async () => {
          if(registerForm)
          {
            if(document.getElementById("login").value===""||document.getElementById("password").value==="")
            {
              setErrorMessage("Any field cannot be empty");
            }
            else{
              const registered=await register(document.getElementById("login").value, document.getElementById("password").value, setLogged);
              if(!registered)setErrorMessage("This user exists");
              else
              {
                alert("User registered successfully");
                window.location.reload(false);
              }
            }
          }
          else
          {
            if(document.getElementById("login").value===""||document.getElementById("password").value==="")
            {
              setErrorMessage("Any field cannot be empty");
            }
            else{
              const logged=await login(document.getElementById("login").value, document.getElementById("password").value, setLogged);
              if(!logged) setErrorMessage("Incorrect message or password");
              document.getElementById("login").value="";
              document.getElementById("password").value="";
            }
          }
      }}/>
      </div>
      {!registerForm && <p id="register_info">If you don't have account register <span id="register_link" onClick={()=>{setRegisterForm(true);}}>here</span></p>}
      {errorMessage&&<p id="incorrect_login">{errorMessage}</p>}
    </div>
  );
}

export default LoginRegister;