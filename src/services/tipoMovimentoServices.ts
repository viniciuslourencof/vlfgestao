import { supabase } from "../lib/subabase";
import { TipoMovimentoPayloadType, TipoMovimentoType } from "@/types/tiposMovimento";

export class TipoMovimentoServices {
  static async buscarRegistro(p_id: number) {
    if (p_id <= 0) {
      return {
        tipo_movimento_id: 0,
        dsc_tipo_movimento: "",
      };
    }

    const { data, error } = await supabase
      .from("tipos_movimento")
      .select("*")
      .eq("tipo_movimento_id", p_id)
      .single();

    if (error || !data) {
      return {
        tipo_movimento_id: 0,
        dsc_tipo_movimento: "",
      };
    }

    return data;
  }

  static async buscarRegistros(): Promise<TipoMovimentoType[]> {
    const { data, error } = await supabase
      .from("tipos_movimento")
      .select("*")
      .order("dsc_tipo_movimento", { ascending: true });

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
      .from("tipos_movimento")
      .select("tipo_movimento_id")
      .eq("dsc_tipo_movimento", p_dsc)
      .neq("tipo_movimento_id", p_id);

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  static async registroEmUso(p_id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from("pedidos")
      .select("pedido_id")
      .eq("tipo_movimento_id", p_id)
      .limit(1); // Só precisamos saber se existe pelo menos um

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  static async inserir(payload: TipoMovimentoPayloadType): Promise<string | null> {
    const { error } = await supabase.from("tipos_movimento").insert(payload);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async deletar(p_id: number): Promise<string | null> {
    const { error } = await supabase
      .from("tipos_movimento")
      .delete()
      .eq("tipo_movimento_id", p_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async atualizar(
    tipo_movimento_id: number,
    payload: TipoMovimentoPayloadType
  ): Promise<string | null> {
    const { error } = await supabase
      .from("tipos_movimento")
      .update(payload)
      .eq("tipo_movimento_id", tipo_movimento_id);

    if (error) {
      return error.message;
    }

    return null;
  }
}
