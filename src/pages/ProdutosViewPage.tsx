import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Plus, RefreshCcw } from "lucide-react";
import { ProdutosPage } from "./ProdutosPage";
import { supabase } from "../lib/subabase";
import { Confirmation } from "@/components/confirmation";
import { toast } from "sonner";
import ModalAviso from "@/components/modal-aviso";

type ProdutoType = {
  produto_id: string;
  dsc_produto: string;
  estoque: string;
  preco_venda1: string;
  preco_custo1: string;
  desconto: string;
  categoria_id: string;
  unidade_fardo: string;
  mililitros: string;
  doses: string;
  dsc_categoria: string;
  margem1: string;
  valor_dose: string;
  categorias?: {
    dsc_categoria: string;
  };
};

export function ProdutosViewPage() {
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [produtoEditando, setProdutoEditando] = useState<ProdutoType | null>(
    null
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [produtoIdToDelete, setProdutoIdToDelete] = useState<string | null>(
    null
  );
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    getProdutos();
  }, []);

  async function getProdutos() {
    const query = supabase
      .from("produtos")
      .select(
        `
      *,
      categorias:categoria_id (
        dsc_categoria
      )
    `
      )
      .order("produto_id", { ascending: false });

    const { data } = await query;

    if (data) {
      setProdutos(data);
    }
  }

  const handleEdit = (produto: ProdutoType) => {
    setProdutoEditando(produto);
  };

  const handleNew = async () => {
    setProdutoEditando({
      produto_id: "0",
      dsc_produto: "",
      estoque: "0.00",
      preco_venda1: "0.00",
      preco_custo1: "0.00",
      desconto: "0.00",
      categoria_id: "",
      unidade_fardo: "0",
      mililitros: "0.00",
      doses: "0.00",
      dsc_categoria: "",
      margem1: "0.00",
      valor_dose: "0.00",
    });
  };

  const handleCloseForm = () => {
    setProdutoEditando(null);
  };

  const handleDeleteClick = (produto_id: string) => {
    setProdutoIdToDelete(produto_id);
    setShowConfirmation(true);
  };

  const handleDelete = async () => {
    setShowConfirmation(false);

    if (!produtoIdToDelete) return;

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("produto_id", produtoIdToDelete);

    if (error) {
      setMensagemAviso("Erro ao apagar produto: " + error.message);
      setMostrarAviso(true);
      return;
    }

    toast.success("Registro apagado com sucesso!");
    getProdutos();
  };

  // Filtrando os produtos com base na busca (searchQuery)
  const produtosFiltrados = produtos.filter((produto) =>
    produto.dsc_produto.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {produtoEditando ? (
        <ProdutosPage
          produto={{
            ...produtoEditando,
            preco_custo1: !isNaN(parseFloat(produtoEditando.preco_custo1))
              ? parseFloat(produtoEditando.preco_custo1).toFixed(2)
              : "0.00",

            desconto: !isNaN(parseFloat(produtoEditando.desconto))
              ? parseFloat(produtoEditando.desconto).toFixed(2)
              : "0.00",

            categoria_id: produtoEditando.categoria_id
              ? produtoEditando.categoria_id.toString()
              : "0",

            unidade_fardo: produtoEditando.unidade_fardo,

            mililitros: !isNaN(parseFloat(produtoEditando.mililitros))
              ? parseFloat(produtoEditando.mililitros).toFixed(2)
              : "0.00",

            doses: !isNaN(parseFloat(produtoEditando.doses))
              ? parseFloat(produtoEditando.doses).toFixed(2)
              : "0.00",

            estoque: !isNaN(parseFloat(produtoEditando.estoque))
              ? parseFloat(produtoEditando.estoque).toFixed(2)
              : "0.00",

            preco_venda1: !isNaN(parseFloat(produtoEditando.preco_venda1))
              ? parseFloat(produtoEditando.preco_venda1).toFixed(2)
              : "0.00",

            margem1: !isNaN(parseFloat(produtoEditando.margem1))
              ? parseFloat(produtoEditando.margem1).toFixed(2)
              : "0.00",

            valor_dose: !isNaN(parseFloat(produtoEditando.valor_dose))
              ? parseFloat(produtoEditando.valor_dose).toFixed(2)
              : "0.00",
          }}
          onClose={handleCloseForm}
          onSave={() => {
            getProdutos(); // <- atualiza os produtos
            handleCloseForm(); // <- fecha o formulário
          }}
        />
      ) : (
        <>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <Input
            type="text"
            placeholder="Pesquisar registros..."
            className="w-full my-4 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center mb-4">
            <div className="flex gap-2 ml-auto">
              <Button className="cursor-pointer" onClick={handleNew}>
                <Plus className="w-4 h-4 mr-2" /> Novo
              </Button>
              <Button
                className="cursor-pointer"
                onClick={() => {
                  getProdutos();
                }}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                <span className="max-[400px]:hidden">Atualizar</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtosFiltrados.map(
              (
                produto // <-- Usando o filtro
              ) => (
                <Card
                  key={produto.produto_id}
                  className="p-4 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="font-semibold text-lg">
                      {produto.dsc_produto}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Código: {produto.produto_id}
                    </p>
                    <p className="text-sm mt-1">Estoque: {produto.estoque}</p>
                    <p className="text-sm">
                      Preço de Venda: R${" "}
                      {parseFloat(produto.preco_venda1).toFixed(2)}
                    </p>
                    <p className="text-sm">
                      Preço de Custo: R${" "}
                      {parseFloat(produto.preco_custo1).toFixed(2)}
                    </p>
                    <p className="text-sm">
                      Margem de Lucro: {parseFloat(produto.margem1).toFixed(2)}{" "}
                      %
                    </p>
                    <p className="text-sm">
                      Categoria: {produto.categorias?.dsc_categoria}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(produto)}
                    >
                      <Pencil className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    <Button
                      className="cursor-pointer"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(produto.produto_id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Apagar
                    </Button>
                  </div>
                </Card>
              )
            )}
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
