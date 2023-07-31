const express = require("express")
const userSchema = require("../models/user")

const router = express.Router()

//Ruta para obtener todos los usuarios
router.get("/users", (req,res)=>{
    userSchema
    .find()
    .then((data)=>res.json(data))
    .catch((error)=>res.json({ message: error }))
    })

//Ruta para obtener todos los usuarios por id
router.get("/users/:id", (req,res)=>{
    const {id} = req.params;
    userSchema
    .findById(id)
    .then((data)=>res.json(data))
    .catch((error)=>res.json({ message: error }))
    })

    
//ruta para crear usuario    
router.post("/users", (req,res)=>{
    const user = userSchema(req.body)
    user
    .save()
    .then((data)=>res.json(data))
    .catch((error)=>res.json({ message: error }))
    })

module.exports = router;