
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  QrCode,
  Banknote,
  Edit2,
  ChevronsRight,
  ChevronsLeft,
  Trash2,
} from "lucide-react";

interface CarrinhoItem {
  produto_id: number;
  dsc_produto: string;
  preco_venda1: number;
  quantidade: number;
}

interface CartProps {
  carrinho: CarrinhoItem[];
  onRemoveItem: (produtoId: number) => void;
  minimized: boolean;
  setMinimized: (minimized: boolean) => void;
}

export function Cart({
  carrinho,
  onRemoveItem,
  minimized,
  setMinimized,
}: CartProps) {
  if (!carrinho) return;

  const subtotal = carrinho.reduce(
    (acc, item) => acc + item.preco_venda1 * item.quantidade,
    0
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div
      className={`bg-white border-l flex flex-col h-full transition-all duration-300 ${
        minimized ? "w-0" : "w-[380px]"
      }`}
    >
      {/* Top bar com botão de minimizar */}
      <div className="p-4 border-b flex justify-between items-center">
        {!minimized ? (
          <>
            <div>
              <h2 className="text-xl font-bold">Pedido</h2>
              <p className="text-sm text-gray-500">Cliente atual</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Edit2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMinimized(true)}
              >
                <ChevronsRight className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMinimized(false)}
          >
            <ChevronsLeft className="h-5 w-5" />
          </Button>
        )}
      </div>

      {!minimized && (
        <>
          <div className="p-4 border-b">
            <div className="flex gap-2 mb-4">
              <Button variant="secondary" className="flex-1 rounded-full">
                Local
              </Button>
              <Button variant="outline" className="flex-1 rounded-full">
                Retirada
              </Button>
              <Button variant="outline" className="flex-1 rounded-full">
                Entrega
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {carrinho.length === 0 ? (
              <p className="text-gray-500">Seu carrinho está vazio.</p>
            ) : (
              carrinho.map((item) => (
                <div
                  key={item.produto_id}
                  className="flex items-center gap-3 mb-4"
                >
                  {/* <div className="w-16 h-16 bg-gray-200 rounded-lg" /> */}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.dsc_produto}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-black-600 font-bold">
                        R$ {item.preco_venda1.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.quantidade}x
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.produto_id)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t p-4">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa (5%)</span>
                <span>R$ {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-0"
              >
                <Banknote className="h-5 w-5 mb-1" />
                <span className="text-xs">Dinheiro</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-0"
              >
                <CreditCard className="h-5 w-5 mb-1" />
                <span className="text-xs">Cartão</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-0"
              >
                <QrCode className="h-5 w-5 mb-1" />
                <span className="text-xs">Pix</span>
              </Button>
            </div>

            <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white h-12 cursor-pointer">
              Finalizar Pedido
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
