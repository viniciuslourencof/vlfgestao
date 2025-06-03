export type UsuarioType = {
  usuario_id: number;
  login: string;
  senha: string;
  dsc_usuario: string;
};


export type UsuarioPayloadType = Pick<
  UsuarioType,
  'login' | 'senha' | 'dsc_usuario'
>; 