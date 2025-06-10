import React from "react";
import './senha.css';
import { Link } from "react-router-dom";

export default function Senha() {
    return (
        <div className="container">
            <h1>InvenPro</h1>
            <div className="senha-container">
                <div className="formulario-senha">
                    <h2>Alterar Senha</h2>
                    <form>
                        <div className="input-container">
                            <span className="icon">
                                <i className="fas fa-lock"></i>
                            </span>
                            <input type="password" id="password" name="password" placeholder="Digite sua nova senha" required/>
                        </div>
                        <button className="btnConfirmar" type="submit">Confirmar</button>

                        <Link to="/" className="voltar">
                            Voltar
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}
