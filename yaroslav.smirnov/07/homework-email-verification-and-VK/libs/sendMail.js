'use strict';

const juice = require('juice');
const config = require('config');
const fs = require('fs');
const path = require('path');
const AWS = require('aws');
const pug = require('pug');
const Letter = require('../models/letter');

const nodemailer = require('nodemailer');
const htmlToText = require('nodemailer-html-to-text').htmlToText;
const stubTransport = require('nodemailer-stub-transport');
const SesTransport = require('nodemailer-ses-transport');
const mailgunTransport = require('nodemailer-mailgun-transport');

// configure gmail: https://nodemailer.com/using-gmail/
// allow less secure apps
const SMTPTransport = require('nodemailer-smtp-transport');

let transportEngine;

if (process.env.NODE_ENV == 'test' || process.env.MAILER_DISABLED) {
  transportEngine = stubTransport();
} else if (config.mailer.transport == 'aws') {
  transportEngine = new SesTransport({ ses: new AWS.SES(), rateLimit: 50 });
} else if (config.mailer.transport == 'gmail') {
  transportEngine = new SMTPTransport({
    service: "Gmail",
    debug: true,
    auth: {
      user: config.mailer.gmail.user,
      pass: config.mailer.gmail.password
    }
  });
} else if (config.mailer.transport == 'mailgun') {
  transportEngine = mailgunTransport({
    // apiKey: config.mailer.mailgun.api_key,
    // domain: config.mailer.mailgun.domain
    auth: {
      api_key: config.mailer.mailgun.api_key,
      domain: config.mailer.mailgun.domain
    }
  });
}

// console.log('transport engine \n', transportEngine);

const transport = nodemailer.createTransport(transportEngine);

transport.use('compile', htmlToText());

module.exports = async function(options) {

  let message = {};

  let sender = config.mailer.senders[options.from || 'default'];
  if (!sender) {
    throw new Error("Unknown sender:" + options.from);
  }

  message.from = {
    name: sender.fromName,
    address: sender.fromEmail
  };

  // for template
  let locals = Object.create(options);

  locals.config = config;
  locals.sender = sender;

  message.html = pug.renderFile(path.join(config.template.root, 'email', options.template) + '.pug', locals);
  message.html = juice(message.html);


  message.to = (typeof options.to == 'string') ? {address: options.to} : options.to;

  if (process.env.MAILER_REDIRECT) { // for debugging
    message.to = {address: sender.fromEmail};
  }

  if (!message.to.address) {
    throw new Error("No email for recepient, message options:" + JSON.stringify(options));
  }

  message.subject = options.subject;

  message.headers = options.headers;

  console.log('message:\n', message);

  let transportResponse = await transport.sendMail(message);

  let letter = await Letter.create({
    message,
    transportResponse,
    messageId: transportResponse.messageId // .replace(/@email.amazonses.com$/, '')
  });

  return letter;
}
