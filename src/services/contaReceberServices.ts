import { supabase } from "../lib/subabase";
import { ContaReceberType } from "@/types/contaReceber";

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
      .select('*, formas_pagamento(dsc_forma_pagamento) ,clientes(dsc_razao_social)')
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
    p_cliente_id: number,
    p_forma_pagamento_id: number,
    p_vr_liquido: number
  ): Promise<string | null> {
    const { error } = await supabase.from("contas_receber").insert({      
      cliente_id: p_cliente_id,
      forma_pagamento_id: p_forma_pagamento_id,
      vr_liquido: p_vr_liquido,
    });

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
    p_conta_receber_id: number,    
    p_cliente_id: number,
    p_forma_pagamento_id: number,
    p_vr_liquido: number
  ): Promise<string | null> {
    const { error } = await supabase
      .from("contas_receber")
      .update({        
        cliente_id: p_cliente_id,
        forma_pagamento_id: p_forma_pagamento_id,
        vr_liquido: p_vr_liquido,
      })
      .eq("conta_receber_id", p_conta_receber_id);

    if (error) {
      return error.message;
    }

    return null;
  }
}
