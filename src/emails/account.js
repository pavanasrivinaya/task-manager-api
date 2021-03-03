// Loading mail package
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


// When ever the user creates an account the user get the email 
const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'paripalepu@gmail.com',
        subject: 'Thanks for joining in!', // When u use any var the use this quotes `` as below.
        text: `Welcome to the app, ${ name }. Let me know how you get along with the app.`
    })
}
// send email to user on canelation
const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'paripalepu@gmail.com',
        subject: 'Sorry to see you go', // When u use any var the use this quotes `` as below.
        text: `Goodbye, ${ name }. I hope to see you back sometime soon.`
    })
}
module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}

// sgMail.send({
//     to: 'paripalepu@gmail.com',
//     from: 'paripalepu@gmail.com',
//     subject: 'This is first creation!',
//     text: 'I hope this one actually get to you'
// })