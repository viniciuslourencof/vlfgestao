import { ProdutoInterface } from "@/types/produto";
import { PedidoInterface } from "@/types/pedido";
import { supabase } from "../lib/subabase";
import { PedidoItemInterface } from "@/types/pedido";

type CarrinhoItem = ProdutoInterface & { quantidade: number };

export class PedidoServices {
  static adicionar(
    carrinhoAtual: CarrinhoItem[],
    produto: ProdutoInterface
  ): CarrinhoItem[] {
    const produtoExistente = carrinhoAtual.find(
      (item) => item.produto_id === produto.produto_id
    );

    if (produtoExistente) {
      return carrinhoAtual.map((item) =>
        item.produto_id === produto.produto_id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      );
    } else {
      return [...carrinhoAtual, { ...produto, quantidade: 1 }];
    }
  }

  static async buscarPedidos(): Promise<PedidoInterface[]> {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("pedido_id", { ascending: false });

    if (error || !data) {
      console.error("Erro ao buscar pedidos:", error);
      return [];
    }

    return data;
  }

  static async buscarItensDoPedido(
    pedido_id: number
  ): Promise<PedidoItemInterface[]> {
    const { data, error } = await supabase
      .from("pedidos_itens")
      .select("*, produtos(dsc_produto)")
      .eq("pedido_id", pedido_id);

    if (error) {
      console.error("Erro ao buscar itens do pedido:", error.message);
      return [];
    }

    return data as PedidoItemInterface[];
  }

  // static async buscarItensDoPedido(
  //   pedido_id: number
  // ): Promise<PedidoItemInterface[]> {
  //   const { data, error } = await supabase
  //     .from("pedidos_itens")
  //     .select(
  //       `
  //     pedido_item_id,
  //     pedido_id,
  //     produto_id,
  //     quantidade,
  //     vr_unitario,
  //     vr_total,
  //     produtos (dsc_produto)
  //   `
  //     )
  //     .eq("pedido_id", pedido_id);

  //   if (error) {
  //     console.error("Erro ao buscar itens do pedido:", error.message);
  //     return [];
  //   }

  //   return data as PedidoItemInterface[];
  // }
}
