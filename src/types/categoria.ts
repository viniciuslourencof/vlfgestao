
export type CategoriaType = {
  categoria_id: number;
  dsc_categoria: string;
};

export type CategoryFilterPropsType = {
  categorias: CategoriaType[];
  categoriaSelecionadaID: number | null;
  onSelectCategoria: (categoria_id: number | null) => void;
}

export type CategoriaPayloadType = Pick<
  CategoriaType,
  'dsc_categoria'
>;
