import { useState, useContext } from 'react'
import { AuthContext } from '../../contexts/auth'
import Header from '../../components/Header'
import Title from '../../components/Title'
import { FiUser } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { db } from '../../services/firebaseConnection'
import { addDoc, collection } from 'firebase/firestore'

export default function Customers() {
    const [nome, setNome] = useState("")
    const [cnpj, setCnpj] = useState("")
    const [endereco, setEndereco] = useState("")
    const [loading, setLoading] = useState(false)

    const { logout } = useContext(AuthContext);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true)

        if(nome === "" || cnpj === "" || endereco === "") {
            toast.error("Preencha todos os campos...");
            return ;
        } 

        await addDoc(collection(db, "customers"), {
            nomeFantasia: nome,
            cnpj: cnpj,
            endereco: endereco
        }).then(() => {
            setNome("");
            setCnpj("");
            setEndereco("");
            toast.success(nome + " cadastrado com sucesso.")
            setLoading(false)
        }).catch(error => {
            toast.error("Ops, algo deu errado...")
            console.error("Erro ao cadastrar cliente ", error)
            setLoading(false)
        })        
    }

    return (
        <div>
            <Header />
            <div className='content'>
                <Title name="Clientes">
                    <FiUser size={25} />
                </Title>
                <div className="container">
                    <form className="form-profile" onSubmit={handleSubmit}>
                        <label>Nome fantasia</label>
                        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder='Nome da empresa' type="text"/>

                        <label>CNPJ</label>
                        <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder='CNPJ da empresa' type="text" />

                        <label>Endereço</label>
                        <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder='Endereço da empresa' type="text" />

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