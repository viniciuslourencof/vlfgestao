interface Categoria {
  categoria_id: number | null;
  dsc_categoria: string;
}

interface CategoryFilterProps {
  categorias: Categoria[];
  categoriaSelecionada: number | null;
  onSelectCategoria: (categoria_id: number | null) => void;
}

export function CategoryFilter({
  categorias,
  categoriaSelecionada,
  onSelectCategoria,
}: CategoryFilterProps) {
  return (
    <div className="space-x-2 space-y-2">
      {categorias.map((categoria) => (
        <button
          key={categoria.categoria_id}
          onClick={() => onSelectCategoria(categoria.categoria_id)}
          className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer font-semibold
            ${categoria.categoria_id === categoriaSelecionada 
              ? "bg-primary text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
        >
          {categoria.dsc_categoria}
        </button>
      ))}
    </div>
  );
}
