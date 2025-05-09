import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"


interface FoodCardProps {
  produto_id: number
  dsc_produto: string
  preco_venda1: number
  desconto?: number  
}

export function FoodCard({dsc_produto, preco_venda1, desconto }: FoodCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        {/* <img src={"https://images.tcdn.com.br/img/img_prod/1199398/gin_eternity_melancia_900ml_235_1_9ac42bfafed2ca597c3bd3a27999feaa.jpeg"} alt={dsc_produto} className="w-full h-40 object-cover" /> */}
        {(desconto > 0) && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-md text-xs font-medium">
            {desconto}% Off
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium mb-1">{dsc_produto}</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-black-600 font-bold">${preco_venda1.toFixed(2)}</span>
          {/* <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${type === "Veg" ? "bg-green-500" : "bg-red-500"}`}></span>
            <span className="text-xs text-gray-500">{type}</span>
          </div> */}
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" className="rounded-full">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="font-medium">1</span>
          <Button variant="outline" size="icon" className="rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
