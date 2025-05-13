
export type PedidoType = {
  pedido_id: number;
  vr_liquido: number;
  forma_pagamento_id: number;
  dsc_forma_pagamento?: string;  
  dt_inc: string;
    
};

export type PedidoItemType = {
  pedido_item_id?: number;
  pedido_id: number;
  produto_id: number;
  quantidade: number;
  vr_unit: number;
  vr_item: number;
  produtos?: {
    dsc_produto: string;
  };
}

export type PedidoComRelacionamentoType = {
  pedido_id: number;
  vr_liquido: number;
  forma_pagamento_id: number;
  dt_inc: string;
  formas_pagamento?: {
    dsc_forma_pagamento: string;
  };
};  

export type CartPropsType = {
  carrinho: PedidoItemType[];
  onRemoveItem: (produtoId: number) => void;
  carrinhoMinimizado: boolean;
  setMinimized: (minimized: boolean) => void;
  limpaCarrinho: () => void; //
}
  

