import { useState, useEffect } from "react";
import { SidebarNav } from "./components/sidebar-nav";
import { Header } from "./components/header";
import { Cart } from "./components/cart";
import { Routes, Route, useNavigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ProdutosViewPage } from "./pages/ProdutosViewPage";
import { CategoriasViewPage } from "./pages/CategoriasViewPage";
import { SearchProvider } from "@/components/search-provider"; // ajuste o caminho se necessário
import { LoginPage } from "./pages/LoginPage"; // Página de login

interface CarrinhoItem {
  produto_id: number;
  dsc_produto: string;
  preco_venda1: number;
  quantidade: number;
}

// App.tsx
export function App() {
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [minimized, setMinimized] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); 

  const navigate = useNavigate();

  const handleRemoveItem = (index: number) => {
    setCarrinho((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const usuarioId = localStorage.getItem("usuario_id");
    if (usuarioId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      navigate("/login");
    }
  }, [navigate]);

  return (
    <SearchProvider>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {isLoggedIn ? (
          <>
            <SidebarNav
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
              <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

              <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 overflow-auto p-4">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/produtos" element={<ProdutosViewPage />} />
                    <Route
                      path="/categorias"
                      element={<CategoriasViewPage />}
                    />
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
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        )}
      </div>
    </SearchProvider>
  );
}

export default App;
