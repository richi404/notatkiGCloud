const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const mysql = require('mysql2');
const fs = require('fs');

const app = express();
const PORT = 8080;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'myuser',
  password: 'mypassword',
  database: 'mydatabase',
});

app.use(cors());

app.use(bodyParser.json());

app.post('/list-notes', (req, res) => {
  const { userId } = req.body;
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    connection.query('SELECT * FROM notes', (error, results, fields) => {
      if (error) {
        console.error('Error querying MySQL:', error);
        return;
      }

      console.log('Query results:', results);
      const filteredNotes = results.filter(note => note.userId == userId);
      res.json(filteredNotes);

      connection.end((endErr) => {
        if (endErr) {
          console.error('Error closing MySQL connection:', endErr);
        } else {
          console.log('Connection closed');
        }
      });
    });
  });
});

app.post('/login', (req, res) => {
  const { login, password } = req.body;
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    var sql = 'SELECT * FROM user where logins = ? and password = ?';
    connection.query(sql, [login, password], (error, results, fields) => {
      if (error) {
        console.error('Error querying MySQL:', error);
        return;
      }
      if (results.length > 0)
        res.status(200).json({
          userId: 1
        });
      res.status(401).send("Incorrect username or password");

      connection.end((endErr) => {
        if (endErr) {
          console.error('Error closing MySQL connection:', endErr);
        } else {
          console.log('Connection closed');
        }
      });
    });
  });
});

// app.post('/register', (req, res) => {
//   const { login, password } = req.body;
//   if(users.some(user => user.login === login))
//   {
//     res.status(400).json({
//       message: "User exists"
//     });
//   }
//   else
//   {
//     users=[...users, {
//       userId: 4,
//       login,
//       password,
//     }]
//     console.log(users);
//     res.status(200).json({
//       userId: 1
//     });
//   }
// });

// app.post("/get-image", (req, res)=>{
//   console.log(req.body);
//   var img = fs.readFileSync("uploads/"+req.body.name);
//   res.writeHead(200, {'Content-Type': 'image/png' });
//   res.end(img, 'binary');
// });

// app.post('/add-image-note',upload.single('file'),(req,res)=>{
//   const { title, userId } = req.body;
//   const newNote = {
//     id: notes.length + 1,
//     title,
//     text: req.file.filename,
//     userId,
//     date: new Date(),
//     type: "image"
//   };
//   notes.push(newNote);
//   res.status(200).send('ok');
// })

// app.post('/add-note', (req, res) => {
//   const { text, title, userId } = req.body;
//   const newNote = {
//     id: notes.length + 1,
//     title,
//     text,
//     userId,
//     date: new Date(),
//     type: "text"
//   };
//   notes.push(newNote);
//   res.json(newNote);
// });

// app.post('/delete-note', async (req, res) => {
//   const { id } = req.body;
//   const elem = notes.find(note => note.id === id);
//   if(elem.type==="image")
//   {
//     try {
//       fs.unlinkSync("uploads/"+elem.text);
//       console.log(`File ${"uploads/"+elem.text} has been deleted.`);
//     } catch (err) {
//       console.error(err);
//     }
//   }
//   notes = notes.filter(note => note.id !== id);
//   res.json({ message: 'Note deleted successfully' });
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
