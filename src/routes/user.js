const express = require("express")
const userSchema = require("../models/user")

const router = express.Router()

//Ruta para obtener todos los usuarios
router.get("/", (req,res)=>{
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


//update user: para que el usuario pueda cambiar algun dato personal?
router.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, password,lastname } = req.body;
    userSchema
      .updateOne({ _id: id }, { $set: { name, email, password, lastname } })
      .then((result) => {
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({ message: "Usuario actualizado correctamente" });
      })
      .catch((error) => res.status(500).json({ error: "Error al actualizar al usuario" }));
  });
  
//delete user by id
router.delete("/users/:id", (req, res) => {
    const { id } = req.params;
    userSchema
      .deleteOne({ _id: id })
      .then((data) => res.json(data))
      .catch((error) => res.json({ message: error }));
  });

module.exports = router;