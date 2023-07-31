const express = require("express")

const router = express.Router()

//Ruta para obtener todos los productos
router.get("/", (req,res)=>{
res.send("ruta get products")
})


module.exports = router;
