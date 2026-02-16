/**
 * Service simulé pour l'envoi de messages WhatsApp.
 * Pour la production, utiliser l'API Twilio ou un autre provider WhatsApp Business.
 */

export const sendWhatsApp = async (to, message) => {
    console.log(`\n📱 [WHATSAPP SIMULATION] Sending to: ${to}`);
    console.log(`   Message: ${message}`);

    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`✅ [WHATSAPP SIMULATION] Sent successfully.\n`);
    return true;
};
