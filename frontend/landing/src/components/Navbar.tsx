"use client";

import { useState, useEffect } from "react";
import "./Navbar.css";

const NAV_LINKS = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "Track Status", href: "#track" },
    { label: "Help", href: "#help" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
                {/* Logo */}
                <a href="#home" className="navbar-logo">
                    <span className="navbar-logo-icon">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <path
                                d="M14 2C14 2 8 8 8 14C8 17.5 10.5 20 14 20C17.5 20 20 17.5 20 14C20 8 14 2 14 2Z"
                                fill="#10B981"
                            />
                            <path
                                d="M14 8C14 8 11 12 11 15C11 16.7 12.3 18 14 18C15.7 18 17 16.7 17 15C17 12 14 8 14 8Z"
                                fill="#064E3B"
                            />
                            <path
                                d="M14 20V26"
                                stroke="#064E3B"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M14 23L11 21"
                                stroke="#10B981"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M14 24L17 22"
                                stroke="#10B981"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </span>
                    <span className="navbar-logo-text">SUVIDHA</span>
                </a>

                {/* Center Links */}
                <div className="navbar-links">
                    {NAV_LINKS.map((link) => (
                        <a key={link.href} href={link.href} className="navbar-link">
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <button className="navbar-cta">Citizen Login</button>

                {/* Hamburger */}
                <button
                    className={`navbar-hamburger${menuOpen ? " open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span />
                    <span />
                </button>
            </nav>

            {/* Mobile Menu */}
            <div className={`navbar-mobile-menu${menuOpen ? " open" : ""}`}>
                {NAV_LINKS.map((link) => (
                    <a
                        key={link.href}
                        href={link.href}
                        className="navbar-mobile-link"
                        onClick={() => setMenuOpen(false)}
                    >
                        {link.label}
                    </a>
                ))}
                <div className="navbar-mobile-cta">
                    <button className="btn-primary" style={{ width: "100%" }}>
                        Citizen Login
                    </button>
                </div>
            </div>
        </>
    );
}
