import "./Note.css"
import Button from '../Button/Button';
import { usePicture } from '../networking';

const ImageNote = ({name, noteData, deleteNote}) =>{
    const {data, isLoading, isError} = usePicture(name);
    if(isError)
    {
      return <>Error</>
    }

    if(isLoading)
    {
      return <>Loading...</>
    }
    const imageUrl = URL.createObjectURL(data);
    return (<div className="note">
            <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "-30px"}}>
            <div><p>{new Date(noteData.date).toDateString()}</p></div>
            <Button text={"X"} className="closingButton" onClick={deleteNote} />
            </div>
            <h1>{noteData.title}</h1>
            <div><img style={{maxWidth:"1000px"}} src={imageUrl} alt={"picture_"+name}/></div>
        </div>);
}

const Note = ({noteData, deleteNote}) => {
    if(noteData.type==="text")
        return (
            <div className="note">
                <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "-30px"}}>
                <div><p>{new Date(noteData.date).toDateString()}</p></div>
                <Button text={"X"} className="closingButton" onClick={deleteNote} />
                </div>
                <h1>{noteData.title}</h1>
                <div><p>{noteData.text}</p></div>
            </div>
        );
    else
    {
        return <ImageNote name={noteData.text} deleteNote={deleteNote} noteData={noteData}/>
    }
}

export default Note;