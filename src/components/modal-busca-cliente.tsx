import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "../lib/subabase";
import { ClienteType, ModalBuscaClientePropsType } from "../types/cliente";

export default function ModalBuscaCliente({
  open,
  onClose,
  onSelect,
}: ModalBuscaClientePropsType) {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<ClienteType[]>([]);
  const [focoIndex, setFocoIndex] = useState(0);

  useEffect(() => {
    const fetchClientes = async (termo: string) => {
      const query = supabase
        .from("clientes")
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
      fetchClientes("");
    }

    const delayDebounce = setTimeout(() => {
      if (termo.length > 1) {
        fetchClientes(termo);
      } else {
        fetchClientes("");
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
          <DialogTitle>Buscar Cliente</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Digite o nome do cliente"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="space-y-2 mt-4 max-h-[420px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {resultados.length > 0 ? (
            resultados.map((cliente, index) => (
              <div
                key={cliente.cliente_id}
                onDoubleClick={() => {
                  onSelect(cliente);
                  onClose(false);
                }}
                className={`p-3 rounded-md border cursor-pointer hover:bg-accent transition ${
                  index === focoIndex ? "bg-accent/50 border-primary" : ""
                }`}
                onMouseEnter={() => setFocoIndex(index)}
                onClick={() => setFocoIndex(index)}
              >
                <div className="font-semibold">{cliente.dsc_razao_social}</div>
                <div className="text-sm text-muted-foreground">
                  Código: {cliente.cliente_id}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-muted-foreground">
              Nenhum cliente encontrado
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
