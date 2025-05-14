import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { format } from "date-fns";

interface ModalComFiltroProps {
  open: boolean;
  onClose: (open: boolean) => void;
  onConfirm: (data: {
    dataInicio: Date | undefined;
    dataFim: Date | undefined;
    opcao: string;
  }) => void;
}

export default function ModalComFiltro({
  open,
  onClose,
  onConfirm,
}: ModalComFiltroProps) {
  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [opcaoSelecionada, setOpcaoSelecionada] = useState("todos");

  const handleConfirm = () => {
    onConfirm({ dataInicio, dataFim, opcao: opcaoSelecionada });
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vendas por Produtos por Período</DialogTitle>
        </DialogHeader>

        <Card className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div>
            <Label className="block mb-2">Data de Início</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={dataInicio ? format(dataInicio, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    setDataInicio(newDate);
                  }
                }}
                placeholder="Digite a data"
              />
            </div>
          </div>

          <div>
            <Label className="block mb-2">Data de Fim</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={dataFim ? format(dataFim, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    setDataFim(newDate);
                  }
                }}
                placeholder="Digite a data"
              />
            </div>
          </div>
        </Card>
        <Card className="grid grid-cols-1 md:grid-cols-1 gap-4 p-4 mt-2">
          <Label className="mb-0 block">Ordenação</Label>
          <RadioGroup
            className="md:grid-cols-2 gap-4"
            defaultValue="decrescente"
            value={opcaoSelecionada}
            onValueChange={setOpcaoSelecionada}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="crescente" id="r1" />
              <Label htmlFor="r1">Crescente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="decrescente" id="r2" />
              <Label htmlFor="r2">Decrescente</Label>
            </div>
          </RadioGroup>
        </Card>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" className="cursor-pointer" onClick={() => onClose(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="cursor-pointer">Confirmar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
