"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = exports.auth = exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// Initialize Firebase Admin SDK
let serviceAccount;
if (process.env.FIREBASE_PROJECT_ID) {
    // Use environment variables
    serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };
}
else {
    // Try to use service account JSON file
    try {
        const serviceAccountPath = path_1.default.join(__dirname, '../../firebase-service-account.json');
        serviceAccount = require(serviceAccountPath);
    }
    catch (error) {
        console.error('❌ Firebase configuration error:');
        console.error('Please either:');
        console.error('1. Set up environment variables in .env file, or');
        console.error('2. Place firebase-service-account.json in the backend root directory');
        console.error('');
        console.error('For environment variables, you need:');
        console.error('- FIREBASE_PROJECT_ID');
        console.error('- FIREBASE_PRIVATE_KEY_ID');
        console.error('- FIREBASE_PRIVATE_KEY');
        console.error('- FIREBASE_CLIENT_EMAIL');
        console.error('- FIREBASE_CLIENT_ID');
        process.exit(1);
    }
}
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
    });
}
exports.db = firebase_admin_1.default.firestore();
exports.auth = firebase_admin_1.default.auth();
exports.bucket = firebase_admin_1.default.storage().bucket();
exports.default = firebase_admin_1.default;
//# sourceMappingURL=firebase.js.map