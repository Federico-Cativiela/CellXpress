const express = require("express");
const adminSchema = require("../models/admin")

const router = express.Router();

// create admin endpoint example: http://localhost:3002/admin/create
router.post("/create", (req, res) => {
  const { name, password, setAccess ,orderStatus} = req.body;

if (!name || !password || !setAccess || !orderStatus) return res.status(400).json({ message: `Completar todos los campos` })

  const createAdmin = new adminSchema({
    name,
    password,
    setAccess
  })

  createAdmin
    .save()
    .then((admin) => {
        res.status(200).json({ message: 'Admin creado con éxito', admin })
    })
    .catch((error) => res.status(500).json({ message: error.message }));
});

//get all admin
router.get("/", (req, res) => {
  const admin = adminSchema;
  admin
    .find()
    .then((data) => {
      console.log(data)
      res.json(data)
    })
    .catch((error) => res.json({ message: error }));
});

// put admin by id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, password, setAccess } = req.body;
  adminSchema
    .updateOne({ _id: id }, { $set: { name, password, setAccess } })
    .then((data) => {
      res.json({ message: "Admin Actualizado", data })
    })
    .catch((error) => res.json({ message: error }));
});

// delete admin by id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  adminSchema
    .deleteOne({ _id: id })
    .then((data) => {
      res.status(200).json({ message: `Admin con id: ${id} Eliminado!`, data })
    })
    .catch((error) => res.json({ message: error }));
});

module.exports = router;
