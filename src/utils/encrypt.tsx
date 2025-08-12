import CryptoJS from "crypto-js";
import forge from "node-forge";



// AES 解密函数
export const decryptWithAES = (ciphertext: string, key: string): string => {
  try {
    // 1. Base64解码获取完整数据
    const encryptedBytes = CryptoJS.enc.Base64.parse(ciphertext);

    // 2. 提取IV（前16字节）
    const iv = CryptoJS.lib.WordArray.create(
      encryptedBytes.words.slice(0, 4), // 16 bytes = 4 words
      16
    );

    // 3. 提取密文（剩余部分）
    const ciphertextBytes = CryptoJS.lib.WordArray.create(
      encryptedBytes.words.slice(4),
      encryptedBytes.sigBytes - 16
    );

    // 4. 将字符串密钥转为CryptoJS格式
    const keyBytes = CryptoJS.enc.Base64.parse(key);

    // 5. 解密
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertextBytes } as CryptoJS.lib.CipherParams,
      keyBytes,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    console.log("Decrypted raw bytes:", decrypted.toString(CryptoJS.enc.Hex));
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("AES 解密失败:", error);
    throw error;
  }
};




// AES 加密函数 (与Java后端完全匹配)
export const encryptWithAES = (data: string, keyBase64: string): string => {
  // 将Base64密钥转换为CryptoJS格式
  const key = CryptoJS.enc.Base64.parse(keyBase64);

  // 生成随机IV (16 bytes)
  const iv = CryptoJS.lib.WordArray.random(16);

  // 加密配置：CBC模式，PKCS7填充 (PKCS7在Java中对应PKCS5)
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  // 将IV和密文合并(IV在前)
  const combined = iv.concat(encrypted.ciphertext);

  // 返回Base64编码的完整结果
  return combined.toString(CryptoJS.enc.Base64);
};

// 生成AES密钥 (256位/32字节)
export const generateAESKey = (): string => {
  // 生成32字节(256位)随机数据
  const keyBytes = new Uint8Array(32);
  crypto.getRandomValues(keyBytes);

  // 直接转换为Base64格式
  return forge.util.encode64(String.fromCharCode(...keyBytes));
};

// RSA 加密函数 (确保输出是原始二进制数据)
export const encryptWithRSA = (data: string, publicKeyPem: string): string => {
  try {
    // 移除PEM格式的标记和换行符
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    // 将Base64数据解码为二进制
    const binaryData = forge.util.decode64(data);

    // 使用OAEP with SHA-256 and MGF1 with SHA-256
    const encrypted = publicKey.encrypt(binaryData, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create()
      }
    });

    return forge.util.encode64(encrypted);
  } catch (error) {
    console.error("RSA 加密失败:", error);
    throw error;
  }
};

// 双重加密 (AES+RSA)
export const encryptWithAESAndRSA = (
  data: string,
  rsaPublicKey: string
): { encryptedData: string; encryptedKey: string } => {
  try {
    // 1. 生成AES密钥（32字节/256位）
    const aesKey = generateAESKey();
    console.log("原始AES密钥(Base64):", aesKey);
    console.log("密钥长度:", forge.util.decode64(aesKey).length); // 应该是32

    // 2. 用AES加密数据（CBC模式，PKCS7填充）
    const encryptedData = encryptWithAES(data, aesKey);
    console.log("AES加密后的数据:", encryptedData);

    // 3. 用RSA加密AES密钥（直接加密原始Base64字符串）
    const encryptedKey = encryptWithRSA(aesKey, rsaPublicKey);
    console.log("RSA加密后的密钥:", encryptedKey);

    return {
      encryptedData,
      encryptedKey
    };
  } catch (error) {
    console.error("AES+RSA 加密失败:", error);
    throw error;
  }
};






// RSA 解密函数 用一开始给的私钥来解密密码
export const decryptWithRSA = (
  encryptedData: string,
  privateKeyPem: string
): string => {
  try {
    // console.log("", privateKeyPem);
    // console.log("", encryptedData);

    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const encryptedBytes = forge.util.decode64(encryptedData);

    // 显式指定与后端一致的 OAEP 参数
    const decrypted = privateKey.decrypt(encryptedBytes, "RSA-OAEP", {
      md: forge.md.sha256.create(), // SHA-256 哈希
      mgf1: {
        md: forge.md.sha256.create(), // MGF1 使用 SHA-256
      },
    });
    console.log("decrypted:", decrypted);

    return decrypted;
  } catch (error) {
    console.error("RSA 解密失败:", error);
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
    console.error("AES+RSA 解密失败:", error);
    throw error;
  }
};
