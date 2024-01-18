const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const {Connector} = require('@google-cloud/cloud-sql-connector');
const {Storage} = require('@google-cloud/storage');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

const app = express();
const PORT = 8080;

const storageMul = multer.memoryStorage();
const upload = multer({ storage: storageMul });

let config;

async function initializeConnection() {
  const connector = new Connector();
  const [accessResponse] = await client.accessSecretVersion({
    name: process.env.DATABASEACESS,
  });

  const clientOpts = await connector.getOptions({
      instanceConnectionName: process.env.INSTANCECONN,
  });
  config = {
    ...clientOpts,
    database: process.env.DATABASENAME,
    host: process.env.SQL_IP,
    user: process.env.DATABASEUSER,
    password: accessResponse.payload.data.toString('utf8'),
  }
}

app.use(cors());

app.use(bodyParser.json());

app.post('/list-notes', async (req, res) => {
  await initializeConnection();
  const { userId } = req.body;
  const connection = mysql.createConnection(config);
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    connection.query('SELECT * FROM notes where userId=?', [userId], (error, results, fields) => {
      if (error) {
        console.error('Error querying MySQL:', error);
        return;
      }

      res.json(results);

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

app.post('/ping', (req,res) => {
  res.send("pong");
})

app.post('/login', async (req, res) => {
  await initializeConnection();
  const { login, password } = req.body;
  const connection = mysql.createConnection(config);
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
          userId: results[0].id
        });
      else res.status(401).send("Incorrect username or password");

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

app.post('/register', async (req, res) => {
  await initializeConnection();
  const { login, password } = req.body;
  const connection = mysql.createConnection(config);

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    connection.query('SELECT * FROM user where logins = ?', [login], async (error, results, _) => {
      if (error) {
        console.error('Error querying MySQL:', error);
        return;
      }
      if (results.length > 0)
      {
        res.status(400).json({
          message: "User exists"
        });
      }
      else
      {
        try {
          await connection.execute('INSERT INTO user (logins, password) VALUES (?, ?)', [login, password]);
          connection.query('SELECT id FROM user where logins = ?', [login], async (error, results, _) => {
            if (error) {
              console.error('Error querying MySQL:', error);
              return;
            }
              res.status(201).json({
                userId: results[0].id,
              });
              await connection.end();
        });
        } catch (error) {
          console.error('Error inserting new user:', error);
          res.status(500).send('Internal Server Error');
        }
      }
    });
  });
});

app.post("/get-image", async (req, res)=>{
  await initializeConnection();
  try {
    const fileName = req.body.name;
    const storage = new Storage();

    const bucket = storage.bucket(process.env.BUCKET_NAME);
    const file = bucket.file(fileName);

    const fileStream = file.createReadStream();

    res.setHeader('Content-Type', 'application/octet-stream');

    fileStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/add-image-note',upload.single('file'), async (req,res)=>{
  await initializeConnection();
  const filename = uuidv4();
  const storage = new Storage();
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const file = req.file;

    const bucket = storage.bucket(process.env.BUCKET_NAME);
    const fileUpload = bucket.file(filename);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.on('error', (err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });

    stream.end(file.buffer);

    const { title, userId  } = req.body;
    const connection = mysql.createConnection(config);

    connection.connect(async (err) => {
      if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
      }
      try {

        const results = await connection.execute('INSERT INTO notes (title, text, userId, date, type) VALUES (?, ?, ?, ?, ?)', [title, filename, userId, new Date(), "image"]);
        console.log(results);
        res.status(200).end();
        await connection.end();
      } catch (error) {
        console.error('Error inserting new user:', error);
        res.status(500).send('Internal Server Error');
      }
      });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

async function removePicture(fileName) {
  try {
    const storage = new Storage();
    const bucket = storage.bucket(process.env.BUCKET_NAME);
    const file = bucket.file(fileName);

    const exists = await file.exists();

    if (exists[0]) {
      await file.delete();
      console.log(`File "${fileName}" deleted successfully.`);
    } else {
      console.log(`File "${fileName}" not found in the bucket.`);
    }
  } catch (error) {
    console.error(`Error removing file "${fileName}":`, error);
    throw error;
  }
};

app.post('/add-note', async (req, res) => {
  await initializeConnection();
  const { text, title, userId  } = req.body;
  const connection = mysql.createConnection(config);

  connection.connect(async (err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    try {
      const results = await connection.execute('INSERT INTO notes (title, text, userId, date, type) VALUES (?, ?, ?, ?, ?)', [title, text, userId, new Date(), "text"]);
      console.log(results);
      res.status(200).end();
      await connection.end();
    } catch (error) {
      console.error('Error inserting new user:', error);
      res.status(500).send('Internal Server Error');
    }
    });
});

app.post('/delete-note', async (req, res) => {
  await initializeConnection();
  const { id } = req.body;
  const connection = mysql.createConnection(config);

  connection.query('SELECT text, type FROM notes where id=?', [id], async (error, results, fields) => {
      if (error) {
        console.error('Error querying MySQL:', error);
        return;
      }

     if(results[0].type==="image")
        removePicture(results[0].text);

        try {
          const results = await connection.execute('DELETE from notes where id=?', [id]);
          res.status(200).json({ message: 'Note deleted successfully' });
        } catch (error) {
          console.error('Error inserting new user:', error);
          res.status(500).send('Internal Server Error');
        }

      connection.end((endErr) => {
        if (endErr) {
          console.error('Error closing MySQL connection:', endErr);
        } else {
          console.log('Connection closed');
        }
      });
    });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port:${PORT}`);
});
