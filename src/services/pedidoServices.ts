import { ProdutoInterface } from "@/types/produto";
import { supabase } from "../lib/subabase";
import { PedidoType, PedidoItemType } from "@/types/pedido";

export class PedidoServices {
  static adicionar(
    carrinhoAtual: PedidoItemType[],
    produto: ProdutoInterface
  ): PedidoItemType[] {
    const produtoExistente = carrinhoAtual.find(
      (item) => item.produto_id === produto.produto_id
    );

    if (produtoExistente) {
      return carrinhoAtual.map((item) =>
        item.produto_id === produto.produto_id
          ? {
              ...item,
              quantidade: item.quantidade + 1,
              vr_item: (item.quantidade + 1) * item.vr_unit,
            }
          : item
      );
    } else {
      const novoItem: PedidoItemType = {
        pedido_item_id: 0, // valor padrão, você pode mudar quando salvar no banco
        pedido_id: 0, // idem acima
        produto_id: produto.produto_id,
        quantidade: 1,
        vr_unit: produto.preco_venda1,
        vr_item: produto.preco_venda1,
        produtos: {
          dsc_produto: produto.dsc_produto,
        },
      };

      return [...carrinhoAtual, novoItem];
    }
  }

  static async buscarPedidos(): Promise<PedidoType[]> {
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

  static async buscarItensDoPedido(
    pedido_id: number
  ): Promise<PedidoItemType[]> {
    const { data, error } = await supabase
      .from("pedidos_itens")
      .select("*, produtos(dsc_produto)")
      .eq("pedido_id", pedido_id);

    if (error) {
      console.error("Erro ao buscar itens do pedido:", error.message);
      return [];
    }

    return data as PedidoItemType[];
  }
}
