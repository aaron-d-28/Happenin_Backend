import nodemailer from 'nodemailer';
// import { PASS,Sender } from './pass.js'; // Ensure this file exports the correct password
import { toQr } from './qrcodegen.js';
import {htmlContent} from "./Email_html.js";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port:465,
    secure:true,
        auth: {
        user:process.env.EMAILSENDER , // Replace with your Gmail address
        pass: process.env.EMAILPASS, // Replace with your Gmail app password
    },
});

export const sendEmail = async (toUserEmail, eventname, eventdate, username) => {
    const userstring=toUserEmail+eventname+eventdate+toUserEmail;
    const {qrtag,encryptedsecret} = await toQr(userstring);

    const htmlstuff=htmlContent(username,eventname,eventdate)

    const options = {
        from: process.env.EMAILSENDER, // Your email
        to: toUserEmail, // Recipient's email
        subject: `Your Event QR Code – Confirmation for ${eventname}`,
        text: `Dear ${username},\n\nThank you for registering for ${eventname} on ${eventdate}.\n\nYour QR code is attached to this email.\n\nBest regards,\nEvent Team`,
        html:htmlstuff,
        attachments: [
            {
                filename: 'Qrcode.jpg',
                path: qrtag,
                contentType: 'image/webp',
                cid: 'qrimage' // Embedded image reference
            }
        ]
    };

    await transporter.sendMail(options, function (error, info) {
        if (error) {
            console.log('Error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
    return encryptedsecret
};
