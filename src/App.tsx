import { useState, useEffect } from "react";
import { MenuLateral } from "./components/menu-lateral";
import { Cabecalho } from "./components/cabecalho";
import { Routes, Route, useNavigate } from "react-router-dom";
import { PDVPage } from "./pages/PDVPage";
import { ProdutosViewPage } from "./pages/ProdutosViewPage";
import { CategoriasPage } from "./pages/CategoriasPage";
import { FormasPagamentoPage } from "./pages/FormasPagamentoPage";
import { PedidosPage } from "./pages/PedidosPage";
import { FornecedoresPage } from "./pages/FornecedoresPage";
import { ContasPagarPage } from "./pages/ContasPagarPage";
import { LoginPage } from "./pages/LoginPage";
import { ContasReceberPage } from "./pages/ContasReceberPage";
import { ClientesPage } from "./pages/ClientesPage";
import { ResumoFinanceiroPage } from "./pages/ResumoFinanceiroPage";
import { TipoMovimentoPage } from "./pages/TiposMovimentoPage";
// import { Footer } from "./components/footer";

// App.tsx
export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {isLoggedIn ? (
        <>
          <MenuLateral
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <Cabecalho onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex-1 flex overflow-hidden">
              <main className="flex-1 overflow-auto p-4">
                <Routes>
                  <Route path="/" element={<PDVPage />} />
                  <Route path="/produtos" element={<ProdutosViewPage />} />
                  <Route path="/categorias" element={<CategoriasPage />} />
                  <Route
                    path="/formasPagamento"
                    element={<FormasPagamentoPage />}
                  />
                  <Route path="/pedidos" element={<PedidosPage />} />
                  <Route path="/fornecedores" element={<FornecedoresPage />} />
                  <Route path="/contasPagar" element={<ContasPagarPage />} />
                  <Route
                    path="/contasReceber"
                    element={<ContasReceberPage />}
                  />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route
                    path="/tiposMovimento"
                    element={<TipoMovimentoPage />}
                  />
                  <Route
                    path="/resumoFinanceiro"
                    element={<ResumoFinanceiroPage />}
                  />
                </Routes>
              </main>
            </div>
            {/* <Footer></Footer> */}
          </div>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
