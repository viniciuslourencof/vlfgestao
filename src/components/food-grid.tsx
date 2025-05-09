import { FoodCard } from "./food-card";
import { useEffect, useState } from "react";
import { supabase } from "../lib/subabase";

export function FoodGrid() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    getProdutos();
  }, []);

  async function getProdutos() {
    const { data } = await supabase.from("produtos").select(`
          dsc_produto,
          preco_venda1,
          desconto
        `);
    setProdutos(data);
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {produtos.map((produto, index) => (
        <FoodCard key={index} {...produto} />
      ))}
    </div>
  );
}
