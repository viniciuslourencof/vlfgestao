import { supabase } from "../lib/subabase";
import { FornecedorType } from "@/types/fornecedor";

export class FornecedorServices {
  static async buscarRegistro(p_id: number) {
    if (p_id <= 0) {
      return {
        fornecedor_id: 0,
        dsc_razao_social: "",
        dsc_nome_fantasia: "",
      };
    }

    const { data, error } = await supabase
      .from("fornecedores")
      .select("fornecedor_id, dsc_razao_social, dsc_nome_fantasia")
      .eq("fornecedor_id", p_id)
      .single();

    if (error || !data) {
      return {
        fornecedor_id: 0,
        dsc_razao_social: "",
        dsc_nome_fantasia: "",
      };
    }

    return data;
  }

  static async buscarRegistros(): Promise<FornecedorType[]> {
    const { data, error } = await supabase
      .from("fornecedores")
      .select("fornecedor_id, dsc_razao_social, dsc_nome_fantasia")
      .order("dsc_razao_social", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data;
  }

  static async verificaDuplicidade(p_id: number, p_dsc: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("fornecedores")
      .select("fornecedor_id")
      .eq("dsc_razao_social", p_dsc)
      .neq("fornecedor_id", p_id); 

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  //   static async registroEmUso(p_id: number): Promise<boolean> {
  //     const { data, error } = await supabase
  //       .from("produtos")
  //       .select("produto_id")
  //       .eq("fornecedor_id", p_id)
  //       .limit(1); // Só precisamos saber se existe pelo menos um

  //     if (error) {
  //       return false;
  //     }

  //     return data.length > 0;
  //   }

  static async inserir(
    p_dsc_razao_social: string,
    p_dsc_nome_fantasia: string
  ): Promise<string | null> {
    const { error } = await supabase
      .from("fornecedores")
      .insert({
        dsc_razao_social: p_dsc_razao_social,
        dsc_nome_fantasia: p_dsc_nome_fantasia,
      });

    if (error) {
      return error.message;
    }

    return null;
  }

  static async deletar(p_id: number): Promise<string | null> {
    const { error } = await supabase
      .from("fornecedores")
      .delete()
      .eq("fornecedor_id", p_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async atualizar(
    p_fornecedor_id: number,
    p_dsc_razao_social: string,
    p_dsc_nome_fantasia: string
  ): Promise<string | null> {
    const { error } = await supabase
      .from("fornecedores")
      .update({
        dsc_razao_social: p_dsc_razao_social,
        dsc_nome_fantasia: p_dsc_nome_fantasia,
      })
      .eq("fornecedor_id", p_fornecedor_id);

    if (error) {
      return error.message;
    }

    return null;
  }
}
