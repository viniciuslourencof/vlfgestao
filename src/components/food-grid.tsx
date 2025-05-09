import { FoodCard } from "./food-card";

export function FoodGrid({ produtos }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {produtos.map((produto, index) => (
        <FoodCard key={index} {...produto} />
      ))}
    </div>
  );
}
