import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "../lib/subabase";

interface Categoria {
  categoria_id: number;
  dsc_categoria: string;
}

interface ModalBuscaCategoriaProps {
  open: boolean;
  onClose: (open: boolean) => void;
  onSelect: (categoria: Categoria) => void;
}

export default function ModalBuscaCategoria({
  open,
  onClose,
  onSelect,
}: ModalBuscaCategoriaProps) {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<Categoria[]>([]);
  const [focoIndex, setFocoIndex] = useState(0);

  useEffect(() => {
    const fetchCategorias = async (termo: string) => {
      const query = supabase
        .from("categorias")
        .select("categoria_id, dsc_categoria")
        .limit(20);

      if (termo) {
        query.ilike("dsc_categoria", `%${termo}%`);
      }

      const { data, error } = await query;

      if (!error) {
        setResultados(data);
        setFocoIndex(0); // reseta o foco
      }
    };

    if (open) {
      fetchCategorias(""); // busca inicial
    }

    const delayDebounce = setTimeout(() => {
      if (termo.length > 1) {
        fetchCategorias(termo);
      } else {
        fetchCategorias("");
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [termo, open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
          <DialogTitle>Buscar Categoria</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Digite o nome da categoria"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="space-y-2 mt-4 max-h-[420px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-gray-400 scrollbar-track-gray-200">

          {resultados.length > 0 ? (
            resultados.map((categoria, index) => (
              <div
                key={categoria.categoria_id}
                onDoubleClick={() => {
                  onSelect(categoria);                  
                  onClose(false);
                }}
                className={`p-3 rounded-md border cursor-pointer hover:bg-accent transition ${
                  index === focoIndex ? "bg-accent/50 border-primary" : ""
                }`}
                onMouseEnter={() => setFocoIndex(index)}
                onClick={() => setFocoIndex(index)}
              >
                <div className="font-semibold">
                  {categoria.dsc_categoria}
                </div>
                <div className="text-sm text-muted-foreground">
                  Código: {categoria.categoria_id}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-muted-foreground">
              Nenhuma categoria encontrada
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
