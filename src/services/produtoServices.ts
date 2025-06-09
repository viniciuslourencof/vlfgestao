import { supabase } from "../lib/subabase";
import { ProdutoPayloadType, ProdutoType } from "@/types/produto";

export class ProdutoServices {
  static async buscarRegistros(): Promise<ProdutoType[]> {
    const { data, error } = await supabase
      .from("produtos")
      .select("*, categorias(dsc_categoria)")
      .order("produto_id", { ascending: false });

    if (error || !data) {
      console.error("Erro ao buscar registros:", error);
      return [];
    }

    return data;
  }

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

  static async buscarRegistrosPorNome(termo: string): Promise<ProdutoType[]> {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .ilike("dsc_produto", `%${termo}%`)
      .order("dsc_produto", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data;
  }

  static async buscarRegistrosPorCategoria(
    p_categoria_id: number | null
  ): Promise<ProdutoType[]> {
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

  static async inserirComRetorno(
    payload: ProdutoPayloadType
  ): Promise<{ registro?: ProdutoType; error?: string | null }> {
    const { data, error } = await supabase
      .from("produtos")
      .insert(payload)
      .select("*")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Erro ao inserir registro" };
    }

    return { registro: data, error: null };
  }

    static async atualizar(
      payload: ProdutoPayloadType,
      p_id: number
    ): Promise<string | null> {
      const { error } = await supabase
        .from("produtos")
        .update(payload)
        .eq("produto_id", p_id);
  
      if (error) {
        return error.message;
      }
  
      return null;
    }
  
}
