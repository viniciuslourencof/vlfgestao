import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, RefreshCcw } from "lucide-react";
import { supabase } from "../lib/subabase";
import { Confirmation } from "@/components/confirmation";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import { useSearch } from "@/components/search-provider";

type FormaPagamentoType = {
  forma_pagamento_id: string;
  dsc_forma_pagamento: string;
};

export function FormasPagamentoViewPage() {
  const [formas, setFormas] = useState<FormaPagamentoType[]>([]);
  const [editando, setEditando] = useState<FormaPagamentoType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const { searchQuery } = useSearch();

  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

  useEffect(() => {
    getFormas();
  }, []);

  async function getFormas() {
    const { data } = await supabase
      .from("formas_pagamento")
      .select("*")
      .order("forma_pagamento_id", { ascending: false });

    if (data) setFormas(data);
  }

  const handleNew = () => {
    setEditando({ forma_pagamento_id: "0", dsc_forma_pagamento: "" });
  };

  const handleEdit = (forma: FormaPagamentoType) => {
    setEditando(forma);
  };

  const handleCloseForm = () => {
    setEditando(null);
  };

  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setShowConfirmation(true);
  };

  const handleDelete = async () => {
    if (!idToDelete) return;

    const { error } = await supabase
      .from("formas_pagamento")
      .delete()
      .eq("forma_pagamento_id", idToDelete);

    if (error) {
      setMensagemAviso("Erro ao apagar: " + error.message);
      setMostrarAviso(true);
      return;
    }

    toast.success("Registro apagado com sucesso!");
    setShowConfirmation(false);
    getFormas();
  };

  const formasFiltradas = formas.filter((e) =>
    e.dsc_forma_pagamento.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {editando ? (
        <Card className="w-full h-full mx-auto p-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {editando.forma_pagamento_id === "0"
                ? "Nova Forma de Pagamento"
                : "Editar Forma de Pagamento"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={editando.dsc_forma_pagamento}
                onChange={(e) =>
                  setEditando((prev) =>
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
                onClick={handleCloseForm}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                className="cursor-pointer"
                onClick={async () => {
                  if (!editando.dsc_forma_pagamento.trim()) {
                    setMensagemAviso("Descrição não pode estar vazia.");
                    setMostrarAviso(true);
                    return;
                  }

                  if (editando.forma_pagamento_id === "0") {
                    const { error } = await supabase
                      .from("forma_pagamento")
                      .insert({
                        dsc_forma_documento: editando.dsc_forma_pagamento,
                      });

                    if (error) {
                      setMensagemAviso("Erro ao criar: " + error.message);
                      setMostrarAviso(true);
                      return;
                    }
                  } else {
                    const { error } = await supabase
                      .from("forma_pagamento")
                      .update({
                        dsc_forma_documento: editando.dsc_forma_pagamento,
                      })
                      .eq(
                        "forma_pagamento_id",
                        editando.forma_pagamento_id
                      );

                    if (error) {
                      setMensagemAviso("Erro ao atualizar: " + error.message);
                      setMostrarAviso(true);
                      return;
                    }
                  }

                  toast.success("Registro salvo com sucesso!");
                  getFormas();
                  handleCloseForm();
                }}
              >
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center mb-4">
            <h1 className="text-2xl font-bold">Formas de Pagamento</h1>
            <div className="flex gap-2 ml-auto">
              <Button onClick={handleNew} className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" /> Novo
              </Button>
              <Button onClick={getFormas} className="cursor-pointer">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Atualizar
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
                    onClick={() => handleEdit(forma)}
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Editar
                  </Button>
                  <Button
                    className="cursor-pointer"
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteClick(forma.forma_pagamento_id)
                    }
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Apagar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Confirmation
        open={showConfirmation}
        onCancel={() => setShowConfirmation(false)}
        onConfirm={handleDelete}
      />
      <ModalAviso
        open={mostrarAviso}
        onClose={setMostrarAviso}
        mensagem={mensagemAviso}
      />
    </div>
  );
}
