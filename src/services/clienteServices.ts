import { supabase } from "../lib/subabase";
import { ClientePayloadType, ClienteType } from "@/types/cliente";

export class ClienteServices {
  static async buscarRegistro(p_id: number) {
    if (p_id <= 0) {
      return {
        cliente_id: 0,
        dsc_razao_social: "",
        dsc_nome_fantasia: "",
      };
    }

    const { data, error } = await supabase
      .from("clientes")
      .select("cliente_id, dsc_razao_social, dsc_nome_fantasia")
      .eq("cliente_id", p_id)
      .single();

    if (error || !data) {
      return {
        cliente_id: 0,
        dsc_razao_social: "",
        dsc_nome_fantasia: "",
      };
    }

    return data;
  }

  static async buscarRegistros(): Promise<ClienteType[]> {
    const { data, error } = await supabase
      .from("clientes")
      .select("cliente_id, dsc_razao_social, dsc_nome_fantasia")
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
      .from("clientes")
      .select("cliente_id")
      .eq("dsc_razao_social", p_dsc)
      .neq("cliente_id", p_id);

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  static async registroEmUso(p_id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from("contas_receber")
      .select("conta_receber_id")
      .eq("cliente_id", p_id)
      .limit(1); // Só precisamos saber se existe pelo menos um

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  static async inserir(payload: ClientePayloadType): Promise<string | null> {
    const { error } = await supabase.from("clientes").insert(payload);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async deletar(p_id: number): Promise<string | null> {
    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("cliente_id", p_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async atualizar(
    payload: ClientePayloadType,
    p_cliente_id: number
  ): Promise<string | null> {
    const { error } = await supabase
      .from("clientes")
      .update(payload)
      .eq("cliente_id", p_cliente_id);

    if (error) {
      return error.message;
    }

    return null;
  }
}
