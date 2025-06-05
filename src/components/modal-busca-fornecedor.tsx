import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  FornecedorType,
  ModalBuscaFornecedorPropsType,
} from "../types/fornecedor";
import { FornecedorServices } from "@/services/fornecedorServices";

export default function ModalBuscaFornecedor({
  abrir,
  aoFechar,
  aoSelecionar,
}: ModalBuscaFornecedorPropsType) {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<FornecedorType[]>([]);
  const [focoIndex, setFocoIndex] = useState(0);

  useEffect(() => {
    const carregaRegistros = async (termo: string) => {
      const resultados = await FornecedorServices.buscarRegistrosPorNome(termo);

      setResultados(resultados);
      setFocoIndex(0);
    };

    if (abrir) {
      carregaRegistros("");
    }

    const atrasoBusca = setTimeout(() => {
      if (termo.length > 1) {
        carregaRegistros(termo);
      } else {
        carregaRegistros("");
      }
    }, 400);

    return () => clearTimeout(atrasoBusca);
  }, [termo, abrir]);

  const aoPressionarTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setFocoIndex((prev) => Math.min(prev + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      setFocoIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      if (resultados[focoIndex]) {
        aoSelecionar(resultados[focoIndex]);
        aoFechar(false);
      }
    }
  };

  return (
    <Dialog open={abrir} onOpenChange={aoFechar}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Buscar Fornecedor</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Digite o nome do fornecedor"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={aoPressionarTecla}
        />

        <div className="space-y-2 mt-4 max-h-[420px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {resultados.length > 0 ? (
            resultados.map((fornecedor, index) => (
              <div
                key={fornecedor.fornecedor_id}
                onDoubleClick={() => {
                  aoSelecionar(fornecedor);
                  aoFechar(false);
                }}
                className={`p-3 rounded-md border cursor-pointer hover:bg-accent transition ${
                  index === focoIndex ? "bg-accent/50 border-primary" : ""
                }`}
                onMouseEnter={() => setFocoIndex(index)}
                onClick={() => setFocoIndex(index)}
              >
                <div className="font-semibold">
                  {fornecedor.dsc_razao_social}
                </div>
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
