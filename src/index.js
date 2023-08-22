const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const session = require("express-session");
const app = express();
const port = process.env.port || 3002;
const uri = process.env.MONGODB_URI;
const productRoutes = require("./routes/product");
const userRoutes = require("./routes/user");
const buyOrderRoutes = require("./routes/buyOrder");
const ratingRoutes = require("./routes/rating");

// Configuración de express-session
app.use(
  session({
    secret: "acasdawdawdqwedrqaeqweqw",
    resave: false,
    saveUninitialized: true,
  })
);

//middlewares
app.use(express.json());
app.use(morgan("dev"));

// app.use(cors({ origin: "http://localhost:3002" }));
// // agregado por mi 
 
// app.use(cors({ origin: "http://localhost:5173" }));

app.use(cors({}));


app.use("/", userRoutes);
app.use("/products", productRoutes);
app.use("/order", buyOrderRoutes);
app.use("/rating", ratingRoutes);

//app.use("/orders", buyOrderRouter);

//mongodb connection
mongoose
  .connect(uri)
  .then(() => console.log("connected to Mongodb Atlas"))
  .catch((error) => console.error(error));

app.listen(port, () => console.log("server is listening in port", port));
