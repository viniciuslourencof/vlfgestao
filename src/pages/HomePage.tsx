import { CategoryFilter } from "../components/category-filter"
import { FoodGrid } from "../components/food-grid"

export function HomePage() {
  return (
    <>
      <CategoryFilter />
      <FoodGrid />
    </>
  )
}
