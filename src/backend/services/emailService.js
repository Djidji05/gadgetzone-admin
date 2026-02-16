/**
 * Service simulé pour l'envoi d'emails.
 * Pour la production, utiliser 'nodemailer' avec un vrai SMTP (Gmail, SendGrid, etc).
 */

export const sendEmail = async (to, subject, htmlContent) => {
    console.log(`\n📧 [EMAIL SIMULATION] Sending to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Content Preview: ${htmlContent.substring(0, 50)}...`);

    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`✅ [EMAIL SIMULATION] Sent successfully.\n`);
    return true;
};
