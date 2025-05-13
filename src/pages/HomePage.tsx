import { useEffect, useState } from "react";
import { CategoryFilter } from "../components/category-filter";
import { Cart } from "../components/cart"; // Importando o componente Cart
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ProdutoInterface } from "../types/produto";
import { CategoriaType } from "../types/categoria";
import { PedidoItemType } from "../types/pedido";
import { CategoriaServices } from "../services/categoriaServices";
import { ProdutoServices } from "../services/produtoServices";
import { PedidoItemServices } from "@/services/pedidoItemServices";

export function HomePage() {
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [produtos, setProdutos] = useState<ProdutoInterface[]>([]);
  const [categoriaSelecionadaID, setCategoriaSelecionada] = useState<
    number | null
  >(null);
  const [carrinho, setCarrinho] = useState<PedidoItemType[]>([]); // Inicialização correta
  const [carrinhoMinimizado, setCarrinhoMinimizado] = useState(true);
  const [textoPesquisa, setTextoPesquisa] = useState<string>("");

  function limpaCarrinho() {
    setCarrinho([]);
  }

  const FiltrarProdutos = async () => {
    const resultado = await ProdutoServices.buscaProdutosPorCategoria(
      categoriaSelecionadaID
    );
    setProdutos(resultado);
  };

  const carregarCategorias = async () => {
    const resultado = await CategoriaServices.buscarRegistros();

    if (resultado) {
      setCategorias([
        { categoria_id: 0, dsc_categoria: "Todos" },
        ...resultado,
      ]);
    }
  };

  useEffect(() => {
    carregarCategorias();
    FiltrarProdutos();
  }, [categoriaSelecionadaID]); // Dependendo da categoria e busca

  function adicionarAoCarrinho(produto: ProdutoInterface) {
    setCarrinho((prevCarrinho) => {
      const novoCarrinho = PedidoItemServices.inserirNoCarrinho(prevCarrinho, produto);

      if (screen.width > 640 && screen.height > 480) {
        setCarrinhoMinimizado(false);
      }

      return novoCarrinho;
    });
  }

  function removerDoCarrinho(produtoId: number) {
    setCarrinho((prevCarrinho) =>
      prevCarrinho.filter((item) => item.produto_id !== produtoId)
    );
  }

  const produtosFiltrados = produtos.filter((produto) =>
    produto.dsc_produto.toLowerCase().includes(textoPesquisa.toLowerCase())
  );  

  function ListaRegistros() {
    return (
      <>
        <div className="px-6 pt-6">
          <h1 className="text-2xl font-bold">PDV</h1>
          <Input
            type="text"
            placeholder="Pesquisar registros..."
            className="w-full my-4 bg-white "
            value={textoPesquisa}
            onChange={(e) => setTextoPesquisa(e.target.value)}
          />
          <CategoryFilter
            categorias={categorias}
            categoriaSelecionadaID={categoriaSelecionadaID}
            onSelectCategoria={setCategoriaSelecionada}
          />
        </div>

        <div
          className={`transition-all duration-300 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 ${
            !carrinhoMinimizado ? "xl:pr-[400px]" : ""
          }`}
        >
          {produtosFiltrados.map((produto) => (
            <Card
              key={produto.produto_id}
              className="bg-white rounded-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer p-0"
              onClick={() => adicionarAoCarrinho(produto)}
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold">{produto.dsc_produto}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600 font-semibold">
                    R$ {produto.preco_venda1.toFixed(2)}
                  </span>
                  {produto.desconto > 0 && (
                    <span className="text-sm text-gray-500">
                      {produto.desconto}% DESC.
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {ListaRegistros()}

      <div className="fixed top-0 right-0 h-full z-50">
        <Cart
          carrinho={carrinho}
          onRemoveItem={removerDoCarrinho}
          carrinhoMinimizado={carrinhoMinimizado}
          setMinimized={setCarrinhoMinimizado}
          limpaCarrinho={limpaCarrinho}
        />
      </div>

      {carrinhoMinimizado && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCarrinhoMinimizado(false)}
          className="fixed top-20 right-4 z-50 bg-gray-300 w-11 h-11 shadow-lg hover:bg-gray-400 cursor-pointer flex items-center justify-center"
        >
          <ShoppingCart className="w-8 h-8 text-gray-600" />
          {carrinho.length > 0 && (
            <span className="absolute bottom-7 right-0 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {carrinho.length}
            </span>
          )}
        </Button>
      )}
    </>
  );
}
