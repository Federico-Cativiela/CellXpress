const express = require("express")
const mongoose = require("mongoose");
require("dotenv").config()
const morgan = require("morgan");
const cors = require("cors");

const app = express();
const port = process.env.port || 3002
const uri = process.env.MONGODB_URI
const productRoutes = require("./routes/product")
const userRoutes = require("./routes/user")

//middlewares
app.use(express.json())
app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:3002" }));
// agregado por mi 
app.use(cors({ origin: "http://localhost:5173" }));
//routes
app.use("/", userRoutes);
app.use('/products', productRoutes)

//app.use("/orders", buyOrderRouter);


//mongodb connection
mongoose.connect(uri)
.then(()=>console.log("connected to Mongodb Atlas"))
.catch((error)=>console.error(error))

app.listen(port,()=>  console.log('server is listening in port', port))