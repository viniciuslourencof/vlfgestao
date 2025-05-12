// HomePage.tsx
import { useEffect, useState } from "react";
import { CategoryFilter } from "../components/category-filter";
import { Cart } from "../components/cart"; // Importando o componente Cart
import { ShoppingCart } from "lucide-react";
import { supabase } from "../lib/subabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSearch } from "@/components/search-provider"; // ajuste o caminho se necessário
import ModalAviso from "@/components/modal-aviso";

interface CategoriaInterface {
  categoria_id: number | null;
  dsc_categoria: string;
}

interface ProdutoInterface {
  produto_id: number;
  dsc_produto: string;
  preco_venda1: number;
  desconto: number;
}

interface CarrinhoItemInterface {
  produto_id: number;
  dsc_produto: string;
  preco_venda1: number;
  quantidade: number;
}

export function HomePage() {
  const [categorias, setCategorias] = useState<CategoriaInterface[]>([]);
  const [produtos, setProdutos] = useState<ProdutoInterface[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    number | null
  >(null);
  const [carrinho, setCarrinho] = useState<CarrinhoItemInterface[]>([]); // Inicialização correta
  const [minimized, setMinimized] = useState(true);
  const { searchQuery } = useSearch(); // Agora você usa o valor global
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

  useEffect(() => {
    async function fetchCategorias() {
      const { data, error } = await supabase.from("categorias").select("*");
      if (data) {
        setCategorias([
          { categoria_id: null, dsc_categoria: "Todos" },
          ...data,
        ]);
      } else {
        setMensagemAviso("Erro ao carregar categorias: " + error.message);
        setMostrarAviso(true);
      }
    }

    fetchCategorias();
    selecionarCategoria(categoriaSelecionada); // Filtro inicial
  }, [categoriaSelecionada]); // Dependendo da categoria e busca

  async function selecionarCategoria(categoria_id: number | null) {
    let query = supabase
      .from("produtos")
      .select("produto_id, dsc_produto, preco_venda1, desconto");

    if (categoria_id) {
      query = query.eq("categoria_id", categoria_id);
    }

    const { data } = await query;
    if (data) {
      setProdutos(data);
    } else {
      console.error("Erro ao carregar registros");
    }
  }

  function adicionarAoCarrinho(produto: ProdutoInterface) {
    setCarrinho((prevCarrinho) => {
      const produtoExistente = prevCarrinho.find(
        (item) => item.produto_id === produto.produto_id
      );

      if (produtoExistente) {
        return prevCarrinho.map((item) =>
          item.produto_id === produto.produto_id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [...prevCarrinho, { ...produto, quantidade: 1 }];
      }
    });
    setMinimized(false); // <-- abre o carrinho
  }

  function removerDoCarrinho(produtoId: number) {
    setCarrinho((prevCarrinho) =>
      prevCarrinho.filter((item) => item.produto_id !== produtoId)
    );
  }

  const produtosFiltrados = produtos.filter((produto) =>
    produto.dsc_produto.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <CategoryFilter
        categorias={categorias}
        categoriaSelecionada={categoriaSelecionada}
        onSelectCategoria={setCategoriaSelecionada} // Passa a função para atualizar categoria
      />
      <div
        className={`transition-all duration-300 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 ${
          !minimized ? "xl:pr-[400px]" : ""
        }`}
      >
        {produtosFiltrados.map((produto) => (
          <Card
            key={produto.produto_id}
            className="bg-white rounded-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer p-0"
            onClick={() => adicionarAoCarrinho(produto)}
          >
            {/* <img
              src="https://via.placeholder.com/300" // Substitua com a URL da imagem do produto
              alt={produto.dsc_produto}
              className="w-full h-48 object-cover rounded-t-lg"
            /> */}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{produto.dsc_produto}</h3>
              {/* <p className="text-gray-500 text-sm">
                Preço: R${produto.preco_venda1.toFixed(2)}
              </p> */}
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

      <div className="fixed top-0 right-0 h-full z-50">
        <Cart
          carrinho={carrinho}
          onRemoveItem={removerDoCarrinho}
          minimized={minimized}
          setMinimized={setMinimized}
        />
      </div>

      {minimized && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMinimized(false)}
          className="fixed top-20 right-4 z-50 bg-gray-300 w-14 h-14 shadow-lg hover:bg-gray-400 cursor-pointer flex items-center justify-center"
        >
          <ShoppingCart className="w-8 h-8 text-gray-600" />
        </Button>
      )}
      <ModalAviso
        open={mostrarAviso}
        onClose={setMostrarAviso}
        mensagem={mensagemAviso}
      />
    </>
  );
}

