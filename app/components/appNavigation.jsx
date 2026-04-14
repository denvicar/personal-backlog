'use client'

import Link from "next/link";
import {usePathname} from "next/navigation";

const navItems = [
    {href: '/', label: 'Backlog'},
    {href: '/stats', label: 'Stats'}
]

export default function AppNavigation() {
    const pathname = usePathname()

    return (
        <nav className={"panel flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"} aria-label={"Primary"}>
            <div>
                <p className={"eyebrow"}>Workspace</p>
                <h2 className={"mt-1 text-2xl font-semibold"}>Personal Backlog</h2>
            </div>
            <div className={"flex flex-wrap gap-2"}>
                {navItems.map((item) => {
                    const active = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`button-base ${active ? 'button-primary' : 'button-secondary'}`}
                            aria-current={active ? 'page' : undefined}
                        >
                            {item.label}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
