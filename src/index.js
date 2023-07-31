const express = require("express")
const mongoose = require("mongoose");
require("dotenv").config()

const app = express();
const port = process.env.port || 9000
const uri = process.env.MONGODB_URI
const productRoutes = require("./routes/product")
const userRoutes = require("./routes/user")
//middlewares
app.use(express.json())
//routes
app.use("/", userRoutes);
app.use('/products', productRoutes)
//app.use("/orders", buyOrderRouter);


//mongodb connection
mongoose.connect(uri)
.then(()=>console.log("connected to Mongodb Atlas"))
.catch((error)=>console.error(error))

app.listen(port,()=>  console.log('serrver is listening in port', port))