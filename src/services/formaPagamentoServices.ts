import { supabase } from "../lib/subabase";
import { FormaPagamentoType } from "@/types/formaPagamento";

export class FormaPagamentoServices {
  static async buscarRegistro(p_id: number) {
    if (p_id <= 0) {
      return {
        forma_pagamento_id: 0,
        dsc_forma_pagamento: "",
      };
    }

    const { data, error } = await supabase
      .from("formas_pagamento")
      .select("forma_pagamento_id, dsc_forma_pagamento")
      .eq("forma_pagamento_id", p_id)
      .single();

    if (error || !data) {
      return {
        forma_pagamento_id: 0,
        dsc_forma_pagamento: "",
      };
    }

    return data;
  }

  static async buscarRegistros(): Promise<FormaPagamentoType[]> {
    const { data, error } = await supabase
      .from("formas_pagamento")
      .select("*")
      .order("dsc_forma_pagamento", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data;
  }

  static async verificaDuplicidade(p_id: number, p_dsc: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("formas_pagamento")
      .select("forma_pagamento_id")
      .eq("dsc_forma_pagamento", p_dsc)
      .neq("forma_pagamento_id", p_id);

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  static async registroEmUso(p_id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from("pedidos")
      .select("pedido_id")
      .eq("forma_pagamento_id", p_id)
      .limit(1); // Só precisamos saber se existe pelo menos um

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  static async inserir(p_dsc_forma_pagamento: string): Promise<string | null> {
    const { error } = await supabase
      .from("formas_pagamento")
      .insert({ dsc_forma_pagamento: p_dsc_forma_pagamento });

    if (error) {
      return error.message;
    }

    return null;
  }

  static async deletar(p_id: number): Promise<string | null> {
    const { error } = await supabase
      .from("formas_pagamento")
      .delete()
      .eq("forma_pagamento_id", p_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async atualizar(
    p_forma_pagamento_id: number,
    p_dsc_forma_pagamento: string
  ): Promise<string | null> {
    const { error } = await supabase
      .from("formas_pagamento")
      .update({ dsc_forma_pagamento: p_dsc_forma_pagamento })
      .eq("forma_pagamento_id", p_forma_pagamento_id);

    if (error) {
      return error.message;
    }

    return null;
  }
}
