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

type ProdutoType = {
  produto_id: number;
  dsc_produto: string;
  valor_dose: number | string;
  preco_custo1: number | string;
};

type ProdutoRelacionadoType = {
  dsc_produto: string;
  valor_dose: number;
};

type FormType = {
  produto_id?: string | number;
  categoria_id?: string | number;
  dsc_categoria?: string;
  categorias?: {
    dsc_categoria: string;
  };
  dsc_produto: string;
  estoque: string | number;
  preco_venda1: string | number;
  preco_custo1: string | number;
  desconto: string | number;
  unidade_fardo: string | number;
  mililitros: string | number;
  doses: string | number;
  margem1: string | number;
  valor_dose: string | number;
};

type ProdutoComposicaoType = {
  produto_composicao_id: number;
  produtofilho_id: number;
  produtopai_id: number;
  produtos: {
    valor_dose: number;
    dsc_produto: string;
  };
  vr_custo: number;
};

type FormComposicaoType = {
  produto_composicao_id: string;
  produtopai_id: string;
  produtofilho_id: string;
  dsc_produto: string;
  vr_custo: string;
  quantidade: number;
  preco_unitario?: string;
};

type ComposicaoTempType = {
  produtopai_id: string;
  produtofilho_id: string;
  vr_custo: string;
  dsc_produto: string;
};

type ProdutoFormPropsType = {
  produto?: {
    produto_id: string | number;
    dsc_produto: string;
    estoque: string | number;
    preco_venda1: string | number;
    preco_custo1: string | number;
    desconto: string | number;
    categoria_id: string | number;
    unidade_fardo: string | number;
    mililitros: string | number;
    doses: string | number;
    margem1: string | number;
    valor_dose: string | number;
  };
  onClose?: () => void;
  onSave?: () => void;
};

const numericFields = [
  "preco_custo1",
  "preco_venda1",
  "desconto",
  "mililitros",
  "doses",
  "margem1",
  "valor_dose",
];

export function ProdutosPage({
  produto,
  onClose,
  onSave,
}: ProdutoFormPropsType) {
  const [form, setForm] = useState<FormType>(
    produto ?? {
      produto_id: "",
      dsc_produto: "",
      estoque: "",
      preco_venda1: "",
      preco_custo1: "",
      desconto: "",
      categoria_id: "",
      margem1: "",
      valor_dose: "",
      dsc_categoria: "",
      categorias: {
        dsc_categoria: "",
      },
      unidade_fardo: "",
      mililitros: "",
      doses: "",
    }
  );

  const [abrirModalBuscaCategoria, setAbrirModalBuscaCategoria] =
    useState(false);

  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [abrirModalBusca, setAbrirModalBusca] = useState(false);

  const [formComposicao, setFormComposicao] = useState<FormComposicaoType>({
    produto_composicao_id: "",
    produtopai_id: "",
    produtofilho_id: "",
    dsc_produto: "",
    vr_custo: "",
    quantidade: 1,
  });

  const [produtosComposicao, setProdutosComposicao] = useState<
    ProdutoComposicaoType[]
  >([]);

  const [composicoesTemp, setComposicoesTemp] = useState<ComposicaoTempType[]>(
    []
  );

  useEffect(() => {
    setTimeout(() => {
      carregarComposicao();
    }, 500); // 100ms de delay
  }, [composicoesTemp]); // dispara no mount também porque composicoesTemp já existe no estado

  const somaCusto = produtosComposicao
    .reduce(
      (acc, produto) =>
        acc +
        (typeof produto.vr_custo === "string"
          ? parseFloat(produto.vr_custo)
          : produto.vr_custo),
      0
    )
    .toFixed(2);

  const calcularMargem = (precoCusto: string, precoVenda: string) => {
    const custo = parseFloat(precoCusto.replace(",", "."));
    const venda = parseFloat(precoVenda.replace(",", "."));

    let margem = 0;

    if (venda == 0 || custo == 0 || isNaN(venda) || isNaN(custo)) {
      margem = 0;
    } else {
      margem = ((venda - custo) / venda) * 100;
    }

    setForm((prev) => ({
      ...prev,
      margem1: parseFloat(String(margem)).toFixed(2),
    }));
  };

  const calcularDoses = (precoCusto: string, mililitros: string) => {
    const quantidadeML = parseFloat(mililitros.replace(",", "."));
    const dosesCalculadas = quantidadeML / 50;

    if (!isNaN(quantidadeML) && quantidadeML !== 0) {
      setForm((prev) => ({
        ...prev,
        doses: dosesCalculadas,
        valor_dose: (parseFloat(precoCusto) / dosesCalculadas).toFixed(2),
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let sanitizedValue = numericFields.includes(name)
      ? value.replace(",", ".")
      : value;

    if (numericFields.includes(name)) {
      const match = sanitizedValue.match(/^\d*\.?\d{0,2}/);
      sanitizedValue = match ? match[0] : "";
    }

    setForm((prev) => {
      const updated = { ...prev, [name]: sanitizedValue };

      if (name === "preco_custo1" || name === "preco_venda1") {
        calcularMargem(
          String(updated.preco_custo1),
          String(updated.preco_venda1)
        );
        if ("mililitros" in updated)
          calcularDoses(
            String(updated.preco_custo1),
            String(updated.mililitros)
          );
      }

      if (name === "mililitros" && "mililitros" in updated) {
        calcularDoses(String(updated.preco_custo1), String(updated.mililitros));
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dadosForm = { ...form };

    const dadosFormLimpo: FormType = {
      ...dadosForm,
      estoque: dadosForm.estoque || "0.00",
      preco_venda1: dadosForm.preco_venda1 || "0.00",
      preco_custo1: dadosForm.preco_custo1 || "0.00",
      desconto: dadosForm.desconto || "0.00",
      mililitros: dadosForm.mililitros || "0.00",
      doses: dadosForm.doses || "0.00",
      margem1: dadosForm.margem1 || "0.00",
      valor_dose: dadosForm.valor_dose || "0.00",
    };

    delete dadosFormLimpo.categorias;
    delete dadosFormLimpo.dsc_categoria;

    if (
      dadosFormLimpo.categoria_id === "" ||
      dadosFormLimpo.categoria_id === "0"
    )
      delete dadosFormLimpo.categoria_id;

    if (dadosFormLimpo.produto_id === "" || dadosFormLimpo.produto_id === "0")
      delete dadosFormLimpo.produto_id;

    if (!(dadosFormLimpo.dsc_produto ?? "").trim()) {
      setMensagemAviso("Descrição não pode estar vazia.");
      setMostrarAviso(true);

      return;
    }

    const { data, error } = await supabase
      .from("produtos")
      .upsert([dadosFormLimpo], { onConflict: "produto_id" })
      .select();

    if (error) {
      setMensagemAviso("Erro ao salvar produto: " + error.message);
      setMostrarAviso(true);

      return;
    }

    if (composicoesTemp && composicoesTemp.length > 0) {
      const produtopai_id = data[0].produto_id;

      const composicoesTempComID = composicoesTemp.map((item) => ({
        ...item,
        produtopai_id: produtopai_id,
      }));

      const composicoesTempLimpo = composicoesTempComID.map((item) => ({
        produtopai_id: Number(item.produtopai_id),
        produtofilho_id: Number(item.produtofilho_id),
        vr_custo: item.vr_custo === "" ? "0.00" : item.vr_custo,
      }));

      const { error } = await supabase
        .from("produtos_composicao")
        .insert(composicoesTempLimpo);

      if (error) {
        setMensagemAviso(
          "Erro ao adicionar produto de composição: " + error.message
        );
        setMostrarAviso(true);
      }
    }

    toast.success("Produto salvo com sucesso!");
    setComposicoesTemp([]);

    onSave?.();
    onClose?.();
  };

  const selecionarProdutoComposicao = (produtoSelecionado: ProdutoType) => {
    const precoUnitario = parseFloat(
      +produtoSelecionado.valor_dose > 0
        ? String(produtoSelecionado.valor_dose)
        : String(produtoSelecionado.preco_custo1)
    );

    setFormComposicao((prev) => ({
      ...prev,
      produtopai_id: String(form.produto_id),
      produtofilho_id: String(produtoSelecionado.produto_id),
      dsc_produto: produtoSelecionado.dsc_produto,
      preco_unitario: precoUnitario.toFixed(2),
      quantidade: 1,
      vr_custo: precoUnitario.toFixed(2),
    }));

    setAbrirModalBusca(false);
  };

  const carregarComposicao = async () => {
    const composicoesEmMemoria: ProdutoComposicaoType[] = composicoesTemp.map(
      (item) => ({
        produto_composicao_id: 0,
        produtopai_id: Number(form.produto_id),
        produtofilho_id: parseFloat(item.produtofilho_id),
        produtos: {
          valor_dose: parseFloat(item.vr_custo),
          dsc_produto: item.dsc_produto,
        },
        vr_custo: parseFloat(item.vr_custo),
      })
    );
    if (composicoesEmMemoria && composicoesEmMemoria.length > 0) {
      setProdutosComposicao(composicoesEmMemoria);
    } else if (produto) {
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
        .eq("produtopai_id", produto.produto_id);

      if (error) {
        setMensagemAviso("Erro ao carregar produtos: " + error.message);
        setMostrarAviso(true);
      } else {
        const composicoesCorrigidas: ProdutoComposicaoType[] = (data || []).map(
          (item) => {
            const produto = item.produtos as unknown as ProdutoRelacionadoType;

            return {
              produto_composicao_id: item.produto_composicao_id,
              produtopai_id: Number(item.produtopai_id),
              produtofilho_id: Number(item.produtofilho_id),
              vr_custo: Number(item.vr_custo),
              produtos: {
                dsc_produto: produto?.dsc_produto ?? "",
                valor_dose: produto?.valor_dose ?? 0,
              },
            };
          }
        );

        setProdutosComposicao(composicoesCorrigidas);
      }
    }
  };

  const adicionarProdutoNaComposicao = async () => {
    const produtopai_id = form?.produto_id;

    const { produtofilho_id, vr_custo, dsc_produto } = formComposicao;

    if (Number(produtofilho_id) == 0) {
      setMensagemAviso("Nenhum produto selecionado, verifique.");
      setMostrarAviso(true);
      return;
    }

    if (Number(produtopai_id) !== 0 && Number(produtofilho_id) !== 0) {
      // Inserir produto na tabela produtos_composicao
      const { error } = await supabase
        .from("produtos_composicao")
        .insert([{ produtopai_id, produtofilho_id, vr_custo }]);

      if (error) {
        setMensagemAviso("Erro ao adicionar produto: " + error.message);
        setMostrarAviso(true);
      }
    } else {
      // Armazena em memória se o produto ainda não foi salvo

      setComposicoesTemp((prev) => [
        ...prev,
        {
          produtopai_id: "0",
          produtofilho_id: produtofilho_id,
          vr_custo: vr_custo,
          dsc_produto: dsc_produto,
        },
      ]);
    }

    carregarComposicao();

    setFormComposicao({
      produto_composicao_id: "",
      produtopai_id: "",
      produtofilho_id: "",
      vr_custo: "",
      dsc_produto: "",
      quantidade: 1,
    });
  };

  const removerProdutoDaComposicao = async (produto_composicao_id: number) => {
    // if (composicoesTemp && composicoesTemp.length > 0) {

    // }

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
      <TabsList className="flex space-x-2 bg-muted p-1 rounded-xl shadow-inner border">
        <TabsTrigger value="geral">Geral</TabsTrigger>
        <TabsTrigger value="composicao">Composição</TabsTrigger>
      </TabsList>
      <TabsContent value="geral">
        <Card className="w-full h-full max-w-none mx-auto">
          <CardHeader>
            <CardTitle>
              {produto?.produto_id != 0 ? "Editar Produto" : "Novo Produto"}
            </CardTitle>
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
                    className="w-10 h-9 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dsc_categoria">Descrição da Categoria</Label>
                  <Input
                    id="dsc_categoria"
                    name="dsc_categoria"
                    value={
                      form.categorias?.dsc_categoria || form.dsc_categoria || ""
                    }
                    readOnly
                  />
                </div>
              </div>

              <Card className="p-4">
                <h3 className="text-sm font-semibold border-b pb-1 text-black-700 tracking-wide">
                  Unidade
                </h3>

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
              </Card>

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
              Composição do Produto
              {produto?.dsc_produto ? ` - ${produto.dsc_produto}` : ""}
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
                    className="w-10 h-9 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent cursor-pointer"
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
                  <Label htmlFor="quantidade">Qtd. Doses</Label>
                  <Input
                    id="quantidade"
                    name="quantidade"
                    type="number"
                    min="1"
                    value={formComposicao.quantidade || 1}
                    onChange={(e) => {
                      const quantidade = parseFloat(e.target.value) || 1;
                      const precoUnitario = parseFloat(
                        formComposicao.preco_unitario || "0"
                      );

                      setFormComposicao((prev) => ({
                        ...prev,
                        quantidade,
                        vr_custo: (quantidade * precoUnitario).toFixed(2),
                      }));
                    }}
                  />
                </div>

                {/* Preço de Custo */}
                <div className="space-y-2 w-28">
                  <Label htmlFor="vr_custo">Custo</Label>
                  <Input
                    id="vr_custo"
                    name="vr_custo"
                    value={formComposicao.vr_custo}
                    onChange={(e) => {
                      const preco = e.target.value.replace(",", ".");
                      setFormComposicao((prev) => ({
                        ...prev,
                        vr_custo: preco,
                      }));
                    }}
                    onBlur={(e) => {
                      const preco =
                        parseFloat(e.target.value.replace(",", ".")) || 0;

                      const quantidade = formComposicao.quantidade || 1;

                      setFormComposicao((prev) => ({
                        ...prev,
                        vr_custo: preco.toFixed(2),
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
                    className="w-10 h-10 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Card className="p-4">
                <h3 className="text-sm font-semibold border-b pb-1 text-black tracking-wide">
                  Composições
                </h3>

                {/* Conteúdo do grid ou tabela aqui */}
                <Table>
                  <TableHeader className="p-2 border rounded-md bg-gray-100">
                    <TableRow>
                      <TableCell className="font-semibold text-left px-4 py-2 text-gray-800">
                        Código
                      </TableCell>
                      <TableCell className="font-semibold text-left px-4 py-2 text-gray-800">
                        Descrição
                      </TableCell>
                      <TableCell className="font-semibold text-left px-4 py-2 text-gray-800">
                        Custo
                      </TableCell>
                      <TableCell className="font-semibold text-left px-4 py-2 text-gray-800">
                        Ações
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtosComposicao.map((produto, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="px-4 py-2">
                          {produto.produtofilho_id}
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          {produto.produtos.dsc_produto}
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          R$ {Number(produto.vr_custo).toFixed(2)}
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          <Button
                            type="button"
                            className="flex items-center gap-1 cursor-pointer"
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              removerProdutoDaComposicao(
                                produto.produto_composicao_id
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" /> Apagar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-6 p-2 border rounded-md flex flex-wrap items-center gap-4 justify-between bg-gray-100">
                  <div className="text-sm font-medium">
                    Somatória do Custo:{" "}
                    <span className="text-base font-bold text-gray-800">
                      R$ {parseFloat(somaCusto).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        preco_custo1: parseFloat(somaCusto).toFixed(2),
                      }));

                      calcularMargem(
                        parseFloat(somaCusto).toFixed(2),
                        String(form.preco_venda1)
                      );
                    }}
                    className="text-sm px-3 py-2 border rounded hover:bg-accent cursor-pointer"
                  >
                    Usar no Custo Final
                  </Button>
                </div>
              </Card>
            </form>
          </CardContent>
        </Card>
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
      </TabsContent>
      <ModalBuscaProduto
        abrir={abrirModalBusca}
        aoFechar={() => setAbrirModalBusca(false)}
        aoSelecionar={selecionarProdutoComposicao}
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
