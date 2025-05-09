import { useEffect, useState } from "react";
import { CategoryFilter } from "../components/category-filter";
import { FoodGrid } from "../components/food-grid";
import { supabase } from "../lib/subabase";

// Definindo o tipo para as categorias
interface Categoria {
  categoria_id: number | null;
  dsc_categoria: string;
}

// Definindo o tipo para os produtos
interface Produto {
  produto_id: number;
  dsc_produto: string;
  preco_venda1: number;
  desconto: number;
}

export function HomePage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCategorias() {
      const { data, error } = await supabase.from("categorias").select("*");
      if (data) {
        setCategorias([{ categoria_id: null, dsc_categoria: "Todos" }, ...data]);
      } else {
        console.error("Erro ao carregar categorias:", error);
      }
    }

    fetchCategorias();
    buscarProdutos(); // busca inicial com todos os produtos
  }, []);

  async function buscarProdutos(categoria_id: number | null = null) {
    let query = supabase
      .from("produtos")
      .select("produto_id, dsc_produto, preco_venda1, desconto");

    if (categoria_id) {
      query = query.eq("categoria_id", categoria_id);
    }

    const { data } = await query;
    // Verificando se 'data' não é null
    if (data) {
      setProdutos(data);
    } else {
      console.error("Erro ao carregar produtos");
    }
    setCategoriaSelecionada(categoria_id);
  }

  return (
    <>
      <CategoryFilter
        categorias={categorias}
        categoriaSelecionada={categoriaSelecionada}
        onSelectCategoria={buscarProdutos}
      />
      <FoodGrid produtos={produtos} />
    </>
  );
}
