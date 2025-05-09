import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Plus, RefreshCcw } from "lucide-react";
import { supabase } from "../lib/subabase";
import { Confirmation } from "@/components/confirmation";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";

type Categoria = {
  categoria_id: string;
  dsc_categoria: string;
};

export function CategoriasViewPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(
    null
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [categoriaIdToDelete, setCategoriaIdToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    getCategorias();
  }, []);

  async function getCategorias() {
    const { data } = await supabase
      .from("categorias")
      .select("*")
      .order("categoria_id", { ascending: false });

    if (data) setCategorias(data);
  }

  const handleNew = () => {
    setCategoriaEditando({ categoria_id: "0", dsc_categoria: "" });
  };

  const handleEdit = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
  };

  const handleCloseForm = () => {
    setCategoriaEditando(null);
  };

  const handleDeleteClick = (categoria_id: string) => {
    setCategoriaIdToDelete(categoria_id);
    setShowConfirmation(true);
  };

  const handleDelete = async () => {
    if (!categoriaIdToDelete) return;

    const { error } = await supabase
      .from("categorias")
      .delete()
      .eq("categoria_id", categoriaIdToDelete);

    if (error) {
      setMensagemAviso("Erro ao apagar categoria: " + error.message);
      setMostrarAviso(true);

      return;
    }

    toast.success("Categoria apagada com sucesso!");

    setShowConfirmation(false);
    getCategorias();
  };

  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

  return (
    <div className="p-6">
      {categoriaEditando ? (
        <div>
          <h2 className="text-xl font-bold mb-4">
            {categoriaEditando.categoria_id === "0"
              ? "Nova Categoria"
              : "Editar Categoria"}
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              value={categoriaEditando.dsc_categoria}
              onChange={(e) =>
                setCategoriaEditando((prev) =>
                  prev ? { ...prev, dsc_categoria: e.target.value } : prev
                )
              }
              placeholder="Descrição da categoria"
              className="border p-2 w-full rounded-md"
            />
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (!categoriaEditando.dsc_categoria.trim()) {
                    setMensagemAviso("Descrição não pode estar vazia.");
                    setMostrarAviso(true);

                    return;
                  }

                  if (categoriaEditando.categoria_id === "0") {
                    // Nova
                    const { error } = await supabase.from("categorias").insert({
                      dsc_categoria: categoriaEditando.dsc_categoria,
                    });

                    if (error) {
                      setMensagemAviso(
                        "Erro ao apagar categoria: " + error.message
                      );
                      setMostrarAviso(true);

                      return;
                    }
                  } else {
                    // Atualizar
                    const { error } = await supabase
                      .from("categorias")
                      .update({
                        dsc_categoria: categoriaEditando.dsc_categoria,
                      })
                      .eq("categoria_id", categoriaEditando.categoria_id);

                    if (error) {

                      setMensagemAviso("Erro ao atualizar categoria: " + error.message);
                      setMostrarAviso(true);
                      
                      return;
                    }
                  }

                  getCategorias();
                  handleCloseForm();

                  toast.success("Categoria salva com sucesso!")
                }}
              >
                Salvar
              </Button>
              <Button variant="outline" onClick={handleCloseForm}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center mb-4">
            <h1 className="text-2xl font-bold">Categorias</h1>
            <div className="flex gap-2 ml-auto">
              <Button onClick={handleNew}>
                <Plus className="w-4 h-4 mr-2 cursor-pointer" /> Nova Categoria
              </Button>
              <Button onClick={getCategorias}>
                <RefreshCcw className="w-4 h-4 mr-2 cursor-pointer" /> Atualizar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorias.map((categoria) => (
              <Card
                key={categoria.categoria_id}
                className="p-4 flex flex-col justify-between"
              >
                <div>
                  <h2 className="font-semibold text-lg">
                    {categoria.dsc_categoria}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Código: {categoria.categoria_id}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(categoria)}
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(categoria.categoria_id)}
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
