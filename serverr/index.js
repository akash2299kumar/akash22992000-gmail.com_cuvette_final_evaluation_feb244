
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const errorHandler = require("./middleware/errorHandler.js");


const userRoutes = require("./route/userRoutes.js");
const storyRoutes = require("./route/storyRoutes.js");
const connectDB = require("./config/connectDB.js");

dotenv.config();

const app = express();

// ====================================================== MIDDLEWARE =====================================================
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/dist")));

const corsOptions = {
  credentials: true,
  origin: "https://akash22992000-gmail-com-cuvette-final-evaluation-it1ih1m3q.vercel.app/", 
};
app.use(cors(corsOptions));



app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set("trust proxy", 1);

//-------------------- Connect to Database --------------------
connectDB();

// routes
app.use("/api/user", userRoutes);
app.use("/api/story", storyRoutes);

app.get('/', (req, res) => {
    res.send('running')
})

app.get('/download-image', async (req, res) => {
  const imageUrl = req.query.url;
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    res.set('Content-Type', response.headers.get('content-type'));
    res.send(buffer);
  } catch (error) {
    res.status(500).send('Error downloading image');
  }
});
// Start server
const PORT = process.env.PORT || 5001; // Add a fallback port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

