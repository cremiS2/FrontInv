import React, { useRef, useEffect, useState } from "react";
import './produtos.css';
import Header from "../../components/header/header";

export default function Produtos() {
  const modalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const detalhesModalRef = useRef(null);

  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [urlImg, setUrlImg] = useState("");
  const [descricao, setDescricao] = useState("");

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [editando, setEditando] = useState(false);

  const [produtoDetalhes, setProdutoDetalhes] = useState(null);

  function openModal() {
    modalRef.current.showModal();
  }

  function closeModal() {
    modalRef.current.close();
    limparCampos();
  }

  function limparCampos() {
    setNome("");
    setPreco("");
    setUrlImg("");
    setDescricao("");
    setProdutoSelecionado(null);
    setEditando(false);
  }

  function editarProduto(produto) {
    setProdutoSelecionado(produto);
    setNome(produto.nome);
    setPreco(produto.preco.toString());
    setUrlImg(produto.imgUrl);
    setDescricao(produto.descricao);
    setEditando(true);
    modalRef.current.showModal();
  }

  function abrirModalDeletar(produto) {
    setProdutoSelecionado(produto);
    deleteModalRef.current.showModal();
  }

  function confirmarExclusao() {
  if (!produtoSelecionado) return;

  const token = localStorage.getItem("token");

  fetch(`https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/estoques/todos`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao buscar estoques");
      return res.json();
    })
    .then(estoques => {
      const estoque = estoques.find(e => e.produto && e.produto.id === produtoSelecionado.id);

      if (estoque) {
        return fetch(`https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/estoques/deletar/${estoque.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": "Bearer " + token
          }
        });
      }

      return Promise.resolve();
    })
    .then(() => {
      // 3. Agora deletar o produto
      return fetch(`https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/produto/deletar/${produtoSelecionado.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token
        }
      });
    })
    .then(response => {
      if (!response.ok) throw new Error("Erro ao deletar produto");
      setProdutos(produtos.filter(p => p.id !== produtoSelecionado.id));
      deleteModalRef.current.close();
      limparCampos();
    })
    .catch(err => {
      alert("Erro ao deletar: " + err.message);
    });
}


  //GET por id para informações
  function abrirModalDetalhes(produto) {
    fetch(`https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/produto/${produto.id}`, {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar detalhes do produto");
        return res.json();
      })
      .then(data => {
        setProdutoDetalhes(data);
        detalhesModalRef.current.showModal();
      })
      .catch(err => alert(err.message));
  }

  function fecharModalDetalhes() {
    detalhesModalRef.current.close();
    setProdutoDetalhes(null);
  }

  useEffect(() => {
    fetch("https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/produto/todos", {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    })
      .then(response => response.json())
      .then(data => setProdutos(data))
      .catch(err => console.error("Erro ao buscar produtos:", err));
  }, []);

  useEffect(() => {
    const dialog = modalRef.current;

    const handleClickOutside = (e) => {
      if (dialog.open && !dialog.querySelector("form").contains(e.target)) {
        dialog.close();
        limparCampos();
      }
    };

    dialog.addEventListener("click", handleClickOutside);
    return () => dialog.removeEventListener("click", handleClickOutside);
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    const produto = {
      nome: nome,
      preco: parseFloat(preco),
      codigo: codigo,
      medida: medida,
      imgUrl: urlImg,
      descricao: descricao,
    };

    const tokenJWT = localStorage.getItem("token");

    const url = editando
      ? `https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/produto/atualizar/${produtoSelecionado.id}`
      : "https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/produto/cadastrar";

    const method = editando ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokenJWT
      },
      body: JSON.stringify(produto)
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao salvar produto");
        return res.json();
      })
      .then(produtoSalvo => {
        if (editando) {
          setProdutos(produtos.map(p => (p.id === produtoSalvo.id ? produtoSalvo : p)));
        } else {
          setProdutos(prev => [...prev, produtoSalvo]);
        }

        modalRef.current.close();
        limparCampos();
      })
      .catch(err => alert(err.message));
  }

  return (
    <div className="produtos-container">
      <Header />

      <div className="produtos-header">
        <h2>Produtos</h2>
        <button className="btn-adicionar-produto" onClick={openModal}>Adicionar Produto</button>
      </div>

      <div className="produtos-lista">
        <h2>Produtos Cadastrados</h2>
        <table>
          <thead>
            <tr>
              <th>ID do Produto</th>
              <th>Nome do Produto</th>
              <th>Preço</th>
              <th>Código do Produto</th>
              <th>Descrição</th>
              <th>Medida</th>
              <th>Opções</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nome}</td>
                <td>{p.preco.toFixed(2)}</td>
                <td>{p.codigo}</td>
                <td className="descricao-coluna">{p.descricao}</td>
                <td>{p.medida}</td>
                <td>
                  <span onClick={() => editarProduto(p)} title="Editar" style={{ cursor: "pointer" }}>✏️</span>
                  <span onClick={() => abrirModalDeletar(p)} title="Excluir" style={{ cursor: "pointer", marginLeft: "8px" }}>🗑️</span>
                  <span onClick={() => abrirModalDetalhes(p)} title="Detalhes" style={{ cursor: "pointer", marginLeft: "8px" }}>• • •</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog id="modalAdd" ref={modalRef} className="modal-produto">
        <form onSubmit={handleSubmit}>
          <h3>{editando ? "Editar Produto" : "Adicionar Produto"}</h3>
          <input
            type="text"
            placeholder="Nome do Produto"
            required
            value={nome}
            onChange={e => setNome(e.target.value)}
          />
          <input
            type="number"
            placeholder="Preço"
            required
            value={preco}
            onChange={e => setPreco(e.target.value)}
            step="0.01"
            min="0"
          />
          <input
            type="text"
            placeholder="Código"
            required
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Unidade de Medida (Kg, L, Ml...)"
            required
            value={medida}
            onChange={e => setMedida(e.target.value)}
          />
          <input
            type="text"
            placeholder="URL da Imagem"
            required
            value={urlImg}
            onChange={e => setUrlImg(e.target.value)}
          />
          <textarea
            placeholder="Descrição..."
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
          />
          <button type="submit">{editando ? "Atualizar" : "Salvar"}</button>
        </form>
      </dialog>

      <dialog id="modalDelete" ref={deleteModalRef} className="modal-deletar">
        <div>
          <h3>Tem certeza que deseja excluir este produto?</h3>
          <button className="btnCancelar" onClick={() => deleteModalRef.current.close()}>Cancelar</button>
          <button className="btnExcluir" onClick={confirmarExclusao}>Excluir</button>
        </div>
      </dialog>

      <dialog id="modalDetalhes" ref={detalhesModalRef} className="modal-detalhes">
        {produtoDetalhes && (
          <div className="detalhesProduto">
            <div className="imgProduto">
              {produtoDetalhes.imgUrl && (
                <img
                  src={produtoDetalhes.imgUrl}
                  alt="Imagem do Produto"
                />
              )}
            </div>
            <div className="infoProduto">
              <h3>Detalhes do Produto</h3>
              <p><strong>Nome:</strong> {produtoDetalhes.nome}</p>
              <p><strong>Preço:</strong> R$ {produtoDetalhes.preco.toFixed(2)}</p>
              <p><strong>Código:</strong> {produtoDetalhes.codigo}</p>
              <p className="descricao-detalhe"><strong>Descrição:</strong> {produtoDetalhes.descricao}</p>
              <p><strong>Medida:</strong> {produtoDetalhes.medida}</p>
              <button onClick={fecharModalDetalhes}>Fechar</button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
