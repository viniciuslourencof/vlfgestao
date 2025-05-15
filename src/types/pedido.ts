
export type PedidoType = {
  pedido_id: number;
  vr_liquido: number | string;
  cliente_id: number;
  forma_pagamento_id: number;
  dsc_forma_pagamento?: string;  
  dsc_razao_social?: string;  
  dt_inc: string;
    
};

export type PedidoPayloadType = Pick<
  PedidoType,
  'vr_liquido' | 'forma_pagamento_id' | 'cliente_id'
>;

export type PedidoItemType = {
  pedido_item_id: number;
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
  vr_liquido: number | string;
  forma_pagamento_id: number;
  dt_inc: string;
  formas_pagamento?: {
    dsc_forma_pagamento: string;
  };
  clientes?: {
    dsc_razao_social: string;
  };  
};  

export type PedidoItemPayloadType = Pick<
  PedidoItemType,
  'pedido_id' | 'produto_id' | 'quantidade' | 'vr_unit' | 'vr_item'
>;

export type CartPropsType = {  
  carrinho: PedidoItemType[];
  onRemoveItem: (produtoId: number) => void;
  carrinhoMinimizado: boolean;
  setCarrinhoMinimizado: (minimized: boolean) => void;
  limpaCarrinho: () => void; //
}
  

