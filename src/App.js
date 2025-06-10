import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/login/login';
import Cadastro from './pages/cadastro/cadastro';
import AlterarSenha from './pages/mudarSenha/senha';
import Home from './pages/home/home';
import Produtos from './pages/produtos/produtos';
import Depositos from './pages/depositos/depositos';
import Estoques from './pages/estoques/estoques';
import Movimentacoes from './pages/movimentacoes/movimentacoes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registrar" element={<Cadastro />} />
        <Route path="/alterar-senha" element={<AlterarSenha />} />
        <Route path="/home" element={<Home />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/depositos" element={<Depositos />} />
        <Route path="/estoques" element={<Estoques />} />
        <Route path="/movimentacoes" element={<Movimentacoes />} />
      </Routes>
    </Router>
  );
}

export default App;
