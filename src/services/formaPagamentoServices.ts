import { supabase } from "../lib/subabase"; 
import { FormaPagamentoType } from "@/types/formaPagamento"; 

export class FormaPagamentoServices {
  static async buscarFormaPagamento(p_forma_pagamento_id: number) {
    // Verifica se o id é válido antes de realizar a consulta
    if (p_forma_pagamento_id <= 0) {
      return {
        forma_pagamento_id: 0,
        dsc_forma_pagamento: "",
      };
    }

    const { data, error } = await supabase
      .from("formas_pagamento")
      .select("forma_pagamento_id, dsc_forma_pagamento")
      .eq("forma_pagamento_id", p_forma_pagamento_id)
      .single();

    if (error || !data) {
      return {
        forma_pagamento_id: 0,
        dsc_forma_pagamento: "",
      };
    }

    return data;
  }

  static async buscarFormasPagamento(): Promise<FormaPagamentoType[]> {
    const { data, error } = await supabase
      .from("formas_pagamento")
      .select("forma_pagamento_id, dsc_forma_pagamento")
      .order("forma_pagamento_id", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data;
  }
}
