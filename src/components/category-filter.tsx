type CategoryFilterProps = {
  categorias: Categoria[];
  categoriaSelecionada: number;
  onSelectCategoria: (categoria_id: number) => void;
};

export function CategoryFilter({
  categorias,
  categoriaSelecionada,
  onSelectCategoria,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
      {categorias.map((categoria) => (
        <div
          key={categoria.categoria_id ?? "all"}
          className={`flex flex-col items-center p-3 rounded-xl min-w-[100px] ${
            categoriaSelecionada === categoria.categoria_id ? "bg-green-50 text-gray-600" : "bg-white"
          } border cursor-pointer hover:bg-green-50`}
          onClick={() => onSelectCategoria(categoria.categoria_id)}
        >
          <span className="text-sm font-medium">{categoria.label || categoria.dsc_categoria}</span>
        </div>
      ))}
    </div>
  );
}
