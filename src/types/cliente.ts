export type ClienteType = {
  cliente_id: number;
  dsc_razao_social: string;
  dsc_nome_fantasia: string;
};

export type ModalBuscaClientePropsType = {
  open: boolean;
  onClose: (open: boolean) => void;
  onSelect: (cliente: ClienteType) => void;
};

export type ClientePayloadType = Pick<
  ClienteType,
  'dsc_razao_social' | 'dsc_nome_fantasia'
>;
