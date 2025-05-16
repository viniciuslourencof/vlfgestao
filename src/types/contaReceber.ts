export type ContaReceberType = {
  conta_receber_id: number;
  forma_pagamento_id: number;
  cliente_id: number;
  vr_liquido: number | string;
  dt_inc: string;
  dsc_forma_pagamento?: string;
  dsc_razao_social?: string;
  pedido_id?: number;
};

export type ContaReceberComRelacionamentoType = {
  conta_receber_id: number;
  forma_pagamento_id: number;
  cliente_id: number;
  vr_liquido: number | string;
  dt_inc: string;
  formas_pagamento?: {
    dsc_forma_pagamento: string;
  };
  clientes?: {
    dsc_razao_social: string;
  };
  pedido_id?: number;
};

export type ContaReceberPayloadType = Pick<
  ContaReceberType,
  'cliente_id' | 'forma_pagamento_id' | 'vr_liquido' | 'pedido_id'
>;