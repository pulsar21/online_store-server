const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const sendFollowNotification = async (email) => {
    const mailOptions = {
        from: `${process.env.SEND_EMAIL}`,
        to: `${email}`,
        subject: `Follow Notification ${email}`,
        template: 'index',
        attachments: [{
            filename: 'logo.png',
            path: __dirname +'/assets/logo.png',
            cid: 'logo' //my mistake was putting "cid:logo@cid" here! 
        }],
        context: {
            email: email
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
                layoutsDir: 'views/follow_notification/', // location of handlebars templates
                defaultLayout: 'index', // name of main template
                partialsDir: 'views/follow_notification/', // location of your subtemplates aka. header, footer etc
            },
            viewPath: 'views/follow_notification/',
            extName: '.hbs'
        }));
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                rej(error);
            } else {
                res('Email sent: ' + info.response);
            }
        });
    });
};

module.exports = sendFollowNotification;