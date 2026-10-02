// ==================================================
// HTML ELEMENTS
// ==================================================

const symmetricButton = document.getElementById("symmetricButton");
const asymmetricButton = document.getElementById("asymmetricButton");
const hybridButton = document.getElementById("hybridButton");
const hashingButton = document.getElementById("hashingButton");

const encryptionArea = document.getElementById("encryptionArea");
const hashingArea = document.getElementById("hashingArea");

const sendButton = document.getElementById("sendButton");
const messageInput = document.getElementById("message");

const networkData = document.getElementById("networkData");
const networkExtra = document.getElementById("networkExtra");
const receivedMessage = document.getElementById("receivedMessage");

const aliceKey = document.getElementById("aliceKey");
const bobKey = document.getElementById("bobKey");

const modeTitle = document.getElementById("modeTitle");
const modeDescription = document.getElementById("modeDescription");

const process = document.getElementById("process");
const status = document.getElementById("status");


// PASSWORD ELEMENTS

const passwordInput = document.getElementById("passwordInput");
const hashButton = document.getElementById("hashButton");

const originalPassword = document.getElementById("originalPassword");
const saltOutput = document.getElementById("saltOutput");
const hashOutput = document.getElementById("hashOutput");

const storedSalt = document.getElementById("storedSalt");
const storedHash = document.getElementById("storedHash");

const verifyPasswordInput =
    document.getElementById("verifyPasswordInput");

const verifyButton =
    document.getElementById("verifyButton");

const verificationResult =
    document.getElementById("verificationResult");


// ==================================================
// VARIABLES
// ==================================================

let currentMode = "symmetric";

let bobKeyPair = null;


// These simulate the values stored in a database.
let savedSalt = null;
let savedHash = null;


// PBKDF2 settings
const PBKDF2_ITERATIONS = 100000;


// ==================================================
// HELPER FUNCTIONS
// ==================================================

function arrayBufferToBase64(buffer) {

    const bytes = new Uint8Array(buffer);

    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);
}


function shorten(text) {

    if (text.length <= 100) {
        return text;
    }

    return text.substring(0, 100) + "...";
}


function buffersEqual(buffer1, buffer2) {

    const first = new Uint8Array(buffer1);
    const second = new Uint8Array(buffer2);

    if (first.length !== second.length) {
        return false;
    }

    for (let i = 0; i < first.length; i++) {

        if (first[i] !== second[i]) {
            return false;
        }

    }

    return true;
}


// ==================================================
// MODE BUTTONS
// ==================================================

symmetricButton.addEventListener("click", function () {

    currentMode = "symmetric";

    showEncryptionArea();
    setActiveButton(symmetricButton);

    modeTitle.textContent =
        "Symmetric Encryption – AES-GCM";

    modeDescription.textContent =
        "Alice and Bob use the same secret AES key to encrypt and decrypt the message.";

    resetEncryptionDisplay();
});


asymmetricButton.addEventListener("click", function () {

    currentMode = "asymmetric";

    showEncryptionArea();
    setActiveButton(asymmetricButton);

    modeTitle.textContent =
        "Asymmetric Encryption – RSA-OAEP";

    modeDescription.textContent =
        "Alice encrypts the message using Bob's public key. Bob decrypts it using his private key.";

    resetEncryptionDisplay();
});


hybridButton.addEventListener("click", function () {

    currentMode = "hybrid";

    showEncryptionArea();
    setActiveButton(hybridButton);

    modeTitle.textContent =
        "Hybrid Encryption – AES-GCM + RSA-OAEP";

    modeDescription.textContent =
        "AES encrypts the message while RSA protects the AES key.";

    resetEncryptionDisplay();
});


hashingButton.addEventListener("click", function () {

    currentMode = "hashing";

    setActiveButton(hashingButton);

    encryptionArea.classList.add("hidden");
    hashingArea.classList.remove("hidden");

    status.textContent =
        "Password hashing mode ready.";
});


function showEncryptionArea() {

    encryptionArea.classList.remove("hidden");
    hashingArea.classList.add("hidden");
}


function setActiveButton(activeButton) {

    symmetricButton.classList.remove("active");
    asymmetricButton.classList.remove("active");
    hybridButton.classList.remove("active");
    hashingButton.classList.remove("active");

    activeButton.classList.add("active");
}


function resetEncryptionDisplay() {

    networkData.textContent =
        "Nothing sent yet.";

    networkExtra.textContent = "";

    receivedMessage.textContent =
        "No message received yet.";

    aliceKey.textContent =
        "No key generated yet.";

    bobKey.textContent =
        "No key generated yet.";

    process.textContent =
        "Write a message and press Encrypt & Send.";

    status.textContent =
        "Ready.";
}


// ==================================================
// SEND MESSAGE
// ==================================================

sendButton.addEventListener("click", async function () {

    const message = messageInput.value.trim();

    if (message === "") {

        status.textContent =
            "Please write a message first.";

        return;
    }

    try {

        status.textContent =
            "Encrypting...";

        if (currentMode === "symmetric") {

            await symmetricEncryption(message);

        }

        else if (currentMode === "asymmetric") {

            await asymmetricEncryption(message);

        }

        else if (currentMode === "hybrid") {

            await hybridEncryption(message);

        }

    }

    catch (error) {

        console.error(error);

        status.textContent =
            "Encryption failed: " + error.message;
    }

});


// ==================================================
// SYMMETRIC ENCRYPTION
// AES-GCM
// ==================================================

async function symmetricEncryption(message) {

    const aesKey =
        await crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );


    const iv =
        crypto.getRandomValues(
            new Uint8Array(12)
        );


    const encodedMessage =
        new TextEncoder().encode(message);


    const encryptedData =
        await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            aesKey,
            encodedMessage
        );


    const exportedKey =
        await crypto.subtle.exportKey(
            "raw",
            aesKey
        );


    const keyText =
        arrayBufferToBase64(exportedKey);

    const cipherText =
        arrayBufferToBase64(encryptedData);


    networkData.textContent =
        cipherText;


    networkExtra.innerHTML =
        "<strong>IV:</strong><br>" +
        arrayBufferToBase64(iv);


    aliceKey.textContent =
        "Shared AES key: " + keyText;

    bobKey.textContent =
        "Shared AES key: " + keyText;


    const decryptedData =
        await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            aesKey,
            encryptedData
        );


    const decryptedMessage =
        new TextDecoder().decode(decryptedData);


    receivedMessage.textContent =
        decryptedMessage;


    process.innerHTML =
        "1. A random AES key is generated.<br>" +
        "2. Alice and Bob have the same secret key.<br>" +
        "3. A random IV is generated.<br>" +
        "4. Alice encrypts the plaintext using AES-GCM.<br>" +
        "5. Ciphertext travels across the simulated network.<br>" +
        "6. Bob uses the same AES key to decrypt the ciphertext.";


    status.textContent =
        "AES encryption completed successfully.";
}


// ==================================================
// RSA KEY GENERATION
// ==================================================

async function generateRSAKeys() {

    bobKeyPair =
        await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",

                modulusLength: 2048,

                publicExponent:
                    new Uint8Array([1, 0, 1]),

                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );

}


// ==================================================
// ASYMMETRIC ENCRYPTION
// RSA-OAEP
// ==================================================

async function asymmetricEncryption(message) {

    await generateRSAKeys();


    const encodedMessage =
        new TextEncoder().encode(message);


    const encryptedData =
        await crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            bobKeyPair.publicKey,
            encodedMessage
        );


    const publicKey =
        await crypto.subtle.exportKey(
            "spki",
            bobKeyPair.publicKey
        );


    const privateKey =
        await crypto.subtle.exportKey(
            "pkcs8",
            bobKeyPair.privateKey
        );


    const publicKeyText =
        arrayBufferToBase64(publicKey);

    const privateKeyText =
        arrayBufferToBase64(privateKey);


    aliceKey.textContent =
        "Bob's PUBLIC key: " +
        shorten(publicKeyText);


    bobKey.textContent =
        "Bob's PRIVATE key: " +
        shorten(privateKeyText);


    networkData.textContent =
        arrayBufferToBase64(encryptedData);


    const decryptedData =
        await crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            bobKeyPair.privateKey,
            encryptedData
        );


    const decryptedMessage =
        new TextDecoder().decode(decryptedData);


    receivedMessage.textContent =
        decryptedMessage;


    process.innerHTML =
        "1. Bob generates a public and private RSA key.<br>" +
        "2. Bob shares his public key with Alice.<br>" +
        "3. Alice encrypts the message using Bob's public key.<br>" +
        "4. Ciphertext travels across the simulated network.<br>" +
        "5. Bob uses his private key to decrypt the message.";


    status.textContent =
        "RSA encryption completed successfully.";
}


// ==================================================
// HYBRID ENCRYPTION
// AES + RSA
// ==================================================

async function hybridEncryption(message) {

    await generateRSAKeys();


    const aesKey =
        await crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );


    const iv =
        crypto.getRandomValues(
            new Uint8Array(12)
        );


    const encodedMessage =
        new TextEncoder().encode(message);


    const encryptedMessage =
        await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            aesKey,
            encodedMessage
        );


    const rawAESKey =
        await crypto.subtle.exportKey(
            "raw",
            aesKey
        );


    const encryptedAESKey =
        await crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            bobKeyPair.publicKey,
            rawAESKey
        );


    networkData.textContent =
        arrayBufferToBase64(encryptedMessage);


    networkExtra.innerHTML =
        "<strong>Encrypted AES key:</strong><br>" +
        arrayBufferToBase64(encryptedAESKey) +
        "<br><br><strong>IV:</strong><br>" +
        arrayBufferToBase64(iv);


    aliceKey.textContent =
        "Alice generated a temporary AES key.";


    bobKey.textContent =
        "Bob keeps his RSA private key secret.";


    const decryptedAESKey =
        await crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            bobKeyPair.privateKey,
            encryptedAESKey
        );


    const importedAESKey =
        await crypto.subtle.importKey(
            "raw",
            decryptedAESKey,
            {
                name: "AES-GCM"
            },
            false,
            ["decrypt"]
        );


    const decryptedMessageData =
        await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            importedAESKey,
            encryptedMessage
        );


    const decryptedMessage =
        new TextDecoder().decode(
            decryptedMessageData
        );


    receivedMessage.textContent =
        decryptedMessage;


    process.innerHTML =
        "1. Bob generates an RSA public/private key pair.<br>" +
        "2. Alice receives Bob's public key.<br>" +
        "3. Alice generates a temporary AES key.<br>" +
        "4. AES-GCM encrypts the actual message.<br>" +
        "5. RSA encrypts the AES key using Bob's public key.<br>" +
        "6. The encrypted message and encrypted AES key travel across the network.<br>" +
        "7. Bob uses his private RSA key to recover the AES key.<br>" +
        "8. Bob uses the recovered AES key to decrypt the message.";


    status.textContent =
        "Hybrid encryption completed successfully.";
}


// ==================================================
// PASSWORD HASHING
// PBKDF2 + SHA-256
// ==================================================

hashButton.addEventListener("click", async function () {

    const password = passwordInput.value;

    if (password === "") {

        status.textContent =
            "Please enter a password first.";

        return;
    }


    try {

        status.textContent =
            "Processing password...";


        // Generate 16 random bytes for the salt.
        const salt =
            crypto.getRandomValues(
                new Uint8Array(16)
            );


        const hash =
            await derivePasswordHash(
                password,
                salt
            );


        // Save the salt and derived hash.
        // This simulates database storage.
        savedSalt = salt;
        savedHash = hash;


        originalPassword.textContent =
            password;


        saltOutput.textContent =
            arrayBufferToBase64(salt);


        hashOutput.textContent =
            arrayBufferToBase64(hash);


        storedSalt.textContent =
            arrayBufferToBase64(salt);


        storedHash.textContent =
            arrayBufferToBase64(hash);


        verificationResult.textContent =
            "Password has not been verified yet.";

        verificationResult.classList.remove(
            "success",
            "failure"
        );


        status.textContent =
            "Password processed successfully.";

    }

    catch (error) {

        console.error(error);

        status.textContent =
            "Password hashing failed: " +
            error.message;
    }

});


// ==================================================
// DERIVE PASSWORD HASH
// ==================================================

async function derivePasswordHash(password, salt) {

    // Convert password into bytes.
    const passwordBytes =
        new TextEncoder().encode(password);


    // Import password as key material.
    const keyMaterial =
        await crypto.subtle.importKey(
            "raw",
            passwordBytes,
            {
                name: "PBKDF2"
            },
            false,
            ["deriveBits"]
        );


    // PBKDF2 repeatedly processes the password
    // together with the salt.
    const derivedBits =
        await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",

                salt: salt,

                iterations: PBKDF2_ITERATIONS,

                hash: "SHA-256"
            },
            keyMaterial,
            256
        );


    return derivedBits;
}


// ==================================================
// VERIFY PASSWORD
// ==================================================

verifyButton.addEventListener("click", async function () {

    const password =
        verifyPasswordInput.value;


    if (savedSalt === null || savedHash === null) {

        verificationResult.textContent =
            "Create a password first.";

        verificationResult.classList.remove("success");
        verificationResult.classList.add("failure");

        return;
    }


    if (password === "") {

        verificationResult.textContent =
            "Enter a password to verify.";

        verificationResult.classList.remove("success");
        verificationResult.classList.add("failure");

        return;
    }


    try {

        // Use the SAME stored salt.
        const newHash =
            await derivePasswordHash(
                password,
                savedSalt
            );


        const match =
            buffersEqual(
                newHash,
                savedHash
            );


        if (match) {

            verificationResult.textContent =
                "✅ Password matches!";

            verificationResult.classList.remove("failure");
            verificationResult.classList.add("success");

            status.textContent =
                "Password verified successfully.";

        }

        else {

            verificationResult.textContent =
                "❌ Password does not match.";

            verificationResult.classList.remove("success");
            verificationResult.classList.add("failure");

            status.textContent =
                "Password verification failed.";

        }

    }

    catch (error) {

        console.error(error);

        status.textContent =
            "Verification failed: " +
            error.message;
    }

});