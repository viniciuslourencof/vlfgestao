import { supabase } from "../lib/subabase";
import { ProdutoComposicaoType, ProdutoComposicaoPayloadType } from "@/types/produto";

export class ProdutoComposicaoServices {
  static async buscarRegistros(p_pedido_id: number): Promise<ProdutoComposicaoType[]> {
    const { data, error } = await supabase
      .from("pedidos_itens")
      .select("*, produtos(dsc_produto)")
      .eq("pedido_id", p_pedido_id);

    if (error) {
      console.error("Erro ao buscar itens do pedido:", error.message);
      return [];
    }

    return data as ProdutoComposicaoType[];
  }

  static async inserir(
    payload: ProdutoComposicaoPayloadType | ProdutoComposicaoPayloadType[]
  ): Promise<string | null> {
    const { error } = await supabase.from("pedidos_itens").insert(payload);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async deletar(p_id: number): Promise<string | null> {
    const { error } = await supabase
      .from("pedidos_itens")
      .delete()
      .eq("pedido_item_id", p_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async atualizar(
    payload: ProdutoComposicaoPayloadType,
    pedido_item_id: number
  ): Promise<string | null> {
    const { error } = await supabase
      .from("pedidos_itens")
      .update(payload)
      .eq("pedido_item_id", pedido_item_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  
}
