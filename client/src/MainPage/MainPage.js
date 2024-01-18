import Note from '../Note/Note';
import { useNotes } from '../networking';
import React, { useState } from 'react';
import Button from '../Button/Button';
import '../App.css';

const AddNoteComponent = ({addNote, setShowInput}) => {
  const [type, setType] = useState("text");
  return (
    <div className="note">
        <div style={{ display: 'grid', gap: "20px" }}>
          <input id="title_input" style={{
            color: "grey",
            fontSize: "24px",
            fontFamily: "fantasy"
          }} type={"text"} placeholder='Title' />
          {type==="image" ? <input type="file" id="image_input"/> : <textarea id="text_input" style={{
            fontSize: "16px",
            resize: "none",
            height: "200px"
          }} type={"text"} placeholder='Description' />}

          <div style={{ display: 'flex', gap: "20px" }}>
            <select id="typeSelect" onChange={()=>{
              setType(document.getElementById("typeSelect").value);
            }}>
              <option>text</option>
              <option>image</option>
            </select>
            <Button text={"Add"} onClick={() => {
              const title = document.getElementById('title_input').value;
              const content = document.getElementById("typeSelect").value==="text" ? document.getElementById('text_input').value :
              document.getElementById('image_input').files[0];
              if((document.getElementById("typeSelect").value!=="text"&&content?.name?.lastIndexOf("png")===content?.name?.length-3)||
              (document.getElementById("typeSelect").value==="text"&&content!==""&&title!=="")){
                addNote.mutate({title, content, type: document.getElementById("typeSelect").value});
                 setShowInput(false);
              }
              else{
                alert("Pola nie mogą być puste i obrazy muszą być w formacie png");
              }
            }} />
            <Button text={"Cancel"} onClick={() => { setShowInput(false); }} />
          </div></div>

      </div>
  );
}

const MainPage = () =>  {
  const [showInput, setShowInput] = useState(false);
  console.log(localStorage.getItem("userId"));
  const {data, addNote, deleteNote, isLoading, isError} = useNotes(localStorage.getItem("userId"));

  if(isError)
  {
    return <>Error</>
  }

  if(isLoading)
  {
    return <>Loading...</>
  }

  return (
    <div className="App" style={{ marginTop: "25px" }}>
      <h1>User {localStorage.getItem("username")} - notes</h1>
      {data?.length > 0 ? data.map(element =>
        <Note key={element.id} noteData={element} deleteNote={()=>{
          deleteNote.mutate(element.id);
        }}/>
      ) : <div style={{margin: "30px"}}>This is place for you notes</div>}
      {showInput ?  <AddNoteComponent addNote={addNote} setShowInput={setShowInput}/> :
      <div style={{justifyContent: "space-between", alignItems: "baseline", display: "flex"}}>
      <Button text={"Add"} onClick={() => { setShowInput(true); }} />
      <Button text={"Logout"} onClick={() => { localStorage.removeItem("userId"); window.location.reload(false);}} />
      </div>
      }
    </div>
  );
}

export default MainPage;
