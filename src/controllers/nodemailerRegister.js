const transporter = require("../nodemailer/mailer")
const nodemailer = require("nodemailer")

const postMailerRegister = async function(newUser){
   const sendEmailRegister = newUser
    const email = await transporter.sendMail({
        from: "infocxps@gmail.com",
        to:newUser.email,
        subject:"Registro en CellXpress",
        html:`
        <b>Gracias por confiar en nosotros ,te has registrado exitosamente!:</b>
        `
        
    })
    return email
}


module.exports = postMailerRegister
