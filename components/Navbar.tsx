import Link from 'next/link';
import { useState } from 'react';

type link = {
    label: string;
    href: string;
};

type NavbarProps = {
    title: string;
    links: link[];
};

export default function Navbar({ title, links }: NavbarProps) {
    return (
        <nav className="navbar">

            <div className="navbar_title">
                <h1>{title}</h1>
            </div>

            <div className="navbar_links">
                <ul>
                    {links.map((link, index) => (
                        <li key={index}>
                            <a href={link.href}>{link.label}</a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}