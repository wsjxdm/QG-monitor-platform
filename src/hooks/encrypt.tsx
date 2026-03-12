import { encryptWithAESAndRSA, decryptWithAESAndRSA } from "../utils/encrypt";
import keys from "../key/keys.json";

export const useEncryption = () => {
    const encryptData = async (data: any) => {
        return encryptWithAESAndRSA(JSON.stringify(data), keys.publicKey);
    };

    const decryptData = (encryptedData: string, encryptedKey: string) => {
        return decryptWithAESAndRSA(encryptedData, encryptedKey, keys.privateKey);
    };

    return { encryptData, decryptData };
};