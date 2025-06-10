import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './header.css';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const pages = [
        { path: "/home", label: "Dashboard" },
        { path: "/produtos", label: "Produtos" },
        { path: "/depositos", label: "Depósitos" },
        { path: "/movimentacoes", label: "Movimentações" },
        { path: "/estoques", label: "Estoques" },
    ];

    return (
        <div className="header-container">
            {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

            <aside className={`side-menu ${menuOpen ? "open" : ""}`}>
                <h2>Menu</h2>
                <ul>
                    {pages
                        .filter(page => page.path !== location.pathname)
                        .map(page => (
                            <li key={page.path} onClick={() => {
                                navigate(page.path);
                                setMenuOpen(false);
                            }}>
                                {page.label}
                            </li>
                        ))
                    }
                    <li className="sair" onClick={() => navigate("/")}>Sair ⍈</li>
                </ul>
            </aside>

            <header className="header">
                <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
                    &#9776;
                </button>
                <h1>InvenPro</h1>
            </header>
        </div>
    );
}
