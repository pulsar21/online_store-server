const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const sendMail = async (email, link=null) => {
    const mailOptions = {
        from: `${process.env.SEND_EMAIL}`,
        to: `${email}`,
        subject: 'Forgot Password',
        template: 'index',
        attachments: [{
            filename: 'logo.png',
            path: __dirname +'/assets/logo.png',
            cid: 'logo'
        }],
        context: {
            email: email,
            link: link
        }
    };
    const response = await wrappedSendMail(mailOptions);
    return response;
}

const wrappedSendMail = async (mailOptions) => {
    return new Promise((res, rej) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.SEND_EMAIL}`,
                pass: `${process.env.SEND_PASSWORD}` // naturally, replace both with your real credentials or an application-specific password
            }
        });
    
        transporter.use('compile', hbs({
            viewEngine : {
                extname: '.hbs', // handlebars extension
                layoutsDir: 'views/reset_password/', // location of handlebars templates
                defaultLayout: 'index', // name of main template
                partialsDir: 'views/reset_password/', // location of your subtemplates aka. header, footer etc
            },
            viewPath: 'views/reset_password/',
            extName: '.hbs'
        }));
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                rej(error);
            } else {
                res('Email sent: ' + info.response);
            }
        });
    })
};

module.exports = sendMail;