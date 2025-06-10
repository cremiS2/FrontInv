import React, { useState } from "react";
import './login.css';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
    const navigate = useNavigate();
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post("https://projeto-inventario-grdrgfgcgpd0cbgu.brazilsouth-01.azurewebsites.net/auth/login", {
                login: login,
                senha: senha
            });

            const { token, login: username, role } = response.data;

            // Salva o token no localStorage para uso futuro
            localStorage.setItem("token", token);
            localStorage.setItem("username", username);
            localStorage.setItem("role", role);

            navigate("/home");
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setErro("Login ou senha inválidos");
            } else {
                setErro("Erro ao tentar fazer login");
            }
        }
    };

    return (
        <div className="container">
            <h1>InvenPro</h1>
            <div className="login-container">
                <div className="formulario-login">
                    <h2>Login de Usuário</h2>
                    {erro && <p className="erro">{erro}</p>}
                    <form onSubmit={handleLogin}>
                        <div className="input-container">
                            <span className="icon">
                                <i className="fas fa-user"></i>
                            </span>
                            <input
                                type="text"
                                id="username"
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
                            <input type="password" id="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                        </div>

                        <Link to="/alterar-senha" className="cadastrar">Esqueceu sua senha?</Link>

                        <button className="btnLogin" type="submit">Login</button>
                    </form>

                    <Link to="/registrar" className="cadastrar">
                        Não tem uma conta? Cadastre-se
                    </Link>
                </div>
            </div>
        </div>
    );
}
