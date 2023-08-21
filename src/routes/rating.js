 const express = require("express");
 const router = express.Router();
 const Product = require("../models/product");
 const User = require("../models/user");

//Ruta para obtener todos los rating
router.get("/", (req,res)=>{
  ratingSchema
  .find()
  .then((data)=>res.json(data))
  .catch((error)=>res.json({ message: error }))
  })

router.post("/", async (req, res) => {
  const { userId, products,qualify} = req.body;
  try {

    // creacion del nuevo rating
    const newRating = new ratingSchema({
      userId,
      products,
      qualify,
    });
      const ratingSave = await newRating.save()
      res.status(201).json(ratingSave);
  }catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor." });
  }
  
});





 module.exports = router;


   
 
