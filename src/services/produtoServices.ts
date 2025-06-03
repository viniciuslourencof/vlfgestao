import { supabase } from "../lib/subabase";
import { ProdutoInterface } from "@/types/produto";

export class ProdutoServices {
  static async buscarRegistro(p_id: number) {
    if (p_id <= 0) {
      return {
        produto_id: 0,
        dsc_produto: "",
      };
    }

    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("produto_id", p_id)
      .single();

    if (error || !data) {
      return {
        produto_id: 0,
        dsc_produto: "",
      };
    }

    return data;
  }

  static async buscaProdutosPorCategoria(
    p_categoria_id: number | null
  ): Promise<ProdutoInterface[]> {
    let query = supabase
      .from("produtos")
      .select("*")
      .order("dsc_produto", { ascending: true }); 

    if (p_categoria_id) {
      query = query.eq("categoria_id", p_categoria_id);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data;
  }
}
