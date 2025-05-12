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

type PedidoType = {
  pedido_id: string;
  vr_liquido: string;
  forma_pagamento_id: string;
};

export function PedidosViewPage() {
  const [pedidos, setPedidos] = useState<PedidoType[]>([]);
  const [pedidoEditando, setPedidoEditando] = useState<PedidoType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pedidoIdToDelete, setCategoriaIdToDelete] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

  useEffect(() => {
    getPedidos();
  }, []);

  async function getPedidos() {
    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .order("pedido_id", { ascending: false });

    if (data) setPedidos(data);
  }

  const handleNew = () => {
    setPedidoEditando({
      pedido_id: "0",
      vr_liquido: "0.00",
      forma_pagamento_id: "0",
    });
  };

  const handleEdit = (pedido: PedidoType) => {
    setPedidoEditando(pedido);
  };

  const handleCloseForm = () => {
    setPedidoEditando(null);
  };

  const handleDeleteClick = (pedido_id: string) => {
    setCategoriaIdToDelete(pedido_id);
    setShowConfirmation(true);
  };

  const handleDelete = async () => {
    if (!pedidoIdToDelete) return;

    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("pedido_id", pedidoIdToDelete);

    if (error) {
      setMensagemAviso("Erro ao apagar registro: " + error.message);
      setMostrarAviso(true);

      return;
    }

    toast.success("Registro apagado com sucesso!");

    setShowConfirmation(false);
    getPedidos();
  };

  // Filtrando os produtos com base na busca (searchQuery)
  const pedidosFiltrados = pedidos.filter(
    (pedido) => pedido.pedido_id.toString().includes(searchQuery) // Converte o pedido_id para string e compara
  );

  return (
    <div className="p-6">
      {pedidoEditando ? (
        <Card className=" w-full h-full mx-auto p-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {pedidoEditando.pedido_id === "0"
                ? "Novo Registro"
                : "Editar Registro"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pedido_id">Código do Pedido</Label>
              <Input
                id="pedido_id"
                value={pedidoEditando.pedido_id}
                onChange={(e) =>
                  setPedidoEditando((prev) =>
                    prev ? { ...prev, pedido_id: e.target.value } : prev
                  )
                }                
                readOnly
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
                  //   if (!pedidoEditando.dsc_categoria.trim()) {
                  //     setMensagemAviso("Descrição não pode estar vazia.");
                  //     setMostrarAviso(true);
                  //     return;
                  //   }

                  if (pedidoEditando.pedido_id === "0") {
                    const { error } = await supabase.from("pedidos").insert({
                      pedido_id: pedidoEditando.pedido_id,
                      vr_liquido: pedidoEditando.vr_liquido,
                      forma_pagamento_id: pedidoEditando.forma_pagamento_id,
                    });

                    if (error) {
                      setMensagemAviso(
                        "Erro ao criar registro: " + error.message
                      );
                      setMostrarAviso(true);
                      return;
                    }
                  } else {
                    const { error } = await supabase
                      .from("pedidos")
                      .update({
                        pedido_id: pedidoEditando.pedido_id,
                        vr_liquido: pedidoEditando.vr_liquido,
                        forma_pagamento_id: pedidoEditando.forma_pagamento_id,
                      })
                      .eq("pedido_id", pedidoEditando.pedido_id);

                    if (error) {
                      setMensagemAviso(
                        "Erro ao atualizar registro: " + error.message
                      );
                      setMostrarAviso(true);
                      return;
                    }
                  }

                  toast.success("Registro salvo com sucesso!");
                  getPedidos();
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
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <Input
            type="text"
            placeholder="Pesquisar registros..."
            className="w-full my-4 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center mb-4">
            <div className="flex gap-2">
              <Button onClick={handleNew} className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2 cursor-pointer" /> Novo
              </Button>
              <Button onClick={getPedidos} className="cursor-pointer">
                <RefreshCcw className="w-4 h-4 mr-2 cursor-pointer" />
                <span className="max-[400px]:hidden">Atualizar</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pedidosFiltrados.map((pedido) => (
              <Card
                key={pedido.pedido_id}
                className="p-4 flex flex-col justify-between"
              >
                <div>
                  <h2 className="font-semibold text-lg">
                    Pedido #{pedido.pedido_id}
                  </h2>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(pedido)}
                    className="cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(pedido.pedido_id)}
                    className="cursor-pointer"
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
