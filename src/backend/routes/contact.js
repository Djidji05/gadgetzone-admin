import express from 'express';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { sequelize } from '../models/index.js';

const router = express.Router();

// Rate limiting to prevent spam
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // start blocking after 5 requests
    message: { message: "Trop de requêtes depuis cette adresse IP, veuillez réessayer dans une heure." }
});

router.post('/', contactLimiter, [
    body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
    body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('subject').trim().notEmpty().withMessage('Le sujet est requis'),
    body('message').trim().notEmpty().withMessage('Le message est requis').isLength({ min: 10 }).withMessage('Le message doit contenir au moins 10 caractères')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, subject, message } = req.body;

    try {
        // 1. Create a support ticket in the database
        const [ticketResult] = await sequelize.query(`
            INSERT INTO tickets (
                user_id, 
                customer_name,
                customer_email,
                customer_phone,
                subject, 
                status, 
                priority, 
                created_at, 
                updated_at,
                description
            ) VALUES (
                NULL, 
                $1, 
                $2, 
                $3,
                $4, 
                'open', 
                'normal', 
                NOW(), 
                NOW(),
                $5
            ) RETURNING id
        `, {
            bind: [
                `${firstName} ${lastName}`,
                email,
                phone || null,
                `Contact: ${subject}`,
                `Message de ${firstName} ${lastName} (${email}${phone ? ', ' + phone : ''}):\n\n${message}`
            ]
        });

        const ticketId = ticketResult[0].id;

        // 2. Configure and send Email
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: process.env.SMTP_PORT || 587,
            auth: {
                user: process.env.EMAIL_USER || process.env.SMTP_USER,
                pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"HTFasil Contact" <${process.env.EMAIL_USER || 'contact@htfasil.ht'}>`,
            to: process.env.CONTACT_EMAIL || "contact@htfasil.ht",
            subject: `[Ticket #${ticketId}] Nouveau Message: ${subject}`,
            text: `Vous avez reçu un nouveau message (Ticket #${ticketId}).\n\nNom: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`,
            replyTo: email,
            html: `
                <h3>Nouveau message de contact - HTFasil (Ticket #${ticketId})</h3>
                <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Téléphone:</strong> ${phone || 'Non renseigné'}</p>
                <p><strong>Sujet:</strong> ${subject}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/\n/g,'<br>')}</p>
            `
        };

        try {
            if (process.env.SMTP_HOST || process.env.EMAIL_HOST) {
                await transporter.sendMail(mailOptions);
            } else {
                console.log("Mock sending email:", mailOptions.subject);
            }
        } catch (mailError) {
            console.warn("Mail sending failed:", mailError.message);
        }

        res.status(200).json({
            message: 'Votre message a été envoyé avec succès.',
            ticketId: ticketId
        });

    } catch (error) {
        console.error('Contact endpoint error:', error);
        res.status(500).json({ message: 'Une erreur est survenue lors de l\'envoi du message.' });
    }
});

export default router;
