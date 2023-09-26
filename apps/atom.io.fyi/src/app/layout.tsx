import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import "./globals.scss"
import scss from "./layout.module.scss"

// eslint-disable-next-line quotes
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: `Create Next App`,
	description: `Generated by create next app`,
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}): JSX.Element {
	return (
		<html lang="en">
			<body className={inter.className + ` ` + scss.class}>
				<header>
					<nav>
						<Link href="/">atom.io.fyi</Link>
						<Link href="docs">docs</Link>
						<Link href="https://github.com/jeremybanka/wayforge/blob/">
							github
						</Link>
					</nav>
				</header>
				<main>{children}</main>
				<footer>♥️ jeremybanka</footer>
			</body>
		</html>
	)
}
