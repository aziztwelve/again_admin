import CryptoJS from 'crypto-js';

export const encryptToken = (token) => {
    // Получаем ключи из переменных окружения
    const key = process.env.VUE_APP_ENCRYPTED_KEY;
    const iv = process.env.VUE_APP_ENCRYPTED_IV;

    // Шифруем токен
    const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(token),
        CryptoJS.enc.Utf8.parse(key),
        {
            iv: CryptoJS.enc.Utf8.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );

    // Возвращаем результат в Base64
    return encrypted.toString();
};