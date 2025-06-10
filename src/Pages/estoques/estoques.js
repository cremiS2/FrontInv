import React, { useRef, useEffect, useState } from "react";
import './estoques.css';
import Header from "../../components/header/header";

export default function Estoques() {
  const modalRef = useRef(null);
  const deleteModalRef = useRef(null);

  const [estoques, setEstoques] = useState([]);
  const [produtoId, setProdutoId] = useState("");
  const [depositoId, setDepositoId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [estoqueSelecionado, setEstoqueSelecionado] = useState(null);

  function openModal() {
    modalRef.current.showModal();
  }

  function abrirModalDeletar(estoque) {
    setEstoqueSelecionado(estoque);
    deleteModalRef.current.showModal();
  }

  function confirmarExclusao() {
    if (!estoqueSelecionado) return;

    const token = localStorage.getItem("token");

    fetch(`https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/estoques/deletar/${estoqueSelecionado.id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao deletar estoque");
        setEstoques(prev => prev.filter(e => e.id !== estoqueSelecionado.id));
        deleteModalRef.current.close();
        setEstoqueSelecionado(null);
      })
      .catch(err => alert("Erro: " + err.message));
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

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/estoques/todos", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar estoques");
        return res.json();
      })
      .then(data => setEstoques(data))
      .catch(err => alert(err.message));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    const estoqueDTO = {
      produtoId,
      depositoId,
      quantidade: parseInt(quantidade)
    };

    fetch("https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/estoques/criar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify(estoqueDTO)
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao criar estoque");
        return res.json();
      })
      .then(novoEstoque => {
        setEstoques(prev => [...prev, novoEstoque]);
        modalRef.current.close();
        setProdutoId("");
        setDepositoId("");
        setQuantidade("");
      })
      .catch(err => alert(err.message));
  }

  return (
    <div className="estoques-container">
      <Header />
      <div className="estoques-header">
        <h2>Estoques</h2>
        <button className="btn-adicionar-estoque" onClick={openModal}>Adicionar Estoque</button>
      </div>

      <div className="depositos-lista">
        <h2>Estoques Cadastrados</h2>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Depósito</th>
              <th>Quantidade</th>
              <th>Opções</th>
            </tr>
          </thead>
          <tbody>
            {estoques.map(e => (
              <tr key={e.id}>
                <td>{e.produtoNome}</td>
                <td>{e.depositoNome}</td>
                <td>{e.quantidade}</td>
                <td>
                  <span
                    title="Excluir"
                    style={{ cursor: "pointer" }}
                    onClick={() => abrirModalDeletar(e)}
                  >
                    🗑️
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog id="modalAdd" ref={modalRef} className="modal-movimentacao">
        <form onSubmit={handleSubmit}>
          <h3>Adicionar Estoque</h3>

          <input
            type="number"
            placeholder="ID do Produto"
            required
            value={produtoId}
            onChange={e => setProdutoId(e.target.value)}
          />

          <input
            type="number"
            placeholder="ID do Depósito"
            required
            value={depositoId}
            onChange={e => setDepositoId(e.target.value)}
          />

          <input
            type="number"
            placeholder="Quantidade"
            required
            value={quantidade}
            onChange={e => setQuantidade(e.target.value)}
          />

          <button type="submit">Salvar</button>
        </form>
      </dialog>

      <dialog id="modalDelete" ref={deleteModalRef} className="modal-deletar">
        <div>
          <h3>Tem certeza que deseja excluir este estoque?</h3>
          <button className="btnCancelar" onClick={() => deleteModalRef.current.close()}>Cancelar</button>
          <button className="btnExcluir" onClick={confirmarExclusao}>Excluir</button>
        </div>
      </dialog>
    </div>
  );
}
