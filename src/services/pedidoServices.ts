import { supabase } from "../lib/subabase";
import { PedidoItemType, PedidoType } from "@/types/pedido";
import { PedidoItemServices } from "./pedidoItemServices";

export class PedidoServices {
  static async buscarRegistros(): Promise<PedidoType[]> {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*, formas_pagamento(dsc_forma_pagamento)")
      .order("pedido_id", { ascending: false });

    if (error || !data) {
      console.error("Erro ao buscar pedidos:", error);
      return [];
    }

    return data;
  }

  static async inserir(
    p_vr_liquido: number,
    p_forma_pagamento_id: number
  ): Promise<string | null> {
    const { error } = await supabase.from("pedidos").insert({
      vr_liquido: p_vr_liquido,
      forma_pagamento_id: p_forma_pagamento_id,
    });

    if (error) {
      return error.message;
    }

    return null;
  }

  static async inserirComRetorno(
    p_vr_liquido: number,
    p_forma_pagamento_id: number
  ): Promise<{ pedido?: PedidoType; erro?: string | null }> {
    const { data, error } = await supabase
      .from("pedidos")
      .insert({
        vr_liquido: p_vr_liquido,
        forma_pagamento_id: p_forma_pagamento_id,
      })
      .select("*") // ou selecione campos específicos se preferir
      .single();

    if (error || !data) {
      return { erro: error?.message ?? "Erro ao inserir pedido" };
    }

    return { pedido: data, erro: null };
  }

  static async atualizar(
    p_pedido_id: number,
    p_vr_liquido: number,
    p_forma_pagamento_id: number
  ): Promise<string | null> {
    const { error } = await supabase
      .from("pedidos")
      .update({
        vr_liquido: p_vr_liquido,
        forma_pagamento_id: p_forma_pagamento_id,
      })
      .eq("pedido_id", p_pedido_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async deletar(p_id: number): Promise<string | null> {
    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("pedido_id", p_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async efetivarPedido(
    carrinho: PedidoItemType[],
    forma_pagamento_id: number
  ): Promise<{ erro: string | null; pedido_id?: number }> {
    if (!carrinho || carrinho.length === 0) {
      return { erro: "Nenhum item encontrado no pedido." };
    }

    if (!forma_pagamento_id || forma_pagamento_id === 0) {
      return { erro: "Forma de Pagamento não selecionada, verifique." };
    }

    const subtotal = carrinho.reduce(
      (acc, item) => acc + item.vr_unit * item.quantidade,
      0
    );

    const { pedido, erro } = await PedidoServices.inserirComRetorno(
      subtotal,
      forma_pagamento_id
    );

    if (erro || !pedido) {
      return { erro: "Erro ao inserir pedido: " + erro };
    }

    const itens = carrinho.map((item) => ({
      pedido_id: pedido.pedido_id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      vr_unit: item.vr_unit,
      vr_item: item.vr_unit * item.quantidade,
    }));

    const itensError = await PedidoItemServices.inserir(itens);

    if (itensError) {
      return { erro: "Erro ao inserir itens do pedido: " + itensError };
    }

    return { erro: null, pedido_id: pedido.pedido_id };
  }
}
