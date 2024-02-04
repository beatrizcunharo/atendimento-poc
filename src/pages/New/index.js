import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Title from '../../components/Title'
import { FiPlusCircle } from 'react-icons/fi'
import { AuthContext } from '../../contexts/auth'
import { db } from '../../services/firebaseConnection';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'

import './new.css'
import { toast } from 'react-toastify'

const listRef = collection(db, "customers")

export default function New () {
    const [customers, setCustomers] = useState([])
    const [ complemento, setComplemento ] = useState("")
    const [ assunto, setAssunto ] = useState("Suporte")
    const [ status, setStatus ] = useState("Aberto")
    const [loading, setLoading] = useState(false)
    const [loadCustomer, setLoadCustomer] = useState(true)
    const [customerSelected, setCustomerSelected] = useState(0)
    const [idCustomer, setIdCustomer] = useState(false)
    const { user, logout } = useContext(AuthContext)
    const { id } = useParams()
    const navigate = useNavigate();

    useEffect(() => {
        async function loadCustomer() {
            await getDocs(listRef).then((snapshot) => {
                let lista = [];
                snapshot.forEach(doc => {
                    lista.push({
                        id: doc.id,
                        nomeFantasia: doc.data().nomeFantasia
                    })
                })

                if(snapshot.docs.size === 0) {
                    setCustomers([])
                    toast.error("Nenhum cliente cadastrado...")
                    return ;
                }

                setCustomers(lista)
                setLoadCustomer(false)

                if(id) {
                    loadId(lista)
                }
            }).catch(error => {
                console.error("Erro ao carregar os clientes ", error)
                setLoadCustomer(false)
                setCustomers([])
                toast.error("Ops, deu um erro ao buscar os clientes...")
            })
        }  

        loadCustomer()
    },[id])

    async function loadId(lista) {
        const docRef = doc(db, "chamados", id);
        await getDoc(docRef).then(snapshot => {
            setAssunto(snapshot.data().assunto);
            setStatus(snapshot.data().status);
            setComplemento(snapshot.data().complemento);

            let index = lista.findIndex(item => item.id === snapshot.data().clienteId)
            setCustomerSelected(index)
            setIdCustomer(true)
        }).catch(error => {
            console.error("Erro ao trazer para editar o chamado ", error)
            toast.error("Erro ao trazer os dados para editar...");
            setIdCustomer(false)
        }) 
    }

    async function handleRegister(e) {
        e.preventDefault();
        setLoading(true);

        if(idCustomer) {
            const docRef = doc(db,"chamados", id)
            await updateDoc(docRef, {
                cliente: customers[customerSelected].nomeFantasia,
                clienteId: customers[customerSelected].id,
                assunto: assunto,
                complemento: complemento,
                status: status,
                userId: user.uid
            }).then(() => {
                toast.success("Atualizado com sucesso...")
                setCustomerSelected(0);
                setComplemento("")
                navigate("/dashboard")
            }).catch(error => {
                toast.error("Ops, erro ao atualizar este chamado...")
                console.error("Erro ao atualizar este chamado ", error)
            })
            return ;
        }

        await addDoc(collection(db, "chamados"), {
            created: new Date(),
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            complemento: complemento,
            status: status,
            userId: user.uid
        }).then(() => {
            toast.success("Chamado registrado!");
            setComplemento("");
            setCustomerSelected(0)
            setLoading(false)
        }).catch(error => {
            console.error(error)
            toast.error("Erro ao registrar...");
            setLoading(false)
        })
    }

    function handleOptionChange(e) {
        setStatus(e.target.value)
    }

    function handleChangeSelect(e) {
        setAssunto(e.target.value)
    }

    function handleChangeCustomer(e) {
        setCustomerSelected(e.target.value)
    }

    return (
        <div>
            <Header/>
            <div className="content">
                <Title name={id ? "Editando chamado" : "Novo chamado"}>
                    <FiPlusCircle size={25} />
                </Title>
                <div className='container'>
                    <form className='form-profile' onSubmit={handleRegister}>
                        <label>Clientes</label>
                        {loadCustomer ? (
                            <input type='text' disabled={true} value="Carregando..."/>
                        ) :
                            <select value={customerSelected} onChange={handleChangeCustomer}>
                                {customers.map((item, index) => {
                                    return (
                                        <option key={index} value={index}>{item.nomeFantasia}</option>
                                    )
                                })}
                            </select>
                        }

                        <label>Assunto</label>
                        <select value={assunto} onChange={handleChangeSelect}>
                            <option value="Suporte">Suporte</option>
                            <option value="Visita Tecnica">Visita técnica</option>
                            <option value="Financeiro">Financeiro</option>
                        </select>

                        <label>Status</label>
                        <div className='status'>
                            <input checked={status === "Aberto"} onChange={handleOptionChange} type='radio' name='radio' value="Aberto"/>
                            <span>Em aberto</span>

                            <input checked={status === "Progresso"} onChange={handleOptionChange} type='radio' name='radio' value="Progresso"/>
                            <span>Progresso</span>

                            <input checked={status === "Atendido"} onChange={handleOptionChange} type='radio' name='radio' value="Atendido"/>
                            <span>Atendido</span>
                        </div>

                        <label>Complemento</label>
                        <textarea value={complemento} onChange={(e) => setComplemento(e.target.value)} type="text" placeholder='Descreva seu problema (opcional)' />

                        <button type="submit">{loading ? "Aguarde..." : "Registrar"}</button>
                    </form>
                </div>
                <div className="container">
                    <button className="logout-btn" onClick={() => logout()}>Sair</button>
                </div>
            </div>
        </div>
    )
}