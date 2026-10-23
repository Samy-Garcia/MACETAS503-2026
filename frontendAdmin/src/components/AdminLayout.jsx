import { Outlet } from "react-router";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";


export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
