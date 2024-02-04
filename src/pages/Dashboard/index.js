import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../contexts/auth"
import Header from '../../components/Header'
import Title from '../../components/Title'
import { FiPlus, FiMessageSquare, FiSearch, FiEdit2 } from "react-icons/fi"
import Modal from "../../components/Modal"
import './dashboard.css'
import { Link } from "react-router-dom"
import { collection, limit, orderBy, query, getDocs, startAfter } from "firebase/firestore"
import { db } from "../../services/firebaseConnection"
import { format } from 'date-fns'

const listRef = collection(db, "chamados")

export default function Dashboard() {
    const { logout } = useContext(AuthContext)
    const [chamados, setChamados] = useState([])
    const [loading, setLoading] = useState(true)
    const [isEmpty, setIsEmpty] = useState(false)
    const [lastDoc, setLastDoc] = useState()
    const [loadMore, setLoadMore] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [detail, setDetail] = useState()

    useEffect(() => {
        async function loadChamados() {
            const q = query(listRef, orderBy("created", "desc"), limit(5)) // Ordena por ordem de criação do chamado e traz apenas 5 itens
            const querySnapshot = await getDocs(q)
            setChamados([])
            await updateState(querySnapshot)

            setLoading(false)
        }

        loadChamados();

        return () => { // Quando o componente desmontar

        }
    }, [])

    async function updateState(querySnapshot) {
        const isCollectionEmpty = querySnapshot.size === 0;
        if(!isCollectionEmpty) {
            let lista = []
            querySnapshot.forEach(doc => {
                lista.push({
                    id: doc.id,
                    assunto: doc.data().assunto,
                    cliente: doc.data().cliente,
                    clienteId: doc.data().clienteId,
                    created: doc.data().created,
                    createdFormat: format(doc.data().created.toDate(), "dd/mm/yyyy"),
                    status: doc.data().status,
                    complemento: doc.data().complemento
                })
            });

            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] // Pegando o último item renderizado
            setLastDoc(lastDoc);
            setChamados(chamados => [...chamados, ...lista])
        } else {
            setIsEmpty(true)
        }

        setLoadMore(false)
    }

    async function handleMore() {
        setLoadMore(true);
        const q = query(listRef, orderBy("created", "desc"), startAfter(lastDoc), limit(5)) // Ordena por ordem de criação do chamado e traz apenas 5 itens
        const querySnapshot = await getDocs(q)
        await updateState(querySnapshot);


    }

    function toggleModal(item) {
        setShowModal(!showModal)
        setDetail(item)
    }

    if(loading) {
        return (
            <div>
                <Header/>
                <div className="content">
                    <Title name="Tickets">
                        <FiMessageSquare size={25} />
                    </Title>
                    <div className="container dashboard chamado-none">
                        <span>Buscando chamados...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Header/>
            <div className="content">
                <Title name="Tickets">
                    <FiMessageSquare size={25} />
                </Title>
                <>
                    {chamados.length === 0 ? (
                        <div className="container dashboard chamado-none">
                            <span>Nenhum chamado encontrado...</span>
                            <Link to="/new" className="new">
                                <FiPlus color="#FFF" size={25} />
                                Novo chamado
                            </Link>
                        </div>
                    ): (
                        <>
                            <Link to="/new" className="new">
                                <FiPlus color="#FFF" size={25} />
                                Novo chamado
                            </Link>
                            <table className="dashboard">
                                <thead>
                                    <tr>
                                        <th scope="col">Cliente</th>
                                        <th scope="col">Assunto</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Cadastrado em</th>
                                        <th scope="col">#</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chamados.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td data-label="Cliente">{item.cliente}</td>
                                                <td data-label="Assunto">{item.assunto}</td>
                                                <td data-label="Status">
                                                    <span className="badge" style={{ backgroundColor: item.status === "Aberto" ? "#5cb85c" : "#999" }}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td data-label="Cadastrado">{item.createdFormat}</td>
                                                <td data-label="#">
                                                    <button onClick={() => toggleModal(item)} className="action" style={{backgroundColor: "#3583f6"}}>
                                                        <FiSearch color="#fff" size={17}/>
                                                    </button>
                                                    <Link to={`/new/${item.id}`} className="action" style={{backgroundColor: "#f6a935"}}>
                                                        <FiEdit2 color="#fff" size={17}/>
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {loadMore && <h3>Buscando mais chamados...</h3>}
                            {!loadMore && !isEmpty && <button className="btn-more" onClick={handleMore}>Buscar mais</button>}
                        </>
                    )}
                </>
                <div className="container">
                    <button className="logout-btn" onClick={() => logout()}>Sair</button>
                </div>
            </div>
            {showModal && <Modal conteudo={detail} close={() => setShowModal(!showModal)} />}
        </div>
    )
}