const transporter = require("../nodemailer/mailer")
const nodemailer = require("nodemailer")

const postMailerRegister = async function(newUser){
   const sendEmailRegister = newUser
    const email = await transporter.sendMail({
        from: "infocxps@gmail.com",
        to:newUser.email,
        subject:"Registro en CellXpress",
        html:`
        <b>Gracias por confiar en nosotros ,te has registrado exitosamente!</b>
        <img src="https://res.cloudinary.com/djqwbu0my/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1691088616/OIP_mzc6jr.jpg" alt="Bienvenido a CellXpress" />
        `
    })
    return email
}


module.exports = postMailerRegister
