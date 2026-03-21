import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navigation/Navbar";
import { Footer } from "@/components/ui/marketing/Footer";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { Providers } from "@/components/ui/Providers";
import LightTheme from "@/components/effects/LightTheme";
import { Button } from "@/components/ui/forms/Button";
import { ThemeImage } from "@/components/ui/marketing/ThemeImage";
import Link from "next/link";

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    variable: "--font-montserrat",
});

export const metadata: Metadata = {
    title: "IMADGEN | AI Marketing Agency",
    description: "AI Creative Studio & Marketing OS",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const navLinks = [
        { label: "AI Creative Studio", href: "/studio" },
        { label: "Marketing OS", href: "/os" },
        { label: "AI Agents", href: "/agents" },
        { label: "About us", href: "/about" },
    ];

    return (
        <html lang="en" suppressHydrationWarning className={montserrat.variable}>
            <body className={montserrat.className}>
                <Providers>
                    <div className="bg" aria-hidden="true" />
                    <Navbar
                        brand={
                            <Link href="/" className="brand-link">
                                <ThemeImage
                                    darkSrc="/media/logo/imadgen-logo-dark.png"
                                    lightSrc="/media/logo/imadgen-logo-light.png"
                                    alt="IMADGEN"
                                    width={32}
                                    height={32}
                                    className="layout-logo"
                                />
                                <span>IMADGEN</span>
                            </Link>
                        }
                        links={navLinks}
                        actions={
                            <>
                                <LightTheme />
                                <Link href="/auth" passHref>
                                    <Button size="sm">Get started</Button>
                                </Link>
                            </>
                        }
                    />
                    <main>
                        {children}
                        <Footer
                            copyright={`© ${new Date().getFullYear()} IMADGEN. All rights reserved.`}
                            message="Built in India. Designed for the World."
                            socials={[
                                {
                                    label: 'LinkedIn',
                                    href: 'https://www.linkedin.com/company/imadgen/',
                                    icon: (
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M6.5 6.75a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z" fill="currentColor" opacity=".92" />
                                            <path d="M5.25 9h2.5v10.25h-2.5V9Zm4.25 0h2.4v1.4h.03c.33-.62 1.14-1.28 2.35-1.28 2.51 0 2.97 1.65 2.97 3.79v6.34h-2.5v-5.62c0-1.34-.02-3.06-1.86-3.06-1.86 0-2.15 1.45-2.15 2.96v5.72h-2.5V9Z" fill="currentColor" opacity=".92" />
                                        </svg>
                                    )
                                },
                                {
                                    label: 'Instagram',
                                    href: 'https://instagram.com/imadgen',
                                    icon: (
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M7.5 3.8h9A3.7 3.7 0 0 1 20.2 7.5v9a3.7 3.7 0 0 1-3.7 3.7h-9A3.7 3.7 0 0 1 3.8 16.5v-9A3.7 3.7 0 0 1 7.5 3.8Z" stroke="currentColor" strokeWidth="1.6" opacity=".92" />
                                            <path d="M12 15.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" stroke="currentColor" strokeWidth="1.6" opacity=".92" />
                                            <path d="M17.3 6.9h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".92" />
                                        </svg>
                                    )
                                }
                            ]}
                            brand={
                                <ThemeImage
                                    darkSrc="/media/logo/imadgen-logo-dark.png"
                                    lightSrc="/media/logo/imadgen-logo-light.png"
                                    alt="IMADGEN"
                                    width={22}
                                    height={22}
                                />
                            }
                            brandName="IMADGEN"
                        />
                    </main>
                    <CursorGlow />
                </Providers>
            </body>
        </html>
    );
}
