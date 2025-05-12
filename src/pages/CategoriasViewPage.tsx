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

type CategoriaType = {
  categoria_id: string;
  dsc_categoria: string;
};

export function CategoriasViewPage() {
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [categoriaEditando, setCategoriaEditando] =
    useState<CategoriaType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [categoriaIdToDelete, setCategoriaIdToDelete] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

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

  const handleEdit = (categoria: CategoriaType) => {
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

    toast.success("Registro apagado com sucesso!");

    setShowConfirmation(false);
    getCategorias();
  };

  // Filtrando os produtos com base na busca (searchQuery)
  const categoriasFiltradas = categorias.filter((categoria) =>
    categoria.dsc_categoria.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {categoriaEditando ? (
        <Card className=" w-full h-full mx-auto p-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {categoriaEditando.categoria_id === "0"
                ? "Novo Registro"
                : "Editar Registro"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição da categoria</Label>
              <Input
                id="descricao"
                value={categoriaEditando.dsc_categoria}
                onChange={(e) =>
                  setCategoriaEditando((prev) =>
                    prev ? { ...prev, dsc_categoria: e.target.value } : prev
                  )
                }
                placeholder="Ex: Bebidas, Alimentos, etc."
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
                  if (!categoriaEditando.dsc_categoria.trim()) {
                    setMensagemAviso("Descrição não pode estar vazia.");
                    setMostrarAviso(true);
                    return;
                  }

                  if (categoriaEditando.categoria_id === "0") {
                    const { error } = await supabase.from("categorias").insert({
                      dsc_categoria: categoriaEditando.dsc_categoria,
                    });

                    if (error) {
                      setMensagemAviso(
                        "Erro ao criar categoria: " + error.message
                      );
                      setMostrarAviso(true);
                      return;
                    }
                  } else {
                    const { error } = await supabase
                      .from("categorias")
                      .update({
                        dsc_categoria: categoriaEditando.dsc_categoria,
                      })
                      .eq("categoria_id", categoriaEditando.categoria_id);

                    if (error) {
                      setMensagemAviso(
                        "Erro ao atualizar categoria: " + error.message
                      );
                      setMostrarAviso(true);
                      return;
                    }
                  }

                  toast.success("Registro salvo com sucesso!");
                  getCategorias();
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
          <h1 className="text-2xl font-bold">Categorias</h1>
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
              <Button onClick={getCategorias} className="cursor-pointer">
                <RefreshCcw className="w-4 h-4 mr-2 cursor-pointer" />
                <span className="max-[400px]:hidden">Atualizar</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriasFiltradas.map((categoria) => (
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
                    className="cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(categoria.categoria_id)}
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
