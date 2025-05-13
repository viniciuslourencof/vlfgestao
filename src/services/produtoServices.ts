import { supabase } from "../lib/subabase"; 
import { ProdutoInterface } from "@/types/produto"; 

export class ProdutoServices {  

  static async buscaProdutosPorCategoria(p_categoria_id: number | null): Promise<ProdutoInterface[]> {    
    let query = supabase
      .from("produtos")
      .select("*");

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
