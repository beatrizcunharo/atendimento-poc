import {initializeApp} from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyAveP7YCM1mhi48F5IzLgTiu6I0DVBOfkA",
    authDomain: "atendimento-poc.firebaseapp.com",
    projectId: "atendimento-poc",
    storageBucket: "atendimento-poc.appspot.com",
    messagingSenderId: "337740808872",
    appId: "1:337740808872:web:ec785257653679395c789d",
    measurementId: "G-ZD3X6KQ8YZ"
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