// 移除顶部的静态导入！
// import CryptoJS from "crypto-js";
// import forge from "node-forge";

// AES 解密函数
export const decryptWithAES = async (ciphertext: string, key: string): Promise<string> => {
  // 动态导入 crypto-js
  const CryptoJS = await import("crypto-js");
  try {
    // ... 函数内部实现保持不变
    const encryptedBytes = CryptoJS.enc.Base64.parse(ciphertext);
    const iv = CryptoJS.lib.WordArray.create(encryptedBytes.words.slice(0, 4), 16);
    const ciphertextBytes = CryptoJS.lib.WordArray.create(encryptedBytes.words.slice(4), encryptedBytes.sigBytes - 16);
    const keyBytes = CryptoJS.enc.Base64.parse(key);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertextBytes } as any,
      keyBytes,
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    console.log("Decrypted raw bytes:", decrypted.toString(CryptoJS.enc.Hex));
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("AES 解密失败:", error);
    throw error;
  }
};

// AES 加密函数
export const encryptWithAES = async (data: string, keyBase64: string): Promise<string> => {
  // 动态导入 crypto-js
  const CryptoJS = await import("crypto-js");
  const key = CryptoJS.enc.Base64.parse(keyBase64);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  const combined = iv.concat(encrypted.ciphertext);
  return combined.toString(CryptoJS.enc.Base64);
};

// 生成AES密钥
export const generateAESKey = async (): Promise<string> => {
  // 动态导入 node-forge
  const forge = await import("node-forge");
  const keyBytes = new Uint8Array(32);
  crypto.getRandomValues(keyBytes);
  return forge.util.encode64(String.fromCharCode(...keyBytes));
};

// RSA 加密函数
export const encryptWithRSA = async (data: string, publicKeyPem: string): Promise<string> => {
  // 动态导入 node-forge
  const forge = await import("node-forge");
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const binaryData = forge.util.decode64(data);
    const encrypted = publicKey.encrypt(binaryData, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: { md: forge.md.sha256.create() }
    });
    return forge.util.encode64(encrypted);
  } catch (error) {
    console.error("RSA 加密失败:", error);
    throw error;
  }
};

// 双重加密 (AES+RSA)
export const encryptWithAESAndRSA = async (
  data: string,
  rsaPublicKey: string
): Promise<{ encryptedData: string; encryptedKey: string }> => {
  try {
    // 注意：这里会动态加载 generateAESKey 和 encryptWithAES 所需的库
    const aesKey = await generateAESKey();
    console.log("原始AES密钥(Base64):", aesKey);
    console.log("密钥长度:", (await import("node-forge")).util.decode64(aesKey).length);

    const encryptedData = await encryptWithAES(data, aesKey);
    console.log("AES加密后的数据:", encryptedData);

    const encryptedKey = await encryptWithRSA(aesKey, rsaPublicKey);
    console.log("RSA加密后的密钥:", encryptedKey);

    return { encryptedData, encryptedKey };
  } catch (error) {
    console.error("AES+RSA 加密失败:", error);
    throw error;
  }
};

// RSA 解密函数
export const decryptWithRSA = async (
  encryptedData: string,
  privateKeyPem: string
): Promise<string> => {
  // 动态导入 node-forge
  const forge = await import("node-forge");
  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const encryptedBytes = forge.util.decode64(encryptedData);
    const decrypted = privateKey.decrypt(encryptedBytes, "RSA-OAEP", {
      md: forge.md.sha256.create(),
      mgf1: { md: forge.md.sha256.create() },
    });
    console.log("decrypted:", decrypted);
    return decrypted;
  } catch (error) {
    console.error("RSA 解密失败:", error);
    throw error;
  }
};

// 结合 AES 和 RSA 的解密函数
export const decryptWithAESAndRSA = async (
  encryptedData: string,
  encryptedKey: string,
  rsaPrivateKey: string
): Promise<string> => {
  try {
    const aesKey = await decryptWithRSA(encryptedKey, rsaPrivateKey);
    const decryptedData = await decryptWithAES(encryptedData, aesKey);
    return decryptedData;
  } catch (error) {
    console.error("AES+RSA 解密失败:", error);
    throw error;
  }
};