import React, { useState } from "react";
import './cadastro.css';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Cadastro() {
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [role, setRole] = useState("USUARIO");
    const navigate = useNavigate();

    const handleCadastro = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/auth/register", {
                login,
                senha,
                role
            });

            alert("Usuário cadastrado com sucesso!");
            navigate("/");
        } catch (error) {
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert("Erro ao cadastrar usuário");
            }
        }
    };

    return (
        <div className="container">
            <h1>InvenPro</h1>
            <div className="cadastro-container">
                <div className="formulario-cadastro">
                    <h2>Cadastrar-se</h2>
                    <form onSubmit={handleCadastro}>
                        <div className="input-container">
                            <span className="icon">
                                <i className="fas fa-user"></i>
                            </span>
                            <input
                                type="text"
                                placeholder="Login"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-container">
                            <span className="icon">
                                <i className="fas fa-lock"></i>
                            </span>
                            <input
                                type="password"
                                placeholder="Senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-container select-container">
                            <label htmlFor="role">Tipo de usuário:</label>
                            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required>
                                <option value="USUARIO">Usuário</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>


                        <button className="btnCadastrar" type="submit">Cadastrar</button>
                    </form>

                    <Link to="/" className="cadastrar">Possui conta? Faça Login</Link>
                </div>
            </div>
        </div>
    );
}
