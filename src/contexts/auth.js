import {useState, createContext, useEffect} from 'react'
import { auth, db } from '../services/firebaseConnection';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'

export const AuthContext = createContext({});

function AuthProvider ({children}) {
    const [user, setUser] = useState(null)
    const [loadingAuth, setLoadingAuth] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();

    useEffect(() => {
        async function loadUser() {
            const storageUser = localStorage.getItem("@atendimento")
            if(storageUser) {
                setUser(JSON.parse(storageUser))
                setLoading(false)
            }

            setLoading(false)
        }

        loadUser();
    },[])
    
    async function signIn(email, password) {
        setLoadingAuth(true);

        await signInWithEmailAndPassword(auth, email, password).then(async (value) => {
            let uid = value.user.uid;
            const docRef = doc(db,"users", uid);
            const docSnap = await getDoc(docRef)
            
            let data = {
                uid: uid,
                nome: docSnap.data().nome,
                email: value.user.email,
                avatarUrl: docSnap.data().avatarUrl
            }

            setUser(data)
            storageUser(data)
            setLoadingAuth(false);
            toast.success("Logado com sucesso "+docSnap.data().nome+".");
            navigate("/dashboard")

        }).catch(error => {
            console.error("Erro ao cadastrar ", error);
            setLoadingAuth(false);
            toast.error("Ops, algo deu errado...");
        })

    }

    async function signUp(email, password, name) {
        setLoadingAuth(true);

        await createUserWithEmailAndPassword(auth, email, password).then(async (value) => {
            let uid = value.user.uid;

            await setDoc(doc(db, "users", uid), {
                nome: name,
                avatarUrl: null,
            }).then(() => {
                let data = {
                    uid: uid,
                    nome: name,
                    email: value.user.email,
                    avatarUrl: null
                }
                setUser(data)
                storageUser(data)
                setLoadingAuth(false);
                toast.success("Cadastrado com sucesso "+name+".");
                navigate("/dashboard")
            })
        }).catch(error => {
            console.error("Erro ao cadastrar ", error);
            setLoadingAuth(false);
            toast.error("Ops, algo deu errado...");
        })
    }

    function storageUser(data) {
        localStorage.setItem("@atendimento", JSON.stringify(data));
    }

    async function logout() {
        await signOut(auth);
        localStorage.removeItem("@atendimento");
        setUser(null)
    }

    return (
        // o value são os campos que os componentes vão poder utilizar
        <AuthContext.Provider value={{
            signed: !!user, // Converte a variável pra boolean (ali seria falso como o user inicial com null -> false. Quando tiver logado, esse valor será true)
            user,
            setUser,
            signIn,
            signUp,
            loadingAuth,
            setLoadingAuth,
            loading,
            setLoading,
            logout,
            storageUser
        }}> 
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;