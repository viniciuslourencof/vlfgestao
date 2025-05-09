import { useEffect, useState } from "react";
import { CategoryFilter } from "../components/category-filter";
import { FoodGrid } from "../components/food-grid";
import { supabase } from "../lib/subabase";

export function HomePage() {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  useEffect(() => {
    async function fetchCategorias() {
      const { data } = await supabase.from("categorias").select("*");
      setCategorias([{ categoria_id: null, dsc_categoria: "Todos" }, ...data]);
    }

    fetchCategorias();
    buscarProdutos(); // busca inicial com todos
  }, []);

  async function buscarProdutos(categoria_id = null) {
    let query = supabase
      .from("produtos")
      .select("produto_id, dsc_produto, preco_venda1, desconto");

    if (categoria_id) {
      query = query.eq("categoria_id", categoria_id);
    }

    const { data } = await query;
    setProdutos(data);
    setCategoriaSelecionada(categoria_id);

    console.log(categoria_id);
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
