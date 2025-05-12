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

export function App() {
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [minimized, setMinimized] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleRemoveItem = (index: number) => {
    setCarrinho((prev) => prev.filter((_, i) => i !== index));
  };

  // Verificar se o usuário está logado no localStorage
  useEffect(() => {
    const usuarioId = localStorage.getItem("usuario_id");
    if (usuarioId) {
      setIsLoggedIn(true); // Usuário logado
    } else {
      setIsLoggedIn(false); // Usuário não logado
      navigate("/login"); // Redireciona para a página de login se não estiver logado
    }
  }, [navigate]);

  return (
    <SearchProvider>
      <div className="flex h-screen bg-gray-100">
        {isLoggedIn ? (
          <>
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
