const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());

app.use(bodyParser.json());

let notes = [
  { id: 1, title: 'Note 1', text: 'Description for Note 1', userId: 1, date: new Date(2), type: "text" },
  { id: 2, title: 'Note 2', text: 'Description for Note 2', userId: 1, date: new Date(2), type: "text" },
  {
    id: 3,
    title: 'ttt',
    text: '7e9e4f9b92c028e3eef83564a62ceedc',
    userId: 1,
    date: new Date(2),
    type: 'image'
  }
];

let users = [
  {
    userId: 1,
    login: "aaa",
    password: "bbb"
  }
];

app.post('/list-notes', (req, res) => {
  const { userId } = req.body;
  const filteredNotes = notes.filter(note => note.userId==userId);
  console.log(filteredNotes);
  res.json(filteredNotes);
});

app.post('/login', (req, res) => {
  const { login, password } = req.body;
  if(users.some(user => user.login === login && user.password === password))
    res.status(200).json({
      userId: 1
    });
  res.status(401).send("Incorrect username or password");
});

app.post('/register', (req, res) => {
  const { login, password } = req.body;
  if(users.some(user => user.login === login))
  {
    res.status(400).json({
      message: "User exists"
    });
  }
  else
  {
    users=[...users, {
      userId: 4,
      login,
      password,
    }]
    console.log(users);
    res.status(200).json({
      userId: 1
    });
  }
});

app.post("/get-image", (req, res)=>{
  console.log(req.body);
  var img = fs.readFileSync("uploads/"+req.body.name);
  res.writeHead(200, {'Content-Type': 'image/png' });
  res.end(img, 'binary');
});

app.post('/add-image-note',upload.single('file'),(req,res)=>{
  const { title, userId } = req.body;
  const newNote = {
    id: notes.length + 1,
    title,
    text: req.file.filename,
    userId,
    date: new Date(),
    type: "image"
  };
  notes.push(newNote);
  res.status(200).send('ok');
})

app.post('/add-note', (req, res) => {
  const { text, title, userId } = req.body;
  const newNote = {
    id: notes.length + 1,
    title,
    text,
    userId,
    date: new Date(),
    type: "text"
  };
  notes.push(newNote);
  res.json(newNote);
});

app.post('/delete-note', async (req, res) => {
  const { id } = req.body;
  const elem = notes.find(note => note.id === id);
  if(elem.type==="image")
  {
    try {
      fs.unlinkSync("uploads/"+elem.text);
      console.log(`File ${"uploads/"+elem.text} has been deleted.`);
    } catch (err) {
      console.error(err);
    }
  }
  notes = notes.filter(note => note.id !== id);
  res.json({ message: 'Note deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
