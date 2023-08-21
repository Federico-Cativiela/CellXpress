const user = require("../models/user")
const transporter = require("../nodemailer/mailer")
const nodemailer = require("nodemailer")

const postMailerOrder = async function(emailContent){
   const sendEmailOrder = emailContent
    const email = await transporter.sendMail({
        from: "infocxps@gmail.com",
        to:emailContent,
        subject:"Compra en CellXpress",
        html:`
        <b>Gracias por confiar en nosotros ,has realizado tu compra  exitosamente!:</b>
        `
        
    })
    return email
}


module.exports = postMailerOrder