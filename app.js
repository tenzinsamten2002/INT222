const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Image = require('./models/image');

const app = express();

// Set up MongoDB connection
mongoose.connect('mongodb://localhost/photo_gallery', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Middleware
app.use(express.urlencoded({ extended: true }));

// Set EJS as the default view engine
app.set('view engine', 'ejs');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: './public/images',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/gallery', async (req, res) => {
    try {
        const images = await Image.find();
        res.render('gallery', { images });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const image = fs.readFileSync(req.file.path);
        const contentType = req.file.mimetype;
        
        const newImage = new Image({
            data: image,
            contentType: contentType
        });
        await newImage.save();

        // Delete the temporary file
        fs.unlinkSync(req.file.path);

        // Send JSON response indicating success
        res.json({ success: true, message: 'Image uploaded successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
