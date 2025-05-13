import { supabase } from "../lib/subabase"; 
import { CategoriaType } from "@/types/categoria"; 

export class CategoriaServices {
  static async buscarCategoria(p_categoria_id: number) {
    // Verifica se o id é válido antes de realizar a consulta
    if (p_categoria_id <= 0) {
      return {
        categoria_id: 0,
        dsc_categoria: "",
      };
    }

    const { data, error } = await supabase
      .from("categorias")
      .select("categoria_id, dsc_categoria")
      .eq("categoria_id", p_categoria_id)
      .single();

    if (error || !data) {
      return {
        categoria_id: 0,
        dsc_categoria: "",
      };
    }

    return data;
  }

  static async buscarCategorias(): Promise<CategoriaType[]> {
    const { data, error } = await supabase
      .from("categorias")
      .select("categoria_id, dsc_categoria")
      .order("dsc_categoria", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data;
  }
}
