import { ProdutoInterface } from "@/types/produto";

export interface CarrinhoItemInterface extends ProdutoInterface {
  quantidade: number;
}

export type PedidoType = {
  pedido_id: number;
  vr_liquido: number;
  forma_pagamento_id: number;
};

export interface PedidoInterface {
  pedido_id: number;
  vr_liquido: number;
  forma_pagamento_id: number;  
}

export interface PedidoItemInterface {
  pedido_item_id: number;
  pedido_id: number;
  produto_id: number;
  quantidade: number;
  vr_unitario: number;
  vr_total: number;
  produtos: {
    dsc_produto: string;
  };
}
