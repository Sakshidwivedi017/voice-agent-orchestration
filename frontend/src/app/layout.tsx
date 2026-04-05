import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navigation/Navbar";
import { Footer } from "@/components/ui/marketing/Footer";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { Providers } from "@/components/ui/Providers";
import LightTheme from "@/components/effects/LightTheme";
import { Button } from "@/components/ui/forms/Button";
import Link from "next/link";

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    variable: "--font-montserrat",
});

export const metadata: Metadata = {
    title: "Vaani | AI Voice Agent Platform",
    description: "Production-ready AI voice agent for hospitality, retail, and service businesses in India.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const navLinks = [
        { label: "Dashboard", href: "/voice-client" },
        { label: "Login", href: "/auth" },
    ];

    return (
        <html lang="en" suppressHydrationWarning className={montserrat.variable}>
            <body className={montserrat.className}>
                <Providers>
                    <div className="bg" aria-hidden="true" />
                    <Navbar
                        brand={
                            <Link href="/" className="brand-link">
                                <span>Vaani</span>
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
                            copyright={`© ${new Date().getFullYear()} Vaani. All rights reserved.`}
                            message="Built in India."
                            socials={[]}
                            brand={null}
                            brandName="Vaani"
                        />
                    </main>
                    <CursorGlow />
                </Providers>
            </body>
        </html>
    );
}
