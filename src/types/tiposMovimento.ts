export type TipoMovimentoType = {
  tipo_movimento_id: number;
  dt_inc: string; 
  dsc_tipo_movimento: string;
  estoque: string;
  financeiro: string;
  cliente_vendas_padrao_id: number | null;
};

export type TipoMovimentoPayloadType = Pick<
  TipoMovimentoType,
  'dsc_tipo_movimento' | 'estoque' | 'financeiro' | 'cliente_vendas_padrao_id'
>;
