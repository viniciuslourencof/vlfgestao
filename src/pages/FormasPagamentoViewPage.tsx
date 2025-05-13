import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, RefreshCcw } from "lucide-react";
import { supabase } from "../lib/subabase";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import { FormaPagamentoType } from "../types/formaPagamento";
import { FormaPagamentoServices } from "../services/formaPagamentoServices";

export function FormasPagamentoViewPage() {
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamentoType[]>(
    []
  );
  const [formaPagamentoEditando, setFormaPagamentoEditando] =
    useState<FormaPagamentoType | null>(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [formaPagamentoIDADeletar, setformaPagamentoIDADeletar] = useState<
    number | null
  >(null);
  const [textoPesquisa, setTextoPesquisa] = useState<string>(""); // Aqui você gerencia o valor de busca
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

  const carregarFormasPagamento = async () => {
    const resultado = await FormaPagamentoServices.buscarFormasPagamento();
    setFormasPagamento(resultado);
  };

  useEffect(() => {
    carregarFormasPagamento();
  }, [carregarFormasPagamento()]);

  const aoInserir = () => {
    setFormaPagamentoEditando({
      forma_pagamento_id: 0,
      dsc_forma_pagamento: "",
    });
  };

  const aoEditar = (forma: FormaPagamentoType) => {
    setFormaPagamentoEditando(forma);
  };

  const aoFecharForm = () => {
    setFormaPagamentoEditando(null);
  };

  const aoClicarEmDeletar = (id: number) => {
    setformaPagamentoIDADeletar(id);
    setMostrarConfirmacao(true);
  };

  const aoDeletar = async () => {
    if (!formaPagamentoIDADeletar) return;

    const { error } = await supabase
      .from("formas_pagamento")
      .delete()
      .eq("forma_pagamento_id", formaPagamentoIDADeletar);

    if (error) {
      setMensagemAviso("Erro ao apagar: " + error.message);
      setMostrarAviso(true);
      return;
    }

    toast.success("Registro apagado com sucesso!");
    setMostrarConfirmacao(false);
    carregarFormasPagamento();
  };

  const formasFiltradas = formasPagamento.filter((e) =>
    e.dsc_forma_pagamento.toLowerCase().includes(textoPesquisa.toLowerCase())
  );

  return (
    <div className="p-6">
      {formaPagamentoEditando ? (
        <Card className="w-full h-full mx-auto p-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {formaPagamentoEditando.forma_pagamento_id === 0
                ? "Novo Registro"
                : "Editar Registro"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formaPagamentoEditando.dsc_forma_pagamento}
                onChange={(e) =>
                  setFormaPagamentoEditando((prev) =>
                    prev
                      ? { ...prev, dsc_forma_pagamento: e.target.value }
                      : prev
                  )
                }
                placeholder="Ex: Dinheiro, Cartão de Crédito, etc."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={aoFecharForm}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                className="cursor-pointer"
                onClick={async () => {
                  if (!formaPagamentoEditando.dsc_forma_pagamento.trim()) {
                    setMensagemAviso("Descrição não pode estar vazia.");
                    setMostrarAviso(true);
                    return;
                  }

                  console.log(formaPagamentoEditando)

                  if (formaPagamentoEditando.forma_pagamento_id === 0) {
                    const { error } = await supabase
                      .from("formas_pagamento")
                      .insert({
                        dsc_forma_pagamento:
                          formaPagamentoEditando.dsc_forma_pagamento,
                      });

                    if (error) {
                      setMensagemAviso(
                        "Erro ao inserir registro: " + error.message
                      );
                      setMostrarAviso(true);
                      return;
                    }
                  } else {
                    const { error } = await supabase
                      .from("formas_pagamento")
                      .update({
                        dsc_forma_pagamento:
                          formaPagamentoEditando.dsc_forma_pagamento,
                      })
                      .eq(
                        "forma_pagamento_id",
                        formaPagamentoEditando.forma_pagamento_id
                      );

                    if (error) {
                      setMensagemAviso(
                        "Erro ao atualizar registro: " + error.message
                      );
                      setMostrarAviso(true);
                      return;
                    }
                  }

                  toast.success("Registro salvo com sucesso!");
                  carregarFormasPagamento();
                  aoFecharForm();
                }}
              >
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Formas de Pagamento</h1>
          <Input
            type="text"
            placeholder="Pesquisar registros..."
            className="w-full my-4 bg-white"
            value={textoPesquisa}
            onChange={(e) => setTextoPesquisa(e.target.value)}
          />

          <div className="flex items-center mb-4">
            <div className="flex gap-2">
              <Button onClick={aoInserir} className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" /> Novo
              </Button>
              <Button
                onClick={carregarFormasPagamento}
                className="cursor-pointer"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                <span className="max-[400px]:hidden">Atualizar</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formasFiltradas.map((forma) => (
              <Card
                key={forma.forma_pagamento_id}
                className="p-4 flex flex-col justify-between"
              >
                <div>
                  <h2 className="font-semibold text-lg">
                    {forma.dsc_forma_pagamento}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Código: {forma.forma_pagamento_id}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    size="sm"
                    onClick={() => aoEditar(forma)}
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Editar
                  </Button>
                  <Button
                    className="cursor-pointer"
                    variant="destructive"
                    size="sm"
                    onClick={() => aoClicarEmDeletar(forma.forma_pagamento_id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Apagar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <ModalConfirmacao
        open={mostrarConfirmacao}
        onCancel={() => setMostrarConfirmacao(false)}
        onConfirm={aoDeletar}
      />
      <ModalAviso
        open={mostrarAviso}
        onClose={setMostrarAviso}
        mensagem={mensagemAviso}
      />
    </div>
  );
}
