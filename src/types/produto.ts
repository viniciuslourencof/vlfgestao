export interface ProdutoInterface {
  produto_id: number;
  dsc_produto: string;
  preco_venda1: number;
  desconto: number;
}

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

export type ModalBuscaProdutoPropsType = {
  open: boolean;
  onClose: (open: boolean) => void;
  onSelect: (produto: ProdutoType) => void;
}
