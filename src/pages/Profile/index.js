import { useContext, useState } from "react";
import { toast } from "react-toastify";
import Title from "../../components/Title";
import { FiSettings, FiUpload } from "react-icons/fi";
import avatar from '../../assets/avatar.png'
import { AuthContext } from '../../contexts/auth'
import Header from "../../components/Header"
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../services/firebaseConnection";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import './profile.css'

export default function Profile () {
    const { user, storageUser, setUser, logout } = useContext(AuthContext);
    const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl)
    const [imageAvatar, setImageAvatar] = useState(null)
    const [nome, setNome] = useState(user && user.nome)
    const [email, setEmail] = useState(user && user.email)
    const [loading, setLoading] = useState(false)

    async function handleUpload() {
        const currentUid = user.uid;
        const uploadRef = ref(storage, `images/${currentUid}/${imageAvatar.name}`) // O segundo parâmetro é o local onde ficará a imagem
    
        await uploadBytes(uploadRef, imageAvatar).then(snapshot => {
            getDownloadURL(snapshot.ref).then(async (downloadUrl) => {// Informando ao firebase que agora tem uma foto
                const docRef = doc(db, "users", currentUid)
                await updateDoc(docRef, {
                    avatarUrl: downloadUrl,
                    nome: nome
                }).then(()=> {
                    let data = {
                        ...user,
                        nome: nome,
                        avatarUrl: downloadUrl
                    }
    
                    setUser(data);
                    storageUser(data);
                    toast.success("Dados atualizados com sucesso.");
                    setLoading(false)
                }).catch(error => {
                    toast.error("Ops, algo deu errado...");
                    console.error("Erro ao atualizar os dados ", error)
                    setLoading(false)
                })
            }) 
        })
    }

    async function handleSubmit(e) {
        e.preventDefault(); // Não ficar atualizado a página - comportamento padrão
        setLoading(true)
        if(imageAvatar === null && nome !== "") {
            const docRef = doc(db, "users", user.uid)
            await updateDoc(docRef, {
                nome: nome
            }).then(() => {
                let data = {
                    ...user,
                    nome: nome
                }

                setUser(data);
                storageUser(data)
                toast.success("Nome atualizado com sucesso.");
                setLoading(false)
            }).catch(error => {
                toast.error("Ops, algo deu errado...");
                console.error("Erro ao atualizar o nome ", error)
                setLoading(false)
            })
        } else if(imageAvatar !== null && nome !== "") {
            handleUpload()
        }     

    }
    
    function handleFile(e) {
        if(e.target.files[0]) {
            const image = e.target.files[0] // Estão os arquivos da imagem que colocamos para abrir no input que abre o explorador de arquivos
            if(image.type === "image/jpeg" || image.type === "image/png" ) { // Aceita tipo jpeg e png
                setImageAvatar(image)
                setAvatarUrl(URL.createObjectURL(image))
            } else {
                toast.error("Envie uma imagem do tipo PNG ou JPEG")
                setImageAvatar(null)
                return ;
            }
        }
    }

    return (
        <div>
            <Header/>
            <div className="content">
                <Title name="Minha conta">
                    <FiSettings size={25}/>
                </Title>
                <div className="container">
                    <form className="form-profile" onSubmit={handleSubmit}>
                        <label className="label-avatar">
                            <span>
                                <FiUpload color="#FFF" size={25} />
                            </span>

                            <input type="file" accept="image/*" onChange={handleFile} /> {/** Abrir o explorer de arquivos */}
                            <img src={avatarUrl === null ? avatar : avatarUrl } alt="Foto de perfil" width={250} height={250}/>
                           
                        </label>

                        <label>Nome</label>
                        <input value={nome} onChange={(e) => setNome(e.target.value)} type="text"/>

                        <label>E-mail</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" disabled={true}/>

                        <button type="submit">{loading ? "Aguarde..." : "Salvar"}</button>
                    </form>
                </div>
                <div className="container">
                    <button className="logout-btn" onClick={() => logout()}>Sair</button>
                </div>
            </div>
        </div>
    )
}