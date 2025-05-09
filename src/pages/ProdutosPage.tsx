import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "../lib/subabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Trash2 } from "lucide-react";
import ModalBuscaProduto from "@/components/modal-busca-produto";
import ModalBuscaCategoria from "@/components/modal-busca-categoria";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";

type ProdutoFormProps = {
  produto?: {
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
    margem1: string;
    valor_dose: string;
  };
  onClose?: () => void;
  onSave?: () => void;
};

export function ProdutosPage({ produto, onClose, onSave }: ProdutoFormProps) {
  const [form, setForm] = useState(produto);
  const [abrirModalBuscaCategoria, setAbrirModalBuscaCategoria] =
    useState(false);

  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [abrirModalBusca, setAbrirModalBusca] = useState(false);

  const [formComposicao, setFormComposicao] = useState({
    produto_composicao_id: "",
    produtopai_id: "",
    produtofilho_id: "",
    dsc_produto: "",
    preco_custo: "",
  });

  type ProdutoComposicao = {
    produto_composicao_id: number;
    produtofilho_id: number;
    produtopai_id: number;
    produtos: {
      valor_dose: number;
      dsc_produto: string;
    };
    vr_custo: number;
  };

  const [produtosComposicao, setProdutosComposicao] = useState<
    ProdutoComposicao[]
  >([]);

  type ComposicaoTemp = {
    produtofilho_id: number;
    preco_custo: number;
    dsc_produto: string;
  };

  const [composicoesTemp, setComposicoesTemp] = useState<ComposicaoTemp[]>([]);

  useEffect(() => {
    carregarComposicao();
  }, []); // O array vazio significa que isso só vai ser chamado uma vez, ao montar o componente

  const somaCusto = produtosComposicao
    .reduce((acc, produto) => acc + parseFloat(produto.vr_custo), 0)
    .toFixed(2);

  const calcularMargem = (precoCusto: string, precoVenda: string) => {
    const custo = parseFloat(precoCusto.replace(",", "."));
    const venda = parseFloat(precoVenda.replace(",", "."));

    var margem;

    if (venda == 0 || custo == 0 || isNaN(venda) || isNaN(custo)) {
      margem = 0;
    } else {
      margem = ((venda - custo) / venda) * 100;
    }

    setForm((prev) => ({
      ...prev,
      margem1: parseFloat(margem).toFixed(2),
    }));
  };

  const calcularDoses = (precoCusto: string, mililitros: string) => {
    const quantidadeML = parseFloat(mililitros.replace(",", "."));
    const dosesCalculadas = quantidadeML / 50;

    if (!isNaN(quantidadeML) && quantidadeML !== 0) {
      setForm((prev) => ({
        ...prev,
        doses: dosesCalculadas,
        valor_dose: parseFloat(precoCusto / dosesCalculadas).toFixed(2),
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const numericFields = [
      "preco_custo1",
      "preco_venda1",
      "desconto",
      "mililitros",
      "doses",
      "margem1",
      "valor_dose",
    ];

    var sanitizedValue = numericFields.includes(name)
      ? value.replace(",", ".")
      : value;

    if (numericFields.includes(name)) {
      const match = sanitizedValue.match(/^\d*\.?\d{0,2}/);
      sanitizedValue = match ? match[0] : "";
    }

    setForm((prev) => {
      const updated = { ...prev, [name]: sanitizedValue };

      if (name === "preco_custo1" || name === "preco_venda1") {
        calcularMargem(updated.preco_custo1, updated.preco_venda1);
        calcularDoses(updated.preco_custo1, updated.mililitros);
      }

      if (name === "mililitros") {
        calcularDoses(updated.preco_custo1, updated.mililitros);
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const camposNumericos = [
      "preco_custo1",
      "preco_venda1",
      "desconto",
      "unidade_fardo",
      "mililitros",
      "doses",
      "estoque",
      "margem1",
    ];

    const formToSave = { ...form };

    if (!formToSave.produto_id || formToSave.produto_id === "0") {
      delete formToSave.produto_id;
    }

    if (!formToSave.categoria_id || formToSave.categoria_id === "0") {
      delete formToSave.categoria_id;
    }

    if (formToSave.dsc_categoria) {
      delete formToSave.dsc_categoria;
    }

    delete formToSave.categorias;

    for (const [campo, valor] of Object.entries(formToSave)) {
      if (valor === null || valor === "" || valor === undefined) {
        if (camposNumericos.includes(campo)) {
          formToSave[campo] = "0.00"; // ou "0" se preferir
        }
      }
    }

    if (!formToSave.dsc_produto.trim()) {
      setMensagemAviso("Descrição não pode estar vazia.");
      setMostrarAviso(true);

      return;
    }

    const { error } = await supabase
      .from("produtos")
      .upsert(formToSave, { onConflict: "produto_id" });

    if (error) {
      setMensagemAviso("Erro ao salvar produto: " + error.message);
      setMostrarAviso(true);

      return;
    }

    toast.success("Produto salvo com sucesso!");

    onSave?.();
    onClose?.();
  };

  const selecionarProdutoComposicao = (produtoSelecionado) => {
    const precoUnitario = parseFloat(
      produtoSelecionado.valor_dose > 0
        ? produtoSelecionado.valor_dose
        : produtoSelecionado.preco_custo1
    );

    setFormComposicao((prev) => ({
      ...prev,
      produtopai_id: form.produto_id,
      produtofilho_id: produtoSelecionado.produto_id,
      dsc_produto: produtoSelecionado.dsc_produto,
      preco_unitario: precoUnitario.toFixed(2),
      quantidade: 1,
      preco_custo: precoUnitario.toFixed(2),
    }));

    setAbrirModalBusca(false);
  };

  const carregarComposicao = async () => {
    if (produto.produto_id == 0) {
      setProdutosComposicao(composicoesTemp);
      return;
    }

    const { data, error } = await supabase
      .from("produtos_composicao")
      .select(
        `
        produto_composicao_id,
        produtopai_id,
        produtofilho_id,
        vr_custo,
        produtos (
          dsc_produto,
          valor_dose
        )
      `
      )
      .eq("produtopai_id", produto.produto_id); //

    if (error) {
      setMensagemAviso("Erro ao carregar produtos: " + error.message);
      setMostrarAviso(true);
    } else {
      console.log(data);
      setProdutosComposicao(data); // Atualiza o estado com os produtos carregados
    }
  };

  const adicionarProdutoNaComposicao = async () => {
    const produtopai_id = form?.produto_id;

    const { produtofilho_id, preco_custo } = formComposicao;

    if (produtopai_id != 0) {
      // Inserir produto na tabela produtos_composicao
      const { error } = await supabase
        .from("produtos_composicao")
        .insert([{ produtopai_id, produtofilho_id, vr_custo: preco_custo }]);

      if (error) {
        setMensagemAviso("Erro ao adicionar produto: " + error.message);
        setMostrarAviso(true);
      }
    } else {
      // Armazena em memória se o produto ainda não foi salvo

      setComposicoesTemp((prev) => [
        ...prev,
        {
          produtofilho_id: Number(produtofilho_id),
          preco_custo: Number(preco_custo),
          dsc_produto: String(dsc_produto),
        },
      ]);
    }

    carregarComposicao();

    setFormComposicao({
      produto_composicao_id: "",
      produtopai_id: "",
      produtofilho_id: "",
      preco_custo: "",
      dsc_produto: "",
    });
  };

  const removerProdutoDaComposicao = async (produto_composicao_id) => {
    const { error } = await supabase
      .from("produtos_composicao")
      .delete()
      .eq("produto_composicao_id", produto_composicao_id);

    if (error) {
      setMensagemAviso("Erro ao remover produto: " + error.message);
      setMostrarAviso(true);

      return;
    }

    toast.success("Produto removido com sucesso!");

    carregarComposicao();
  };

  return (
    <Tabs defaultValue="geral" className="w-full h-full max-w-none mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="geral">Geral</TabsTrigger>
        <TabsTrigger value="composicao">Composição</TabsTrigger>
      </TabsList>
      <TabsContent value="geral">
        <Card className="w-full h-full max-w-none mx-auto">
          <CardHeader>
            <CardTitle>{produto ? "Editar Produto" : "Novo Produto"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dsc_produto">Descrição</Label>
                <Input
                  id="dsc_produto"
                  name="dsc_produto"
                  value={form.dsc_produto}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="produto_id">Código do Produto</Label>
                  <Input
                    id="produto_id"
                    name="produto_id"
                    value={form.produto_id}
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estoque">Estoque</Label>
                  <Input
                    id="estoque"
                    name="estoque"
                    value={form.estoque}
                    onChange={handleChange}
                    onBlur={(e) => {
                      const valor = parseFloat(
                        e.target.value.replace(",", ".")
                      );
                      if (!isNaN(valor)) {
                        setForm((prev) => ({
                          ...prev,
                          estoque: valor.toFixed(2),
                        }));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco_custo1">Preço de Custo</Label>
                  <Input
                    id="preco_custo1"
                    name="preco_custo1"
                    value={form.preco_custo1}
                    onChange={handleChange}
                    onBlur={(e) => {
                      const valor = parseFloat(
                        e.target.value.replace(",", ".")
                      );
                      if (!isNaN(valor)) {
                        setForm((prev) => ({
                          ...prev,
                          preco_custo1: valor.toFixed(2),
                        }));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco_venda1">Preço de Venda</Label>
                  <Input
                    id="preco_venda1"
                    name="preco_venda1"
                    value={form.preco_venda1}
                    onChange={handleChange}
                    onBlur={(e) => {
                      const valor = parseFloat(
                        e.target.value.replace(",", ".")
                      );
                      if (!isNaN(valor)) {
                        setForm((prev) => ({
                          ...prev,
                          preco_venda1: valor.toFixed(2),
                        }));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margem1">Margem de Lucro (%)</Label>
                  <Input
                    id="margem1"
                    name="margem1"
                    value={form.margem1}
                    onChange={handleChange}
                    readOnly
                    onBlur={(e) => {
                      const valor = parseFloat(
                        e.target.value.replace(",", ".")
                      );
                      if (!isNaN(valor)) {
                        setForm((prev) => ({
                          ...prev,
                          margem1: valor.toFixed(2),
                        }));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desconto">Desconto (%)</Label>
                  <Input
                    id="desconto"
                    name="desconto"
                    onChange={handleChange}
                    onBlur={(e) => {
                      const valor = parseFloat(
                        e.target.value.replace(",", ".")
                      );
                      if (!isNaN(valor)) {
                        setForm((prev) => ({
                          ...prev,
                          desconto: valor.toFixed(2),
                        }));
                      }
                    }}
                    value={form?.desconto}
                  />
                </div>
              </div>

              <div className="grid grid-cols-[auto_auto_1fr] gap-2 items-end">
                <div className="space-y-2 w-32">
                  <Label htmlFor="categoria_id">Código da Categoria</Label>
                  <Input
                    id="categoria_id"
                    name="categoria_id"
                    value={form.categoria_id}
                    readOnly
                  />
                </div>

                <div className="space-y-2 w-10">
                  <Label className="invisible">Buscar</Label>
                  <button
                    onClick={() => setAbrirModalBuscaCategoria(true)}
                    type="button"
                    className="w-10 h-10 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dsc_categoria">Descrição da Categoria</Label>
                  <Input
                    id="dsc_categoria"
                    name="dsc_categoria"
                    // value={form.dsc_categoria || ""}
                    value={
                      form.categorias?.dsc_categoria || form.dsc_categoria || ""
                    }
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unidade_fardo">Unidade/Fardo</Label>
                  <Input
                    id="unidade_fardo"
                    name="unidade_fardo"
                    value={form.unidade_fardo}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mililitros">Mililitros</Label>
                  <Input
                    id="mililitros"
                    name="mililitros"
                    value={form.mililitros}
                    onChange={handleChange}
                    onBlur={(e) => {
                      const valor = parseFloat(
                        e.target.value.replace(",", ".")
                      );
                      if (!isNaN(valor)) {
                        setForm((prev) => ({
                          ...prev,
                          mililitros: valor.toFixed(2),
                        }));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doses">Doses</Label>
                  <Input
                    id="doses"
                    name="doses"
                    value={form.doses}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_dose">Preço de Custo da Dose</Label>
                  <Input
                    id="valor_dose"
                    name="valor_dose"
                    value={form.valor_dose}
                    onChange={handleChange}
                    onBlur={(e) => {
                      const valor = parseFloat(
                        e.target.value.replace(",", ".")
                      );
                      if (!isNaN(valor)) {
                        setForm((prev) => ({
                          ...prev,
                          valor_dose: valor.toFixed(2),
                        }));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                {onClose && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="cursor-pointer w-auto"
                  >
                    Cancelar
                  </Button>
                )}
                <Button type="submit" className="cursor-pointer w-auto">
                  Salvar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="composicao">
        <Card className="w-full h-full max-w-none mx-auto">
          <CardHeader>
            <CardTitle>
              Composição do Produto - {produto?.dsc_produto}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-2 items-end">
                {/* Código do Produto */}
                <div className="space-y-2 w-32">
                  <Label htmlFor="produto_id">Código</Label>
                  <Input
                    id="produto_id"
                    name="produto_id"
                    value={formComposicao.produtofilho_id}
                    readOnly
                  />
                </div>

                {/* Botão de Pesquisa */}
                <div className="space-y-2 w-10">
                  <Label className="invisible">Buscar</Label>
                  <button
                    onClick={() => setAbrirModalBusca(true)}
                    type="button"
                    className="w-10 h-10 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="dsc_produto">Descrição</Label>
                  <Input
                    id="dsc_produto"
                    name="dsc_produto"
                    value={formComposicao.dsc_produto}
                    onChange={handleChange}
                  />
                </div>

                {/* Quantidade */}
                <div className="space-y-2 w-24">
                  <Label htmlFor="quantidade">Qtd.</Label>
                  <Input
                    id="quantidade"
                    name="quantidade"
                    type="number"
                    min="1"
                    value={formComposicao.quantidade || 1}
                    onChange={(e) => {
                      const quantidade = parseFloat(e.target.value) || 1;
                      const precoUnitario = parseFloat(
                        formComposicao.preco_unitario || 0
                      );

                      setFormComposicao((prev) => ({
                        ...prev,
                        quantidade,
                        preco_custo: (quantidade * precoUnitario).toFixed(2),
                      }));
                    }}
                  />
                </div>

                {/* Preço de Custo */}
                <div className="space-y-2 w-28">
                  <Label htmlFor="preco_custo">Custo</Label>
                  <Input
                    id="preco_custo"
                    name="preco_custo"
                    value={formComposicao.preco_custo}
                    onChange={(e) => {
                      const preco = e.target.value.replace(",", ".");
                      setFormComposicao((prev) => ({
                        ...prev,
                        preco_custo: preco,
                      }));
                    }}
                    onBlur={(e) => {
                      const preco =
                        parseFloat(e.target.value.replace(",", ".")) || 0;
                      const quantidade = parseFloat(
                        formComposicao.quantidade || 1
                      );
                      setFormComposicao((prev) => ({
                        ...prev,
                        preco_custo: preco.toFixed(2),
                        preco_unitario: (preco / quantidade).toFixed(4),
                      }));
                    }}
                  />
                </div>

                {/* Botão Adicionar */}
                <div className="space-y-2 w-10">
                  <Label className="invisible">Add</Label>
                  <button
                    type="button"
                    onClick={adicionarProdutoNaComposicao}
                    className="w-10 h-10 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Custo</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosComposicao.map((produto, index) => (
                    <TableRow key={index}>
                      <TableCell>{produto.produtofilho_id}</TableCell>
                      <TableCell>{produto.produtos.dsc_produto}</TableCell>
                      <TableCell>
                        {Number(produto.vr_custo).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          className="cursor-pointer"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            removerProdutoDaComposicao(
                              produto.produto_composicao_id
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Apagar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center gap-2">
                <strong>Somatória do Custo:</strong>
                <span>R$ {parseFloat(somaCusto).toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      preco_custo1: parseFloat(somaCusto).toFixed(2),
                    }));

                    calcularMargem(
                      parseFloat(somaCusto).toFixed(2),
                      form.preco_venda1
                    );
                  }}
                  className="text-sm px-2 py-1 border rounded hover:bg-accent"
                >
                  Usar no Custo Final
                </button>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                {onClose && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="cursor-pointer w-auto"
                  >
                    Cancelar
                  </Button>
                )}
                <Button type="submit" className="cursor-pointer w-auto">
                  Salvar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <ModalBuscaProduto
        open={abrirModalBusca}
        onClose={() => setAbrirModalBusca(false)}
        onSelect={selecionarProdutoComposicao}
      />
      <ModalBuscaCategoria
        open={abrirModalBuscaCategoria}
        onClose={() => setAbrirModalBuscaCategoria(false)}
        onSelect={(categoria) => {
          setForm((prev) => ({
            ...prev,
            categoria_id: categoria.categoria_id,
            categorias: {
              ...prev.categorias, // mantém outras propriedades se existirem
              dsc_categoria: categoria.dsc_categoria,
            },
          }));
        }}
      />
      <ModalAviso
        open={mostrarAviso}
        onClose={setMostrarAviso}
        mensagem={mensagemAviso}
      />
    </Tabs>
  );
}
