import { supabase } from "../lib/subabase";
import {
  ContaReceberType,
  ContaReceberPayloadType,
} from "@/types/contaReceber";

export class ContasReceberServices {
  static async buscarRegistro(p_id: number) {
    if (p_id <= 0) {
      return {
        conta_receber_id: 0,
        forma_pagamento_id: 0,
        vr_liquido: 0.0,
      };
    }

    const { data, error } = await supabase
      .from("contas_receber")
      .select("*")
      .eq("conta_receber_id", p_id)
      .single();

    if (error || !data) {
      return {
        conta_receber_id: 0,
        forma_pagamento_id: 0,
        vr_liquido: 0.0,
      };
    }

    return data;
  }

  static async buscarRegistros(): Promise<ContaReceberType[]> {
    const { data, error } = await supabase
      .from("contas_receber")
      .select(
        "*, formas_pagamento(dsc_forma_pagamento) ,clientes(dsc_razao_social)"
      )
      .order("conta_receber_id", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data;
  }

  //   static async registroEmUso(p_id: number): Promise<boolean> {
  //     const { data, error } = await supabase
  //       .from("produtos")
  //       .select("produto_id")
  //       .eq("categoria_id", p_id)
  //       .limit(1); // Só precisamos saber se existe pelo menos um

  //     if (error) {
  //       return false;
  //     }

  //     return data.length > 0;
  //   }

  static async inserir(
    payload: ContaReceberPayloadType
  ): Promise<string | null> {
    const { error } = await supabase.from("contas_receber").insert(payload);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async deletar(p_id: number): Promise<string | null> {
    const { error } = await supabase
      .from("contas_receber")
      .delete()
      .eq("conta_receber_id", p_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async atualizar(
    payload: ContaReceberPayloadType,
    p_id: number    
  ): Promise<string | null> {
    const { error } = await supabase
      .from("contas_receber")
      .update(payload)
      .eq("conta_receber_id", p_id);

    if (error) {
      return error.message;
    }

    return null;
  }
}
