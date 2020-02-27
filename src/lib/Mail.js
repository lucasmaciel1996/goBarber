import nodemailer from 'nodemailer';
import mailCOnfig from '../config/mail';

class Mail {
  constructor() {
    const { host, port, secure, auth } = mailCOnfig;

    this.transporte = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth.user ? auth : null,
    });
  }

  sendEmail(message) {
    return this.transporte.sendMail({
      ...mailCOnfig.default,
      ...message,
    });
  }
}

export default new Mail();
