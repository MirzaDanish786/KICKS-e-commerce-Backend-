import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

export const sendEmail = async (to, subject, templateName, variables = {}) => {
  // 1. Load the template file
  const templatePath = path.resolve("templates", `${templateName}.html`);
  const source = fs.readFileSync(templatePath, "utf8");

  // 2. Compile template with Handlebars
  const compiledTemplate = handlebars.compile(source);
  const html = compiledTemplate(variables); // inject variables like {{confirmUrl}}

  // 3. Setup transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 4. Send mail
  await transporter.sendMail({
    from: `KICKS <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
