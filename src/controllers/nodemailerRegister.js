const transporter = require("../nodemailer/mailer")
const nodemailer = require("nodemailer")

const postMailerRegister = async function(newUser){
   const sendEmailRegister = newUser
    const email = await transporter.sendMail({
        from: "infocxps@gmail.com",
        to:newUser.email,
        subject:"Registro en CellXpress",
        html:`<Style>
        #logoimg{
            width: 150px;
            height: 150px;
            margin: 20px;
            left: 15px;
            position: absolute;
            display: flex;
            align-items: start;
            justify-content: start;
            border-radius: 100%;
        }
        </Style>
        <b>Gracias por confiar en nosotros ,te has registrado exitosamente!</b>
        <img id="logoimg" src="https://res.cloudinary.com/djqwbu0my/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1691088616/OIP_mzc6jr.jpg" alt="Bienvenido a CellXpress" />
           `
    })
    return email
}


module.exports = postMailerRegister
