const express = require("express");
const sendEmail = require('../controllers/nodemailer');
const sendEmailOrder = require("../controllers/nodemailerOrder");
const sendEmailRegister= require("../controllers/nodemailerRegister");

const router = express.Router();

router.post("/contacto", sendEmail);
// router.post("/orden-de-compra", sendEmailOrder)
router.post("/register", sendEmailRegister)

module.exports = router;