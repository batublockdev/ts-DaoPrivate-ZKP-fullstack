import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from "./components/Header";
import { useState } from "react";
import Sidebar from "./components/Sidebar";

export default function App({ Component, pageProps }: AppProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Header title="DAO Voting" />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
      </Sidebar>
      <main className="pt-20 px-4">
        <Component {...pageProps} />
      </main>
    </>
  );
}
