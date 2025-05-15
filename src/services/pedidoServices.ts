import { supabase } from "../lib/subabase";
import { PedidoItemPayloadType, PedidoPayloadType, PedidoType } from "@/types/pedido";
import { PedidoItemServices } from "./pedidoItemServices";

export class PedidoServices {
  static async buscarRegistros(): Promise<PedidoType[]> {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*, formas_pagamento(dsc_forma_pagamento), clientes(dsc_razao_social)")
      .order("pedido_id", { ascending: false });

    if (error || !data) {
      console.error("Erro ao buscar pedidos:", error);
      return [];
    }

    return data;
  }

  static async inserir(payload: PedidoPayloadType): Promise<string | null> {
    const { error } = await supabase.from("pedidos").insert(payload);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async inserirComRetorno(
    payload: PedidoPayloadType
  ): Promise<{ pedido?: PedidoType; erro?: string | null }> {
    const { data, error } = await supabase
      .from("pedidos")
      .insert(payload)
      .select("*") // ou selecione campos específicos se preferir
      .single();

    if (error || !data) {
      return { erro: error?.message ?? "Erro ao inserir pedido" };
    }

    return { pedido: data, erro: null };
  }

  static async atualizar(
    payload: PedidoPayloadType,
    p_pedido_id: number
  ): Promise<string | null> {
    const { error } = await supabase
      .from("pedidos")
      .update(payload)
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
    carrinho: PedidoItemPayloadType[],
    payloadPedido: PedidoPayloadType
  ): Promise<{ erro: string | null; pedido_id?: number }> {
    if (!carrinho || carrinho.length === 0) {
      return { erro: "Nenhum item encontrado no pedido." };
    }

    if (
      !payloadPedido.forma_pagamento_id ||
      payloadPedido.forma_pagamento_id === 0
    ) {
      return { erro: "Forma de Pagamento não selecionada, verifique." };
    }

    const subtotal = carrinho.reduce(
      (acc, item) => acc + item.vr_unit * item.quantidade,
      0
    );

    payloadPedido.vr_liquido = subtotal;

    const { pedido, erro } = await PedidoServices.inserirComRetorno(
      payloadPedido
    );

    if (erro || !pedido) {
      return { erro: "Erro ao inserir pedido: " + erro };
    }

    const itens: PedidoItemPayloadType[] = carrinho.map((item): PedidoItemPayloadType => ({ 
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
