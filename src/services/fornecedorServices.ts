import { supabase } from "../lib/subabase";
import { FornecedorPayloadType, FornecedorType } from "@/types/fornecedor";

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
      .select("*")
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

  static async buscarRegistrosPorNome(
    termo: string
  ): Promise<FornecedorType[]> {
    const { data, error } = await supabase
      .from("fornecedores")
      .select("*")
      .ilike("dsc_razao_social", `%${termo}%`)
      .order("dsc_razao_social", { ascending: true });

    if (error || !data) {
      return [];
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

  static async verificaDuplicidade(
    p_id: number,
    p_dsc: string
  ): Promise<boolean> {
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

  static async registroEmUso(p_id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from("contas_pagar")
      .select("conta_pagar_id")
      .eq("fornecedor_id", p_id)
      .limit(1);

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  static async inserir(payload: FornecedorPayloadType): Promise<string | null> {
    const { error } = await supabase.from("fornecedores").insert(payload);

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
    payload: FornecedorPayloadType,
    p_fornecedor_id: number
  ): Promise<string | null> {
    const { error } = await supabase
      .from("fornecedores")
      .update(payload)
      .eq("fornecedor_id", p_fornecedor_id);

    if (error) {
      return error.message;
    }

    return null;
  }
}
