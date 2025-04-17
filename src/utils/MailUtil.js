//to,from,subject,text
const mailer = require('nodemailer');

///function

const sendingMail = async(to,subject,text) => {

    const transporter = mailer.createTransport({
        service: 'gmail',
        auth:{
            user:"211260116040setiit@gmail.com",
            pass:"srep vvzw nbax qegn"
        }
    })

    const mailOptions = {
        from: '211260116040setiit@gmail.com',
        to: to,
        subject: subject,
        //text: text
        html:text
    }

    const mailresponse = await transporter.sendMail(mailOptions);
    console.log(mailresponse);
    return mailresponse;

}

module.exports ={
    sendingMail
}
//sendingMail("samir.vithlani83955@gmail.com","Test Mail","this is test mail")