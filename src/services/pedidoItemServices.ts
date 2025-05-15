import { ProdutoInterface } from "@/types/produto";
import { supabase } from "../lib/subabase";
import { PedidoItemType, PedidoItemPayloadType } from "@/types/pedido";

export class PedidoItemServices {
  static async inserir(payload: PedidoItemPayloadType[]): Promise<string | null> {
    const { error } = await supabase.from("pedidos_itens").insert(payload);

    if (error) {
      return error.message;
    }

    return null;
  }

  static inserirNoCarrinho(
    p_carrinhoAtual: PedidoItemType[],
    p_produto: ProdutoInterface
  ): PedidoItemType[] {
    const produtoExistente = p_carrinhoAtual.find(
      (item) => item.produto_id === p_produto.produto_id
    );

    if (produtoExistente) {
      return p_carrinhoAtual.map((item) =>
        item.produto_id === p_produto.produto_id
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
        produto_id: p_produto.produto_id,
        quantidade: 1,
        vr_unit: p_produto.preco_venda1,
        vr_item: p_produto.preco_venda1,
        produtos: {
          dsc_produto: p_produto.dsc_produto,
        },
      };

      return [...p_carrinhoAtual, novoItem];
    }
  }

  static async buscarRegistros(p_pedido_id: number): Promise<PedidoItemType[]> {
    const { data, error } = await supabase
      .from("pedidos_itens")
      .select("*, produtos(dsc_produto)")
      .eq("pedido_id", p_pedido_id);

    if (error) {
      console.error("Erro ao buscar itens do pedido:", error.message);
      return [];
    }

    return data as PedidoItemType[];
  }
}
