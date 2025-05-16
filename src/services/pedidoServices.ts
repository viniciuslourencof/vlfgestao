import { supabase } from "../lib/subabase";
import {
  PedidoItemPayloadType,
  PedidoPayloadType,
  PedidoType,
} from "@/types/pedido";
import { PedidoItemServices } from "./pedidoItemServices";
import { ContasReceberServices } from "./contaReceberServices";

export class PedidoServices {
  static async buscarRegistros(): Promise<PedidoType[]> {
    const { data, error } = await supabase
      .from("pedidos")
      .select(
        "*, formas_pagamento(dsc_forma_pagamento), clientes(dsc_razao_social)"
      )
      .order("pedido_id", { ascending: false });

    if (error || !data) {
      console.error("Erro ao buscar pedidos:", error);
      return [];
    }

    return data;
  }

  static async registroEmUso(p_id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from("contas_receber")
      .select("conta_receber_id")
      .eq("pedido_id", p_id)
      .limit(1); // 

    if (error) {
      return false;
    }

    return data.length > 0;
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
    payload_itens: PedidoItemPayloadType[],
    payload_pedidos: PedidoPayloadType
  ): Promise<{ erro: string | null; pedido_id?: number }> {
    if (!payload_itens || payload_itens.length === 0) {
      return { erro: "Nenhum item encontrado no pedido." };
    }

    if (
      !payload_pedidos.forma_pagamento_id ||
      payload_pedidos.forma_pagamento_id === 0
    ) {
      return { erro: "Forma de Pagamento não selecionada, verifique." };
    }

    const subtotal = payload_itens.reduce(
      (acc, item) => acc + item.vr_unit * item.quantidade,
      0
    );

    payload_pedidos.vr_liquido = subtotal;

    const { pedido, erro } = await PedidoServices.inserirComRetorno(
      payload_pedidos
    );

    if (erro || !pedido) {
      return { erro: "Erro ao inserir pedido: " + erro };
    }

    const itens: PedidoItemPayloadType[] = payload_itens.map(
      (item): PedidoItemPayloadType => ({
        pedido_id: pedido.pedido_id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        vr_unit: item.vr_unit,
        vr_item: item.vr_unit * item.quantidade,
      })
    );

    const itensError = await PedidoItemServices.inserir(itens);

    if (itensError) {
      return { erro: "Erro ao inserir itens do pedido: " + itensError };
    }

    if (payload_pedidos.forma_pagamento_id !== 0) {
      ContasReceberServices.inserir({
        cliente_id: payload_pedidos.cliente_id,
        forma_pagamento_id: payload_pedidos.forma_pagamento_id,
        vr_liquido: payload_pedidos.vr_liquido,
        pedido_id: pedido.pedido_id,
      });
    }

    return { erro: null, pedido_id: pedido.pedido_id };
  }
}
