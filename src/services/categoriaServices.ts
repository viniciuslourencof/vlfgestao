import { supabase } from "../lib/subabase";
import { CategoriaPayloadType, CategoriaType } from "@/types/categoria";

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
      .select("*")
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
      .select("*")
      .order("dsc_categoria", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data;
  }

  static async verificaDuplicidade(
    p_id: number,
    p_dsc: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("categorias")
      .select("categoria_id")
      .eq("dsc_categoria", p_dsc)
      .neq("categoria_id", p_id);

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
      .limit(1); 

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  static async inserir(payload: CategoriaPayloadType): Promise<string | null> {
    const { error } = await supabase.from("categorias").insert(payload);

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
    payload: CategoriaPayloadType
  ): Promise<string | null> {
    const { error } = await supabase
      .from("categorias")
      .update(payload)
      .eq("categoria_id", p_categoria_id);

    if (error) {
      return error.message;
    }

    return null;
  }
}
