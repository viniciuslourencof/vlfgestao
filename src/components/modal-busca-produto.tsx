import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "../lib/subabase";

export default function ModalBuscaProduto({ open, onClose, onSelect }) {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState([]);
  const [focoIndex, setFocoIndex] = useState(0);

  useEffect(() => {
    const fetchProdutos = async (termo) => {
      const query = supabase
        .from("produtos")
        .select("produto_id, dsc_produto, preco_custo1, valor_dose")
        .limit(20);

      if (termo) {
        query.ilike("dsc_produto", `%${termo}%`);
      }

      const { data, error } = await query;

      if (!error) {
        setResultados(data);
        setFocoIndex(0); // reseta o foco
      }
    };

    if (open) {
      // Quando o modal for aberto, faça a busca inicial com todos os produtos
      fetchProdutos();
    }

    const delayDebounce = setTimeout(async () => {
      if (termo.length > 1) {
        fetchProdutos(termo);
      } else {
        fetchProdutos(); // Exibe todos os produtos se o termo for apagado
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [termo, open]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setFocoIndex((prev) => Math.min(prev + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      setFocoIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      if (resultados[focoIndex]) {
        onSelect(resultados[focoIndex]);
        onClose(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Buscar Produto</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Digite o nome do produto"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="space-y-2 mt-4 max-h-[420px] overflow-y-auto">
          {resultados.length > 0 ? (
            resultados.map((produto, index) => (
              <div
                key={produto.produto_id}
                onDoubleClick={() => {
                  onSelect(produto);
                  onClose(false);
                }}
                className={`p-3 rounded-md border cursor-pointer hover:bg-accent transition ${
                  index === focoIndex ? "bg-accent/50 border-primary" : ""
                }`}
                onMouseEnter={() => setFocoIndex(index)}
                onClick={() => setFocoIndex(index)}
              >
                <div className="font-semibold">{produto.dsc_produto}</div>
                <div className="text-sm text-muted-foreground">
                  Código: {produto.produto_id} · Custo: R${" "}
                  {parseFloat(
                    produto.valor_dose > 0
                      ? produto.valor_dose
                      : produto.preco_custo1
                  ).toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-muted-foreground">
              Nenhum produto encontrado
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
