const express = require("express")
const userSchema = require("../models/user")
const postMailerRegister = require("../controllers/nodemailerRegister")

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

//Ruta para obtener todos los usuarios por id
router.get("/users/email/:email", (req,res)=>{
  const {email} = req.params;
  userSchema
  .findOne({email: email})
  .then((data)=>res.json(data._id))
  .catch((error)=>res.json({ message: error }))
  })


    
//ruta para crear usuario    

router.post("/", async (req, res) => {
  const { name, phone, email, password} = req.body;


  try {
    // Verificar si el correo electrónico ya existe en la base de datos
    const existingUser = await userSchema.findOne({ email });

    if (existingUser) {
      return res.status(409).json( {message: "El correo electrónico ya está en uso." });
    }

    // Si el correo electrónico no existe, crea el nuevo usuario
    const newUser = new userSchema({
      name,
      phone,
      email,
      password,
    });

    const sendEmail = await postMailerRegister(newUser)

     console.log(sendEmail)

    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hubo un error en el servidor." });
  }
});


//update user: para que el usuario pueda cambiar algun dato personal?
router.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, password,phone ,admin,isActive } = req.body;
    userSchema
      .updateOne({ _id: id }, { $set: { name, email, password, phone,admin,isActive } })
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