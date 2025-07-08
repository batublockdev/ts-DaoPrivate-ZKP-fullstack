import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useState } from "react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // Define routes where layout should be hidden
  const hideLayout = ["/components/Login", "/components/Register"].includes(router.pathname);

  return (
    <>
      {!hideLayout && <Header title="DAO Voting" />}
      {!hideLayout && (
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      )}

      <main className={`${!hideLayout ? "pt-20 px-4" : ""}`}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
