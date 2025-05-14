import { CategoryFilterPropsType } from "../types/categoria";

export function CategoryFilter({
  categorias,
  categoriaSelecionadaID: categoriaSelecionadaID,
  onSelectCategoria,
}: CategoryFilterPropsType) {
  return (
    <div className="space-x-2">
      {categorias.map((categoria) => (
        <button
          key={categoria.categoria_id}
          onClick={() => onSelectCategoria(categoria.categoria_id)}
          className={`px-4 py-2 rounded-md text-sm cursor-pointer font-semibold
            ${categoria.categoria_id === categoriaSelecionadaID 
              ? "bg-primary text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
        >
          {categoria.dsc_categoria}
        </button>
      ))}
    </div>
  );
}
