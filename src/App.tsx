import { useState } from "react"
import { SidebarNav } from "./components/sidebar-nav"
import { Header } from "./components/header"
import { Cart } from "./components/cart"
import { Routes, Route } from "react-router-dom"
import { HomePage } from "./pages/HomePage"
import { ProdutosViewPage } from "./pages/ProdutosViewPage"
import { CategoriasViewPage } from "./pages/CategoriasViewPage"

interface CarrinhoItem {
  produto_id: number;
  dsc_produto: string;
  preco_venda1: number;
  quantidade: number;
}

export function App() {
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]); // Inicialização correta
  const [minimized, setMinimized] = useState(true)

  const handleRemoveItem = (index: number) => {
    setCarrinho(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-auto p-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/produtos" element={<ProdutosViewPage />} />
              <Route path="/categorias" element={<CategoriasViewPage />} />
            </Routes>
          </main>
          <Cart
            carrinho={carrinho}
            onRemoveItem={handleRemoveItem}
            minimized={minimized}
            setMinimized={setMinimized}
          />
        </div>
      </div>
    </div>
  )
}

export default App
