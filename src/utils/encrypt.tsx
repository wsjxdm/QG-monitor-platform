import CryptoJS from 'crypto-js';
import forge from 'node-forge';

// AES 加密函数
export const encryptWithAES = (data: string, key: string): string => {
    try {
        const encrypted = CryptoJS.AES.encrypt(data, key).toString();
        return encrypted;
    } catch (error) {
        console.error('AES 加密失败:', error);
        throw error;
    }
};

// AES 解密函数
export const decryptWithAES = (ciphertext: string, key: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted;
    } catch (error) {
        console.error('AES 解密失败:', error);
        throw error;
    }
};

// 生成随机 AES 密钥
export const generateAESKey = (length: number = 32): string => {
    // 生成指定长度的随机字符串作为 AES 密钥
    return CryptoJS.lib.WordArray.random(length).toString();
};

// RSA 加密函数
export const encryptWithRSA = (data: string, publicKeyPem: string): string => {
    try {
        // 将 PEM 格式的公钥转换为 forge 公钥对象
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

        // 使用 RSA 公钥加密数据
        const encrypted = publicKey.encrypt(data, 'RSA-OAEP');

        // 将加密后的二进制数据转换为 base64 格式
        return forge.util.encode64(encrypted);
    } catch (error) {
        console.error('RSA 加密失败:', error);
        throw error;
    }
};

// RSA 解密函数
export const decryptWithRSA = (encryptedData: string, privateKeyPem: string): string => {
    try {
        // 将 PEM 格式的私钥转换为 forge 私钥对象
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

        // 将 base64 格式的加密数据转换为二进制数据
        const encryptedBytes = forge.util.decode64(encryptedData);

        // 使用 RSA 私钥解密数据
        const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP');

        return decrypted;
    } catch (error) {
        console.error('RSA 解密失败:', error);
        throw error;
    }
};

// 生成 RSA 密钥对
export const generateRSAKeyPair = (): { publicKey: string; privateKey: string } => {
    try {
        // 生成 RSA 密钥对
        const keyPair = forge.pki.rsa.generateKeyPair(2048);

        // 将公钥和私钥转换为 PEM 格式
        const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);
        const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);

        return {
            publicKey: publicKeyPem,
            privateKey: privateKeyPem
        };
    } catch (error) {
        console.error('RSA 密钥对生成失败:', error);
        throw error;
    }
};

// 结合 AES 和 RSA 的加密函数
// 1. 生成随机 AES 密钥
// 2. 使用 AES 密钥加密数据
// 3. 使用 RSA 公钥加密 AES 密钥
// 4. 返回加密后的数据和加密后的密钥
export const encryptWithAESAndRSA = (
    data: string,
    rsaPublicKey: string
): { encryptedData: string; encryptedKey: string } => {
    try {
        // 生成随机 AES 密钥
        const aesKey = generateAESKey();

        // 使用 AES 密钥加密数据
        const encryptedData = encryptWithAES(data, aesKey);

        // 使用 RSA 公钥加密 AES 密钥
        const encryptedKey = encryptWithRSA(aesKey, rsaPublicKey);

        return {
            encryptedData,
            encryptedKey
        };
    } catch (error) {
        console.error('AES+RSA 加密失败:', error);
        throw error;
    }
};

// 结合 AES 和 RSA 的解密函数
// 1. 使用 RSA 私钥解密 AES 密钥
// 2. 使用解密后的 AES 密钥解密数据
export const decryptWithAESAndRSA = (
    encryptedData: string,
    encryptedKey: string,
    rsaPrivateKey: string
): string => {
    try {
        // 使用 RSA 私钥解密 AES 密钥
        const aesKey = decryptWithRSA(encryptedKey, rsaPrivateKey);

        // 使用解密后的 AES 密钥解密数据
        const decryptedData = decryptWithAES(encryptedData, aesKey);

        return decryptedData;
    } catch (error) {
        console.error('AES+RSA 解密失败:', error);
        throw error;
    }
};

// Base64 编码函数
export const base64Encode = (data: string): string => {
    try {
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data));
    } catch (error) {
        console.error('Base64 编码失败:', error);
        throw error;
    }
};

// Base64 解码函数
export const base64Decode = (data: string): string => {
    try {
        return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Base64 解码失败:', error);
        throw error;
    }
};