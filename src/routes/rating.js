 const express = require("express");
 const router = express.Router();
 const ratingSchema = require("../models/rating")
 const BuyOrder = require("../models/buyOrder");
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
  const { userId, productId,buyOrderId,qualify, comment } = req.body;
  try {

    // Si el correo electrónico no existe, crea el nuevo usuario
    const newRating = new ratingSchema({
      userId,
      productId,
      buyOrderId,
      qualify,
      comment
    });
      const ratingSave = await newRating.save()
      res.status(201).json(ratingSave);
  }catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor." });
  }
  
});





 module.exports = router;


   
 
