import { supabase } from "../lib/subabase";
import { CategoriaType } from "@/types/categoria";

export class CategoriaServices {
  static async buscarRegistro(p_id: number) {
    if (p_id <= 0) {
      return {
        categoria_id: 0,
        dsc_categoria: "",
      };
    }

    const { data, error } = await supabase
      .from("categorias")
      .select("categoria_id, dsc_categoria")
      .eq("categoria_id", p_id)
      .single();

    if (error || !data) {
      return {
        categoria_id: 0,
        dsc_categoria: "",
      };
    }

    return data;
  }

  static async buscarRegistros(): Promise<CategoriaType[]> {
    const { data, error } = await supabase
      .from("categorias")
      .select("categoria_id, dsc_categoria")
      .order("dsc_categoria", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data;
  }

  static async verificaDuplicidade(p_dsc: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("categorias")
      .select("categoria_id")
      .eq("dsc_categoria", p_dsc);

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  static async registroEmUso(p_id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from("produtos")
      .select("produto_id")
      .eq("categoria_id", p_id)
      .limit(1); // Só precisamos saber se existe pelo menos um

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  static async inserir(p_dsc_categoria: string): Promise<string | null> {
    const { error } = await supabase
      .from("categorias")
      .insert({ dsc_categoria: p_dsc_categoria });

    if (error) {
      return error.message;
    }

    return null;
  }

  static async deletar(p_id: number): Promise<string | null> {
    const { error } = await supabase
      .from("categorias")
      .delete()
      .eq("categoria_id", p_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async atualizar(
    p_categoria_id: number,
    p_dsc_categoria: string
  ): Promise<string | null> {
    const { error } = await supabase
      .from("categorias")
      .update({ dsc_categoria: p_dsc_categoria })
      .eq("categoria_id", p_categoria_id);

    if (error) {
      return error.message;
    }

    return null;
  }
}
