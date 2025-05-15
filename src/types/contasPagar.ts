export type ContaPagarType = {
  conta_pagar_id: number;
  fornecedor_id: number;
  forma_pagamento_id: number;
  vr_liquido: number | string;
  dt_inc: string;
  dsc_forma_pagamento?: string;  
  dsc_razao_social?: string;  
};

export type ContaPagarComRelacionamentoType = {
  conta_pagar_id: number;
  fornecedor_id: number;
  forma_pagamento_id: number;
  vr_liquido: number | string;
  dt_inc: string;
  formas_pagamento?: {
    dsc_forma_pagamento: string;
  };
  fornecedores?: {
    dsc_razao_social: string;
  };
};

export type ContaPagarPayloadType = Pick<
  ContaPagarType,
  'fornecedor_id' | 'forma_pagamento_id' | 'vr_liquido' 
>;

