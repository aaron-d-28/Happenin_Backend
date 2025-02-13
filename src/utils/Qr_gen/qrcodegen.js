import { toDataURL } from "qrcode";
import bcrypt from "bcrypt";

export const toQr = async (secret) => {
    try {
        // Encrypt the secret
        const encryptedsecret = await bcrypt.hash(secret, 10);
        console.log("Encrypted secret:", encryptedsecret);

        // Generate QR code from the encrypted secret
        const qrtag = await toDataURL(encryptedsecret);

        // Return the QR code and the encrypted secret
        return { qrtag, encryptedsecret };
    } catch (error) {
        // Log the error and rethrow it
        console.error("Error in toQr function:", error);
        throw new Error("Failed to generate QR code or encrypt secret");
    }
};
