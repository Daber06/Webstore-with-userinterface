require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const Product = require("./models/Product.js");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const resizeImages = require("./resizeImages");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User.js");
const Cart = require("./models/Cart.js");

const port = 3000;
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

app.use(
  cors({
    origin: "https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const uri =
  "mongodb+srv://danber604:Tisdag0606@cluster0.o1yjf.mongodb.net/webstore?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri);
mongoose.connection
  .on("open", () => console.log("mongoose is connected"))
  .on("close", () => console.log("mongoose is disconnected"))
  .on("error", (error) => console.log(error));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "../frontend/react/dist")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, async () => {
  console.log(`Servern är igång på ${port}`);
  await resizeImages();
});

app.get("/", async (req, res) => {
  console.log("Hello world!");
  res.sendFile(path.join(__dirname, "../frontend/react/dist/index.html"));
});

// Multer
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

//resizes and uploads image

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("Received file:", req.file);
    console.log("Received body:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const originalPath = req.file.path;
    const resizedFilename = `resized-${req.file.filename}`;
    const resizedPath = path.join(__dirname, "uploads", resizedFilename);

    await sharp(originalPath)
      .rotate()
      .resize(300, 300, { fit: "cover" })
      .toFormat("jpeg", { mozjpeg: true, quality: 100 })
      .toFile(resizedPath);

    fs.unlinkSync(originalPath);

    const newProduct = await Product.create({
      productNames: req.body.productNames,
      productPrices: req.body.productPrices,
      productImages: `/uploads/${resizedFilename}`,
      description: req.body.description,
    });

    res.json({
      message: "Image uploaded & resized successfully!",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//handles products

app.get("/products", async (req, res) => {
  const products = await Product.find();
  console.log(products);
  res.json(products);
});

app.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const imagePath = path.join(__dirname, product.productImages);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`Deleted image: ${imagePath}`);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.productNames = req.body.productNames;
    product.productPrices = req.body.productPrices;
    product.description = req.body.description;

    await product.save();

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//authentication

const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  console.log("Received Token:", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    req.user = user;
    next();
  });
};

//handles log in

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });

    const token = jwt.sign({ id: newUser._id }, jwtSecret, { expiresIn: "1h" });

    res.json({ message: "Sign up successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error during sign up" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/delete-account", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await Product.deleteMany({ userId });
    await Cart.deleteMany({ userId });

    res.json({ message: "Your account has been deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting account. Please try again later." });
  }
});

//handles cart

app.get("/cart", authenticateJWT, async (req, res) => {
  try {
    console.log("Authenticated User ID:", req.user.id);
    const cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: "products.productId",
      select: "productNames productPrices productImages description",
    });
    res.json(cart);
    console.log("Populated cart data for logged in user:", cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/cart", authenticateJWT, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const existingCart = await Cart.findOne({ userId: req.user.id });

    if (existingCart) {
      const productIndex = existingCart.products.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (productIndex !== -1) {
        existingCart.products[productIndex].quantity += quantity;
      } else {
        existingCart.products.push({ productId, quantity });
      }
      await existingCart.save();
      return res.json({ message: "Cart updated", cart: existingCart });
    }

    const newCart = await Cart.create({
      userId: req.user.id,
      products: [{ productId, quantity }],
    });

    res.json({ message: "Item added to cart", cart: newCart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/cart/:id", authenticateJWT, async (req, res) => {
  const { quantity } = req.body;

  try {
    const cartItem = await Cart.findById(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({ message: "Cart item updated", cartItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/cart/:id", authenticateJWT, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item._id.toString() === req.params.id
    );
    if (productIndex === -1) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    cart.products.splice(productIndex, 1);
    await cart.save();

    res.json({ message: "Cart item removed", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
