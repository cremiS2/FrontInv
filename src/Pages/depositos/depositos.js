import React, { useRef, useEffect, useState } from "react";
import './depositos.css';
import Header from "../../components/header/header";

export default function Depositos() {
  const modalRef = useRef(null);
  const deleteModalRef = useRef(null);

  const [depositos, setDepositos] = useState([]);
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState("");

  const [depositoSelecionado, setDepositoSelecionado] = useState(null);
  const [editando, setEditando] = useState(false);

  function openModal() {
    modalRef.current.showModal();
  }

  useEffect(() => {
    const dialog = modalRef.current;

    const handleClickOutside = (e) => {
      if (dialog.open && !dialog.querySelector("form").contains(e.target)) {
        dialog.close();
      }
    };

    dialog.addEventListener("click", handleClickOutside);
    return () => dialog.removeEventListener("click", handleClickOutside);
  }, []);

  function limparCampos() {
    setNome("");
    setLocalizacao("");
    setDepositoSelecionado(null);
    setEditando(false);
  }

  function editarProduto(deposito) {
    setDepositoSelecionado(deposito);
    setNome(deposito.nome);
    setLocalizacao(deposito.localizacao);
    setEditando(true);
    modalRef.current.showModal();
  }

  function abrirModalDeletar(deposito) {
    setDepositoSelecionado(deposito);
    deleteModalRef.current.showModal();
  }

  function confirmarExclusao() {
    if (!depositoSelecionado) return;

    fetch(`https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/depositos/deletar/${depositoSelecionado.id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    })
      .then(response => {
        if (!response.ok) throw new Error("Erro ao deletar depósito");
        setDepositos(depositos.filter(p => p.id !== depositoSelecionado.id));
        deleteModalRef.current.close();
        limparCampos();
      })
      .catch(err => {
        alert("Erro ao deletar: " + err.message);
      });
  }


  function handleSubmit(event) {
    event.preventDefault();

    const deposito = {
      nome: nome,
      localizacao: localizacao,

    };

    const tokenJWT = localStorage.getItem("token");

    const url = editando
      ? `https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/depositos/atualizar/${depositoSelecionado.id}`
      : "https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/depositos/criar";

    const method = editando ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokenJWT
      },
      body: JSON.stringify(deposito)
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao salvar produto");
        return res.json();
      })
      .then(depositoSalvo => {
        if (editando) {
          setDepositos(depositos.map(d => (d.id === depositoSalvo.id ? depositoSalvo : d)));
        } else {
          setDepositos(prev => [...prev, depositoSalvo]);
        }

        modalRef.current.close();
        limparCampos();
      })
      .catch(err => alert(err.message));
  }

  useEffect(() => {
    fetch("https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/depositos/todos", {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    })
      .then(response => response.json())
      .then(data => setDepositos(data))
      .catch(err => console.error("Erro ao buscar produtos:", err));
  }, []);

  return (
    <div className="depositos-container">
      <Header />

      <div className="depositos-header">
        <h2>Depósitos</h2>
        <button className="btn-adicionar-depositar" onClick={openModal}>Adicionar Depositar</button>
      </div>

      <div className="depositos-lista">
        <h2>Depósitos Cadastrados</h2>
        <table>
          <thead>
            <tr>
              <th>ID do Depósito</th>
              <th>Nome</th>
              <th>Localização</th>
              <th>Opções</th>
            </tr>
          </thead>
          <tbody>
            {depositos.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.nome}</td>
                <td>{d.localizacao}</td>
                <td>
                  <span onClick={() => editarProduto(d)} title="Editar" style={{ cursor: "pointer" }}>✏️</span>
                  <span onClick={() => abrirModalDeletar(d)} title="Excluir" style={{ cursor: "pointer", marginLeft: "8px" }}>🗑️</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog id="modalAdd" ref={modalRef} className="modal-deposito">
        <form onSubmit={handleSubmit}>
          <h3>{editando ? "Editar Deposito" : "Registrar Depósito"}</h3>
          <input
            type="text"
            placeholder="Nome do Depósito"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Localização"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            required
          />
          <button type="submit">Salvar</button>
        </form>
      </dialog>

      <dialog id="modalDelete" ref={deleteModalRef} className="modal-deletar">
        <div>
          <h3>Tem certeza que deseja excluir este depósito?</h3>
          <button className="btnCancelar" onClick={() => deleteModalRef.current.close()}>Cancelar</button>
          <button className="btnExcluir" onClick={confirmarExclusao}>Excluir</button>
        </div>
      </dialog>
    </div>
  );
}
