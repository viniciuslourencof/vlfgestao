export type FormaPagamentoType = {
  forma_pagamento_id: number;
  dsc_forma_pagamento: string;
};

export type FormaPagamentoPayloadType = Pick<
  FormaPagamentoType,
  'dsc_forma_pagamento'
>;

export type ModalBuscaFormaPagamentoPropsType = {
  open: boolean;
  onClose: (open: boolean) => void;
  onSelect: (forma: FormaPagamentoType) => void;
}