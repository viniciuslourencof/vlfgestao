import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "../lib/subabase";
import { FornecedorType, ModalBuscaFornecedorPropsType } from "../types/fornecedor";

export default function ModalBuscaFornecedor({
  open,
  onClose,
  onSelect,
}: ModalBuscaFornecedorPropsType) {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<FornecedorType[]>([]);
  const [focoIndex, setFocoIndex] = useState(0);

  useEffect(() => {
    const fetchFornecedores = async (termo: string) => {
      const query = supabase
        .from("fornecedores")
        .select("*")
        .order("dsc_razao_social", { ascending: true });

      if (termo) {
        query.ilike("dsc_razao_social", `%${termo}%`);
      }

      const { data, error } = await query;

      if (!error) {
        setResultados(data);
        setFocoIndex(0);
      }
    };

    if (open) {
      fetchFornecedores("");
    }

    const delayDebounce = setTimeout(() => {
      if (termo.length > 1) {
        fetchFornecedores(termo);
      } else {
        fetchFornecedores("");
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
          <DialogTitle>Buscar Fornecedor</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Digite o nome do fornecedor"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="space-y-2 mt-4 max-h-[420px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {resultados.length > 0 ? (
            resultados.map((fornecedor, index) => (
              <div
                key={fornecedor.fornecedor_id}
                onDoubleClick={() => {
                  onSelect(fornecedor);
                  onClose(false);
                }}
                className={`p-3 rounded-md border cursor-pointer hover:bg-accent transition ${
                  index === focoIndex ? "bg-accent/50 border-primary" : ""
                }`}
                onMouseEnter={() => setFocoIndex(index)}
                onClick={() => setFocoIndex(index)}
              >
                <div className="font-semibold">{fornecedor.dsc_razao_social}</div>
                <div className="text-sm text-muted-foreground">
                  Código: {fornecedor.fornecedor_id}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-muted-foreground">
              Nenhum fornecedor encontrado
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
