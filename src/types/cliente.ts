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