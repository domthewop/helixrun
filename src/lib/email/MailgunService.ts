const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
import { EmailService } from './EmailService';

export class MailgunService implements EmailService {
    private mailgun: typeof mailgun;

    constructor() {
        this.mailgun = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

    }

    async sendEmail(to, subject, text, html): Promise<void> {
        return new Promise((resolve, reject) => {
            this.mailgun.messages.create('mail.connectionfox.com', {
                from: process.env.MAILGUN_SENDER_NAME + '<' + process.env.MAILGUN_SENDER_EMAIL + '>',
                to: to,
                subject: subject,
                text: text,
                html: html
            }).then((msg) => {
                console.log(msg);
                resolve(msg);
            })
              .catch(error => reject(error));
        });
    }
}
