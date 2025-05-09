import { FoodCard } from "./food-card";

interface Produto {
  produto_id: number;
  dsc_produto: string;
  preco_venda1: number;
  desconto?: number;
}

interface FoodGridProps {
  produtos: Produto[];  // Define que 'produtos' é um array de 'Produto'
}

export function FoodGrid({ produtos }: FoodGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {produtos.map((produto, index) => (
        <FoodCard key={index} {...produto} />
      ))}
    </div>
  );
}
