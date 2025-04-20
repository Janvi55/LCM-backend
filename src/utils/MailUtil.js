const mailer = require("nodemailer");

const sendingMail = async(to,subject,text) =>{

    const transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
            user:"legalconsultationteam5@gmail.com",
            pass:"lfdr ciza mcwv qftq"
        }
    })

    const mailOptions = {
        from: 'legalconsultationteam5@gmail.com',
        to: to,
        subject: subject,
        text: text
    }

    const mailresponse = await transporter.sendMail(mailOptions);
    console.log(mailresponse);
    return mailresponse;
}

const forgotSendingMail = async(to,subject,text) =>{

    const transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
            user:"legalconsultationteam5@gmail.com",
            pass:"lfdr ciza mcwv qftq"
        }
    })

    const mailOptions = {
        from: 'legalconsultationteam5@gmail.com',
        to: to,
        subject: subject,
        html:text
    }

    const mailResponse = await transporter.sendMail(mailOptions);
    console.log(mailResponse);
    return mailResponse;
}



module.exports = {
    sendingMail,forgotSendingMail,
}



























// //to,from,subject,text
// const mailer = require('nodemailer');

// ///function

// const sendingMail = async(to,subject,text) => {

//     const transporter = mailer.createTransport({
//         service: 'gmail',
//         auth:{
//             user:"211260116040setiit@gmail.com",
//             pass:"srep vvzw nbax qegn"
//         }
//     })

//     const mailOptions = {
//         from: '211260116040setiit@gmail.com',
//         to: to,
//         subject: subject,
//         //text: text
//         html:text
//     }

//     const mailresponse = await transporter.sendMail(mailOptions);
//     console.log(mailresponse);
//     return mailresponse;

// }

// module.exports ={
//     sendingMail
// }
// //sendingMail("samir.vithlani83955@gmail.com","Test Mail","this is test mail")