const express = require("express")
const product = require("../models/product")

const router = express.Router()

// Ruta para obtener todos los productos
router.get("/", (req, res) => {
    product
      .find()
      .then((data) => res.json(data))
      .catch((error) => res.json({ message: error }));
  });
  
  // Ruta para buscar productos por nombre
  router.get("/search", (req, res) => {
    const keyword = req.query.keyword;
  
    product
      .find({ $text: { $search: keyword } })
      .then((filteredProducts) => res.json({ products: filteredProducts }))
      .catch((error) => res.status(400).json({ error: "Error al obtener los productos" }));
  });
  
  
  
  // Ruta para obtener productos por atributos y marca
  router.get("/filter", (req, res) => {
    const brand = req.query.brand; // Nuevo: agregar filtro por marca
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const ram = req.query.ram;
    const cameraInches = req.query.cameraInches;
    const screenSize = req.query.screenSize;
    
    // Crear un objeto de consulta inicial vacío
    const query = {};
    
    if (brand) {
      query.brand = brand.toUpperCase();
  }
  
  if (minPrice && !isNaN(parseFloat(minPrice)) && maxPrice && !isNaN(parseFloat(maxPrice))) {
    query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
  } else if (minPrice && !isNaN(parseFloat(minPrice))) {
    query.price = { $gte: parseFloat(minPrice) };
  } else if (maxPrice && !isNaN(parseFloat(maxPrice))) {
    query.price = { $lte: parseFloat(maxPrice) };
  }
  
  if (ram) {
    query.ram = ram;
  }
  
  if (cameraInches) {
    query.cameraInches = cameraInches;
  }
  
  if (screenSize) {
    query.screenSize = screenSize;
  }

  product
    .find(query)
    .then((filteredProducts) => res.json({ products: filteredProducts }))
    .catch((error) => res.status(400).json({ error: "Error al obtener productos por atributos" }));
  });
  
  
  // Ruta para buscar por id
  router.get("/:id", (req, res) => {
    const productId = req.params.id;
  
    product
      .findById(productId)
      .then((product) => {
        if (!product) {
          return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json({ product });
      })
      .catch((error) => res.status(500).json({ error: `Error al obtener el producto con ID ${productId}` }));
  });

// Ruta para crear un nuevo producto
router.post("/", (req, res) => {
    const { title, price, description, brand, image, rating , screenSize, cameraInches,ram,isDeactivated,count} = req.body;

// // Validar que se proporcionen todos los campos requeridos
//     if (!title  !price !rating !description  !brand  !image !count) {
//       return res.status(400).json({ error: "Por favor, proporcione todos los campos requeridos" });
//     }
 // Crear un nuevo objeto de producto
 const newProduct = new product({
    title,
    price,
    description,
    brand,
    image,
    rating,
    screenSize,
    cameraInches,
    ram,
    isDeactivated,
    count
  });

  // Guardar el producto en la base de datos
  newProduct
    .save()
    .then((product) => {
      res.status(201).json({ message: "Producto creado exitosamente", product });
    })
    .catch((error) => res.status(400).json({ error: "Error al crear el producto" }));
});
// Ruta para editar un producto por su ID
router.put("/:id", (req, res) => {
  const productId = req.params.id;

  // Obtener los datos actualizados del producto desde el cuerpo de la solicitud
  const { title, price, description, brand, image, rating , screenSize, cameraInches,ram,isDeactivated,count } = req.body;

  // Construir el objeto con los campos actualizados
  const updatedProduct = {
    title,
    price,
    description,
    brand,
    image,
    rating,
    screenSize, 
    cameraInches,
    ram,
    isDeactivated,
    count,
  };
  // Actualizar el producto en la base de datos
  product
    .findByIdAndUpdate(productId, updatedProduct, { new: true })
    .then((updatedProduct) => {
      if (!updatedProduct) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.json({ message: "Producto actualizado exitosamente", product: updatedProduct });
    })
    .catch((error) => res.status(500).json({ error: `Error al actualizar el producto con ID ${productId}`}));
});

// Ruta para eliminar un producto por su ID
router.delete("/:id", (req, res) => {
  const productId = req.params.id;

  product
    .findByIdAndDelete(productId)
    .then((deletedProduct) => {
      if (!deletedProduct) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.json({ message: "Producto eliminado exitosamente" });
    })
    .catch((error) => res.status(500).json({ error: `Error aleliminar el producto con ID ${productId}`}));
});


module.exports = router;
