const express = require('express');
const morgan = require('morgan');
const app = express();
const mongoose = require("mongoose");
const Product = require('./models/Product');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const sharp = require("sharp");
const fs = require("fs");
const resizeImages = require("./resizeImages");
const port = 3000;

app.use(cors({
  origin: "https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev", 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

const uri = "mongodb+srv://danber604:Tisdag0606@cluster0.o1yjf.mongodb.net/webstore?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri);
mongoose.connection
  .on("open", () => console.log("mongoose is connected"))
  .on("close", () => console.log("mongoose is disconnected"))
  .on("error", (error) => console.log(error));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, '../frontend/react/dist'))); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen( port, async ()=>{
    console.log(`Servern är igång på ${port}`);
    await resizeImages();
}); 

app.get('/', async (req,res)=>{
  console.log('Hello world!');
  res.sendFile(path.join(__dirname, '../frontend/react/dist/index.html'));
});
;
  

// Multer Setup for File Uploads
const storage = multer.diskStorage({
  destination: './uploads/', // Store images in 'uploads' folder
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Allow max 10MB file size
});




app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('Received file:', req.file); // Debug: Check if file is received
    console.log('Received body:', req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const originalPath = req.file.path; // Original file path
    const resizedFilename = `resized-${req.file.filename}`;
    const resizedPath = path.join(__dirname, 'uploads', resizedFilename);

    // Resize the image
    await sharp(originalPath)
      .rotate()
      .resize(300, 300, { fit: "cover" })
      .toFormat("jpeg", { mozjpeg: true, quality: 100 })
      .toFile(resizedPath);

    // Delete the original image after resizing
    fs.unlinkSync(originalPath);

    // Save to database
    const newProduct = await Product.create({
      productNames: req.body.productNames,
      productPrices: req.body.productPrices,
      productImages: `/uploads/${resizedFilename}`, // Store new resized file path
    });

    res.json({ message: "Image uploaded & resized successfully!", product: newProduct });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

  app.get('/products', async (req, res) => {
    const products = await Product.find(); 
    console.log(products);
    res.json(products); 
  });

  app.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Get image file path
        const imagePath = path.join(__dirname, product.productImages);
        
        // Delete the image file if it exists
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log(` Deleted image: ${imagePath}`);
        }

        // Remove product from database
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully!" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


  app.put('/products/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    product.productNames = req.body.productNames;
    product.productPrices = req.body.productPrices;
    product.productImages = req.body.productImages;
    await product.save();
    res.redirect(`/products/${product._id}`);
  })
  
  app.get('/product/:id', async (req, res) => {
    const data = {
      student: await Product.findById(req.params.id)
    };
    res.json(data);
  });
  
  app.get('*', async (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/react/dist/index.html'));
  });