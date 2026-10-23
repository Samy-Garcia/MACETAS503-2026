import { useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import Footer from "../components/Footer.jsx";

export default function NotFound() {

    useEffect(() => {
        document.title = "Página no encontrada | Macetas503";
    }, []);
  return (
    <div className="w-full min-h-screen bg-page font-sans text-zinc-800 flex flex-col">
      <main className="max-w-7xl mx-auto px-4 py-24 text-center flex-grow flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold text-zinc-900">404</h1>
        <p className="text-zinc-500 mt-4 text-lg">Esta página no existe o ha sido movida.</p>
        <Link to="/">
          <Button className="mt-8 bg-primary-700 text-white px-6 py-2 rounded font-bold hover:bg-primary-800">Volver al inicio</Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
