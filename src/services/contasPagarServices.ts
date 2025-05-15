import { supabase } from "../lib/subabase";
import { ContaPagarType, ContaPagarPayloadType } from "@/types/contasPagar";

export class ContasPagarServices {
  static async buscarRegistro(p_id: number) {
    if (p_id <= 0) {
      return {
        conta_pagar_id: 0,
        fornecedor_id: 0,
        forma_pagamento_id: 0,
        vr_liquido: 0.0,
      };
    }

    const { data, error } = await supabase
      .from("contas_pagar")
      .select("*")
      .eq("conta_pagar_id", p_id)
      .single();

    if (error || !data) {
      return {
        conta_pagar_id: 0,
        fornecedor_id: 0,
        forma_pagamento_id: 0,
        vr_liquido: 0.0,
      };
    }

    return data;
  }

  static async buscarRegistros(): Promise<ContaPagarType[]> {
    const { data, error } = await supabase
      .from("contas_pagar")
      .select(
        "*, formas_pagamento(dsc_forma_pagamento), fornecedores(dsc_razao_social)"
      )
      .order("conta_pagar_id", { ascending: false });

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

  static async inserir(payload: ContaPagarPayloadType): Promise<string | null> {
    const { error } = await supabase.from("contas_pagar").insert(payload);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async deletar(p_id: number): Promise<string | null> {
    const { error } = await supabase
      .from("contas_pagar")
      .delete()
      .eq("conta_pagar_id", p_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async atualizar(
    payload: ContaPagarPayloadType,
    p_id: number,
  ): Promise<string | null> {
    const { error } = await supabase
      .from("contas_pagar")
      .update(payload)
      .eq("conta_pagar_id", p_id);

    if (error) {
      return error.message;
    }

    return null;
  }
}
