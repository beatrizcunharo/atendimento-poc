import {initializeApp} from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyAVsA9TdEXOSdeNo8lRe7720olMVP00hj0",
    authDomain: "atendimento-poc-cbc37.firebaseapp.com",
    projectId: "atendimento-poc-cbc37",
    storageBucket: "atendimento-poc-cbc37.appspot.com",
    messagingSenderId: "616141646689",
    appId: "1:616141646689:web:dd26ef91d231e07073f320",
    measurementId: "G-47KRFKK4ZP"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp); // Banco de dados
const storage = getStorage(firebaseApp);

export {
    auth,
    db,
    storage
}