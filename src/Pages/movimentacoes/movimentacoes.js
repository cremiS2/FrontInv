import React, { useRef, useEffect, useState } from "react";
import Header from "../../components/header/header";
import './movimentacoes.css';

export default function Movimentacoes() {
  const modalRef = useRef(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [form, setForm] = useState({
    dataHora: "",
    quantidade: 0,
    tipo: "",
    produtoId: "",
    depositoOrigemId: "",
    depositoDestinoId: ""
  });

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

  // Carrega movimentações do backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("https://inventariocremasco-a2cpgqb8hngjeqap.brazilsouth-01.azurewebsites.net/movimentacoes/todos", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Erro na resposta");
        const text = await response.text();
        return text ? JSON.parse(text) : [];
      })
      .then(data => setMovimentacoes(data))
      .catch(err => console.error("Erro ao carregar movimentações:", err));
  }, []);

  // Carrega produtos e depósitos para mostrar nomes
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("https://inventariocremasco-a2cpgqb8hngjeqap.brazilsouth-01.azurewebsites.net/produto/todos", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => setProdutos(data))
      .catch(erro => console.error("Erro ao carregar produtos:", erro));

    fetch("https://inventariocremasco-a2cpgqb8hngjeqap.brazilsouth-01.azurewebsites.net/depositos/todos", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => setDepositos(data))
      .catch(erro => console.error("Erro ao carregar depósitos:", erro));
  }, []);

  function getNomeProduto(id) {
    const produto = produtos.find(p => p.id === id);
    return produto ? produto.nome : "—";
  }

  function getNomeDeposito(id) {
    const deposito = depositos.find(d => d.id === id);
    return deposito ? deposito.nome : "—";
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para realizar essa ação.");
      return;
    }

    fetch("https://inventariocremasco-a2cpgqb8hngjeqap.brazilsouth-01.azurewebsites.net/movimentacoes/registrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        dataHora: form.dataHora,
        quantidade: parseInt(form.quantidade),
        tipo: form.tipo,
        produtoId: parseInt(form.produtoId),
        depositoOrigemId: parseInt(form.depositoOrigemId),
        depositoDestinoId: parseInt(form.depositoDestinoId)
      })
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Erro ao registrar movimentação");
        }
        const text = await response.text();
        return text ? JSON.parse(text) : null;
      })
      .then(novaMovimentacao => {
        if (novaMovimentacao) {
          setMovimentacoes(prev => [...prev, novaMovimentacao]);
        }
        modalRef.current.close();
        setForm({
          dataHora: "",
          quantidade: 0,
          tipo: "",
          produtoId: "",
          depositoOrigemId: "",
          depositoDestinoId: ""
        });
      })
      .catch(erro => alert("Erro ao registrar movimentação: " + erro.message));
  }

  return (
    <div className="movimentacoes-container">
      <Header />
      <div className="movimentacoes-header">
        <h2>Movimentações</h2>
        <button className="btn-adicionar-movimentacao" onClick={openModal}>Realizar Movimentação</button>
      </div>

      <div className="depositos-lista">
        <h2>Movimentações Realizadas</h2>
        <table>
          <thead>
            <tr>
              <th>Data e Hora</th>
              <th>Quantidade</th>
              <th>Tipo</th>
              <th>Produto</th>
              <th>Depósito de Origem</th>
              <th>Depósito de Destino</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map(mov => {
              const produto = produtos.find(p => p.id === mov.produtoId);
              const dOri = depositos.find(d => d.id === mov.depositoOrigemId);
              const dDes = depositos.find(d => d.id === mov.depositoDestinoId);
              const nomeProduto = produto ? produto.nome : "Produto não encontrado";
              const nomeDOri = dOri ? dOri.nome : "Produto não encontrado";
              const nomeDDes = dDes ? dDes.nome : "Produto não encontrado";
              return (
                <tr key={mov.id}>
                  <td>{mov.dataHora}</td>
                  <td>{mov.quantidade}</td>
                  <td>{mov.tipo}</td>
                  <td>{nomeProduto}</td>
                  <td>{nomeDOri}</td>
                  <td>{nomeDDes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dialog id="modalAdd" ref={modalRef} className="modal-movimentacao">
        <form onSubmit={handleSubmit}>
          <h3>Realizar Movimentação</h3>
          <input
            type="datetime-local"
            name="dataHora"
            value={form.dataHora}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="quantidade"
            value={form.quantidade}
            onChange={handleChange}
            required
            min={1}
          />
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            required
          >
            <option value="">Selecione o tipo</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
            <option value="TRANSFERENCIA">Transferência</option>
          </select>
          <input
            type="number"
            name="produtoId"
            value={form.produtoId}
            onChange={handleChange}
            placeholder="ID do Produto"
            required
          />
          <input
            type="number"
            name="depositoOrigemId"
            value={form.depositoOrigemId}
            onChange={handleChange}
            placeholder="ID do Depósito de Origem"
            required
          />
          <input
            type="number"
            name="depositoDestinoId"
            value={form.depositoDestinoId}
            onChange={handleChange}
            placeholder="ID do Depósito de Destino"
            required
          />
          <button type="submit">Salvar</button>
        </form>
      </dialog>
    </div>
  );
}
