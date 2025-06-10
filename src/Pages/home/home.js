import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './style.css';
import Header from '../../components/header/header';

export default function Home() {
  const navigate = useNavigate();
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [qtdDepositos, setQtdDepositos] = useState(0);
  const [qtdProdutos, setQtdProdutos] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [primeiraMovs, setPrimeirasMovs] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    const usuario = localStorage.getItem("username");
    if (usuario) {
      setNomeUsuario(usuario);
    }
  }, []);

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  fetch("https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/depositos/todos", {
    headers
  })
    .then(res => res.json())
    .then(data => setQtdDepositos(data.length))
    .catch(err => console.error("Erro ao buscar depósitos:", err));

  fetch("https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/produto/todos", {
    headers
  })
    .then(res => res.json())
    .then(data => {
      const totalPreco = data.reduce((soma, produto) => soma + produto.preco, 0);
      setValorTotal(totalPreco);
      setProdutos(data);
      setQtdProdutos(data.length);
    })
    .catch(err => console.error("Erro ao buscar produtos:", err));

  useEffect(() => {
    fetch("https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/movimentacoes/todos", {
      headers
    })
      .then(res => res.json())
      .then(data => {
        const umltimasMovs = data.slice(-5);
        setPrimeirasMovs(umltimasMovs);
      })
      .catch(err => console.error("Erro ao buscar movimentações:", err));
  }, []);


  return (
    <div className="home-container">
      <Header />

      <main className="main-content">
        <h2 className="h2-home">Bem vindo{nomeUsuario ? `, ${nomeUsuario}` : ""}!</h2>
        <h2 className="h2-home">Dashboard</h2>

        <div className="cards-container">
          <div className="card" onClick={() => navigate("/produtos")}>
            <h3>Produtos 📦</h3>
            <p>{qtdProdutos}</p>
          </div>
          <div className="card" onClick={() => navigate("/depositos")}>
            <h3>Depósitos 🏭</h3>
            <p>{qtdDepositos}</p>
          </div>
          <div className="card" onClick={() => navigate("/movimentacoes")}>
            <h3>Últimas Movimentações 🔁</h3>
            <p>{primeiraMovs.length}</p>
          </div>
          <div className="card">
            <h3>Valor em estoque 💰</h3>
            <p>R$: {valorTotal.toFixed(2)}</p>
          </div>
        </div>

        <div className="movimentacao-container">
          <h2>Movimentações recentes</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {primeiraMovs.map((mov) => {
                const produto = produtos.find(p => p.id === mov.produtoId);
                const nomeProduto = produto ? produto.nome : "Produto não encontrado";

                return (
                  <tr key={mov.id}>
                    <td>{new Date(mov.dataHora).toLocaleString()}</td>
                    <td>{nomeProduto}</td>
                    <td>{mov.quantidade}</td>
                    <td>{mov.tipo}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
