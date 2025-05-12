import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "../lib/subabase";

interface FormaPagamento {
  forma_pagamento_id: number;
  dsc_forma_pagamento: string;
}

interface ModalBuscaFormaPagamentoProps {
  open: boolean;
  onClose: (open: boolean) => void;
  onSelect: (forma: FormaPagamento) => void;
}

export default function ModalBuscaFormaPagamento({
  open,
  onClose,
  onSelect,
}: ModalBuscaFormaPagamentoProps) {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<FormaPagamento[]>([]);
  const [focoIndex, setFocoIndex] = useState(0);

  useEffect(() => {
    const fetchFormasPagamento = async (termo: string) => {
      const query = supabase
        .from("formas_pagamento")
        .select("forma_pagamento_id, dsc_forma_pagamento")
        .order("dsc_forma_pagamento", { ascending: true });

      if (termo) {
        query.ilike("dsc_forma_pagamento", `%${termo}%`);
      }

      const { data, error } = await query;

      if (!error) {
        setResultados(data);
        setFocoIndex(0); // resetar foco
      }
    };

    if (open) {
      fetchFormasPagamento(""); // busca inicial
    }

    const delayDebounce = setTimeout(() => {
      if (termo.length > 1) {
        fetchFormasPagamento(termo);
      } else {
        fetchFormasPagamento("");
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
          <DialogTitle>Buscar Forma de Pagamento</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Digite o nome da forma de pagamento"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="space-y-2 mt-4 max-h-[420px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {resultados.length > 0 ? (
            resultados.map((forma, index) => (
              <div
                key={forma.forma_pagamento_id}
                onDoubleClick={() => {
                  onSelect(forma);
                  onClose(false);
                }}
                className={`p-3 rounded-md border cursor-pointer hover:bg-accent transition ${
                  index === focoIndex ? "bg-accent/50 border-primary" : ""
                }`}
                onMouseEnter={() => setFocoIndex(index)}
                onClick={() => setFocoIndex(index)}
              >
                <div className="font-semibold">
                  {forma.dsc_forma_pagamento}
                </div>
                <div className="text-sm text-muted-foreground">
                  Código: {forma.forma_pagamento_id}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-muted-foreground">
              Nenhuma forma de pagamento encontrada
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
