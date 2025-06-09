export type ProdutoType = {
  produto_id: number;
  dsc_produto: string;
  estoque: number;
  preco_venda1: number;
  preco_custo1: number;
  desconto: number;
  categoria_id: number;
  unidade_fardo: number;
  mililitros: number;
  doses: number;
  margem1: number;
  valor_dose: number;
  vr_desconto: number;
};

export type ProdutoPayloadType = Pick<
  ProdutoType,  
  | "dsc_produto"
  | "estoque"
  | "preco_venda1"
  | "preco_custo1"
  | "desconto"
  | "categoria_id"
  | "unidade_fardo"
  | "mililitros"
  | "doses"
  | "margem1"
  | "valor_dose"
  | "vr_desconto"
>;

export type ProdutoComposicaoType = {
  produto_composicao_id: number;
  produtofilho_id: number;
  produtopai_id: number;
  produtos: {
    valor_dose: number;
    dsc_produto: string;
  };
  vr_custo: number;
  quantidade: number;
};

export type ProdutoComposicaoPayloadType = Pick<
  ProdutoComposicaoType,
  'produtofilho_id' | 'produtopai_id' | 'vr_custo' | 'quantidade'
>;


export type ModalBuscaProdutoPropsType = {
  abrir: boolean;
  aoFechar: (open: boolean) => void;
  aoSelecionar: (produto: ProdutoType) => void;
};
