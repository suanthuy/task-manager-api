const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "suanthuy12@gmail.com",
        subject: "Welcome to Task Manager App",
        text: `Welcome to the App, ${name}.`,
    });
};

const sendDeleteEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "suanthuy12@gmail.com",
        subject: "Your account has been deleted",
        text: `Thank you for using Task Manager App, ${name}.`,
    });
};

module.exports = { sendWelcomeEmail, sendDeleteEmail };
