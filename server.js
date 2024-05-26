// server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('Your Connection String', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Schema and Model for storing images
const imageSchema = new mongoose.Schema({
  img: {
    data: Buffer,
    contentType: String
  }
});
const Image = mongoose.model('Image', imageSchema);

// Multer middleware for handling multipart/form-data
const upload = multer();

// Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle POST request for uploading image
app.post('/upload', upload.single('image'), async (req, res) => {
  const image = req.file.buffer;
  const contentType = req.file.mimetype;

  try {
    const newImage = new Image({
      img: {
        data: image,
        contentType: contentType
      }
    });
    await newImage.save();
    console.log('Image uploaded successfully');
    res.status(200).send('Image uploaded successfully');
  } catch (err) {
    console.error('Error saving image:', err);
    res.status(500).send('Error saving image');
  }
});

// Route to fetch and display the image
app.get('/images', async (req, res) => {
  try {
    // Retrieve all images from the database
    const images = await Image.find();
    
    // Convert binary data to Base64-encoded strings
    const imagesWithBase64 = images.map(image => ({
      _id: image._id,
      img: {
        data: image.img.data ? image.img.data.toString('base64') : null,
        contentType: image.img.contentType
      }
    }));
    
    
    // Send images as JSON response
    res.json(imagesWithBase64);
  } catch (error) {
    console.error('Error retrieving images:', error);
    res.status(500).send('Internal Server Error');
  }
});





app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
