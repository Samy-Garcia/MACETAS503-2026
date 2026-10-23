import React, { useState } from 'react';
import { SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import Footer from "../components/Footer";

// Importaciones de Shadcn UI (Ajusta la ruta según tu configuración de alias)
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function ProductsPage() {
  // Estados para simular filtros básicos
  const [priceRange, setPriceRange] = useState([2, 20]);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  
  // Estado para ocultar/mostrar la barra lateral por completo
  const [showFilters, setShowFilters] = useState(true);

  // Estados independientes para el colapso de cada sección (Shadcn los maneja con open/onOpenChange)
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(true);

  const products = [
    { id: 1, name: "Maceta Hexagonal", img: "https://via.placeholder.com/300", rating: 4.5, price: 10.00, discountPrice: 4.99, hasDiscount: true },
    { id: 2, name: "Maceta Cúbica", img: "https://via.placeholder.com/300", rating: 4.5, price: 2.00, hasDiscount: false },
    { id: 3, name: "Maceta Hexagonal", img: "https://via.placeholder.com/300", rating: 4.7, price: 20.00, discountPrice: 11.99, hasDiscount: true },
    { id: 4, name: "Maceta Hexagonal", img: "https://via.placeholder.com/300", rating: 4.5, price: 10.00, discountPrice: 4.99, hasDiscount: true },
    { id: 5, name: "Maceta Cúbica", img: "https://via.placeholder.com/300", rating: 4.5, price: 2.00, hasDiscount: false },
    { id: 6, name: "Maceta Hexagonal", img: "https://via.placeholder.com/300", rating: 4.7, price: 20.00, discountPrice: 11.99, hasDiscount: true },
    { id: 7, name: "Maceta Hexagonal", img: "https://via.placeholder.com/300", rating: 4.5, price: 10.00, discountPrice: 4.99, hasDiscount: true },
    { id: 8, name: "Maceta Cúbica", img: "https://via.placeholder.com/300", rating: 4.5, price: 2.00, hasDiscount: false },
    { id: 9, name: "Maceta Hexagonal", img: "https://via.placeholder.com/300", rating: 4.7, price: 20.00, discountPrice: 11.99, hasDiscount: true },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans">
      


      {/* 3. HERO BANNER */}
      <section className="bg-[#0A4429] text-white text-center py-12">
        <h1 className="text-4xl font-bold tracking-wide">Más Vendidos</h1>
      </section>

      {/* BARRA DE ACCIÓN INTERMEDIA */}
      <div className="max-w-7xl mx-auto px-4 pt-8 flex items-center justify-between">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-neutral-200 text-sm font-semibold text-[#0A4429] shadow-xs hover:bg-neutral-50 transition cursor-pointer"
        >
          <SlidersHorizontal size={16} />
          {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
        </button>
        <span className="text-xs text-neutral-500 font-medium">{products.length} Productos encontrados</span>
      </div>

      {/* 4. MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTERS */}
        <aside className={`text-sm transition-all duration-300 lg:col-span-1 
          ${showFilters ? "block opacity-100" : "hidden opacity-0 lg:hidden"}`}
        >
          <div className="bg-white p-5 rounded-lg border border-neutral-100 shadow-xs space-y-6">
            
            {/* Ordenar Por */}
            <div>
              <h3 className="font-bold text-neutral-900 mb-3">Ordenar Por</h3>
              <ul className="space-y-2 text-neutral-600">
                <li><button className="hover:text-emerald-700 transition cursor-pointer">Precio Ascendente</button></li>
                <li><button className="hover:text-emerald-700 transition cursor-pointer">Precio Descendente</button></li>
              </ul>
            </div>

            <hr className="border-neutral-200" />

            {/* SECCIÓN CATEGORÍA CON SHADCN COLLAPSIBLE */}
            <Collapsible
              open={isCategoryOpen}
              onOpenChange={setIsCategoryOpen}
              className="space-y-2"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex justify-between items-center text-left font-bold text-neutral-900 cursor-pointer group">
                  <span className="group-hover:text-emerald-700 transition">Categoría</span>
                  {isCategoryOpen ? (
                    <ChevronUp size={16} className="text-neutral-400" />
                  ) : (
                    <ChevronDown size={16} className="text-neutral-400" />
                  )}
                </button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <ul className="space-y-2 text-neutral-600 pt-2">
                  <li className="flex items-center gap-2"><input type="checkbox" id="macetas" className="rounded border-neutral-300 accent-[#0A4429]" /> <label htmlFor="macetas" className="cursor-pointer">Macetas</label></li>
                  <li className="flex items-center gap-2"><input type="checkbox" id="velas" className="rounded border-neutral-300 accent-[#0A4429]" /> <label htmlFor="velas" className="cursor-pointer">Velas</label></li>
                  <li className="flex items-center gap-2"><input type="checkbox" id="portavasos" className="rounded border-neutral-300 accent-[#0A4429]" /> <label htmlFor="portavasos" className="cursor-pointer">Portavasos</label></li>
                  <li className="flex items-center gap-2"><input type="checkbox" id="floreros" className="rounded border-neutral-300 accent-[#0A4429]" /> <label htmlFor="floreros" className="cursor-pointer">Floreros</label></li>
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <hr className="border-neutral-200" />

            {/* SECCIÓN COLOR CON SHADCN COLLAPSIBLE */}
            <Collapsible
              open={isColorOpen}
              onOpenChange={setIsColorOpen}
              className="space-y-2"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex justify-between items-center text-left font-bold text-neutral-900 cursor-pointer group">
                  <span className="group-hover:text-emerald-700 transition">Color</span>
                  {isColorOpen ? (
                    <ChevronUp size={16} className="text-neutral-400" />
                  ) : (
                    <ChevronDown size={16} className="text-neutral-400" />
                  )}
                </button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <ul className="space-y-2 text-neutral-600 pt-2">
                  <li className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 rounded-sm"></span> Azul</li>
                  <li className="flex items-center gap-2"><span className="w-3 h-3 bg-black rounded-sm"></span> Negro</li>
                  <li className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-400 rounded-sm"></span> Gris</li>
                  <li className="flex items-center gap-2"><span className="w-3 h-3 bg-white border border-neutral-300 rounded-sm"></span> Blanco</li>
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <hr className="border-neutral-200" />

            {/* Precio */}
            <div>
              <h3 className="font-bold text-neutral-900 mb-3">Precio</h3>
              <input 
                type="range" 
                min="2" 
                max="20" 
                className="w-full accent-[#0A4429] cursor-pointer" 
                value={priceRange[1]} 
                onChange={(e) => setPriceRange([2, parseInt(e.target.value)])}
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>$2</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            <hr className="border-neutral-200" />

            {/* Con Descuento */}
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-neutral-900">Con Descuento</h3>
              <input 
                type="checkbox" 
                checked={onlyDiscount} 
                onChange={(e) => setOnlyDiscount(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 accent-[#0A4429] cursor-pointer" 
              />
            </div>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <section className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 transition-all duration-300
          ${showFilters ? "col-span-1 lg:col-span-3" : "col-span-1 lg:col-span-4 lg:grid-cols-4"}`}
        >
          {products.map((product) => (
            <div key={product.id} className="group relative flex flex-col bg-white rounded-md overflow-hidden p-3 border border-neutral-100 hover:shadow-md transition">
              <div className="relative aspect-square w-full bg-neutral-100 rounded-sm overflow-hidden mb-3">
                <img src={product.img} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition duration-300" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[11px] font-bold text-neutral-700 flex items-center gap-1 shadow-xs">
                  <span className="text-amber-400">★</span> {product.rating}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-neutral-800 mb-1">{product.name}</h4>
              
              <div className="flex items-center gap-2 mt-auto">
                {product.hasDiscount ? (
                  <>
                    <span className="text-xs line-through text-neutral-400">${product.price.toFixed(2)}</span>
                    <span className="text-xs bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-sm">
                      -50% ${product.discountPrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-[#0A4429]">${product.price.toFixed(2)}</span>
                )}
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
