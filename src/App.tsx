import { SidebarNav } from "./components/sidebar-nav"
import { Header } from "./components/header"
import { Cart } from "./components/cart"
import { Footer } from "./components/footer"
import { Routes, Route } from "react-router-dom"
import { HomePage } from "./pages/HomePage"
import { ProdutosViewPage } from "./pages/ProdutosViewPage"

export function App() {
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
            </Routes>
          </main>
          <Cart />
        </div>
        {/* <Footer /> */}
      </div>
    </div>
  )
}

export default App;