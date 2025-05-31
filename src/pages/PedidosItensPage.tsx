import { useState } from "react";
import { PedidoItemPayloadType, PedidoItemType, PedidosItensPageProps } from "@/types/pedido";
import GridRegistros from "../components/grid-registros";
import { type ColDef } from "ag-grid-community";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import { toast } from "sonner";
import ModalAviso from "@/components/modal-aviso";
import { Input } from "@/components/ui/input"; // ou outro componente de input que esteja usando
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import ModalBuscaProduto from "@/components/modal-busca-produto";
import { ProdutoType } from "@/types/produto";
import { ProdutoServices } from "@/services/produtoServices";


export function PedidosItensPage({
  p_id,
  registros,
  setRegistros,
  registrarExclusao,
}: PedidosItensPageProps) {
  const [registroEditando, setRegistroEditando] =
    useState<PedidoItemType | null>(null);
  const [registroIdADeletar, setRegistroIdADeletar] = useState<number | null>(
    null
  );

  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [abrirModalBuscaProduto, setAbrirModalBuscaProduto] = useState(false);
  const [produto, setProduto] = useState<ProdutoType>({
    produto_id: 0,
    dsc_produto: "",
    estoque: 0,
    preco_venda1: 0,
    preco_custo1: 0,
    desconto: 0,
    categoria_id: 0,
    unidade_fardo: 0,
    mililitros: 0,
    doses: 0,
    margem1: 0,
    valor_dose: 0,
    vr_desconto: 0,
  });

  const aoEditar = async (p_registro: PedidoItemType) => {
    setRegistroEditando(p_registro);

    if (p_registro.produto_id !== 0) {
      const produto = await ProdutoServices.buscarRegistro(
        Number(p_registro.produto_id)
      );
      setProduto(produto);
    }

    setVrItem(p_registro.vr_item);
    setVrUnit(p_registro.vr_unit);
    setQuantidade(p_registro.quantidade);
  };

  const aoDeletar = async () => {
    if (!registroIdADeletar) return;

    setMostrarConfirmacao(false);

    // Remove o item da lista de registros
    setRegistros((prev) =>
      prev.filter((item) => item.pedido_item_id !== registroIdADeletar)
    );

    if (registroIdADeletar !== 0) {
      registrarExclusao(registroIdADeletar);
    }

    toast.success("Registro apagado com sucesso!");
  };

  const antesDeDeletar = (p_registro: PedidoItemType) => {
    setRegistroIdADeletar(p_registro.pedido_item_id);
    setMostrarConfirmacao(true);
  };

  const aoSalvar = async (payload: PedidoItemPayloadType) => {
    if (!registroEditando) {
      setMensagemAviso("Erro inesperado ao salvar. Tente novamente.");
      setMostrarAviso(true);
      return;
    }

    const registroParaSalvar = {
      ...registroEditando,
      ...payload,
      produtos: {
        ...registroEditando.produtos,
        dsc_produto: produto.dsc_produto ?? "",
      },
    };

    // Validações básicas
    if (!registroParaSalvar.vr_unit || registroParaSalvar.vr_unit <= 0) {
      setMensagemAviso("Valor unitário não pode estar vazio ou zero.");
      setMostrarAviso(true);
      return;
    }

    if (!registroParaSalvar.produto_id) {
      setMensagemAviso("Produto não pode estar vazio.");
      setMostrarAviso(true);
      return;
    }

    if (!registroParaSalvar.quantidade || registroParaSalvar.quantidade <= 0) {
      setMensagemAviso("Quantidade deve ser maior que zero.");
      setMostrarAviso(true);
      return;
    }

    // // Exemplo de verificação de duplicidade (descomente se necessário)
    // const duplicado = await PedidoItensService.verificaDuplicidade(
    //   registroParaSalvar.pedido_id,
    //   registroParaSalvar.produto_id
    // );
    // if (duplicado) {
    //   setMensagemAviso("Este produto já foi adicionado ao pedido.");
    //   setMostrarAviso(true);
    //   return;
    // }

    if (registroParaSalvar.pedido_item_id === 0) {
      // Novo item: adiciona ao array
      setRegistros((prev) => [...prev, { ...registroParaSalvar }]); // Coloque o ID real se o backend retornar
    } else {
      // Item existente: atualiza no array

      setRegistros((prev) =>
        prev.map((item) =>
          item.pedido_item_id === registroParaSalvar.pedido_item_id
            ? registroParaSalvar
            : item
        )
      );
    }    
  };

  const colunasGridItens: ColDef[] = [
    {
      field: "pedido_item_id",
      headerName: "Código",
      editable: false,
      filter: "agNumberColumnFilter",
    },
    {
      field: "dt_inc",
      headerName: "Dt. Inclusão",
      editable: false,
      filter: "agTextColumnFilter",
      valueFormatter: (params) => {
        if (!params.value) return "";
        const date = new Date(params.value);
        return date.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      },
    },
    {
      field: "produtos.dsc_produto",
      headerName: "Produto",
      editable: false,
      filter: "agTextColumnFilter",
    },
    {
      field: "vr_unit",
      headerName: "Vr. Unit.",
      editable: true,
      filter: "agNumberColumnFilter",
      valueFormatter: (params) =>
        params.value?.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }) || "",
    },
    {
      field: "quantidade",
      headerName: "Quantidade",
      editable: true,
      filter: "agNumberColumnFilter",
      valueFormatter: (params) =>
        params.value?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ||
        "",
    },
    {
      field: "vr_item",
      headerName: "Vr. Item",
      editable: true,
      filter: "agNumberColumnFilter",
      valueFormatter: (params) =>
        params.value?.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }) || "",
    },
  ];

  const aoEditarCampoNumerico = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let novoValor = value.replace(/[^0-9.,]/g, "").replace(",", ".");

    if (novoValor.includes(".")) {
      const [inteiro, decimal] = novoValor.split(".");
      novoValor = inteiro + "." + decimal.slice(0, 2);
    }

    if (name === "vr_unit") {
      setVrUnit(novoValor);
      const novoVrItem = Number(Number(quantidade) * Number(novoValor)).toFixed(
        2
      );
      setVrItem(Number(novoVrItem));
    } else if (name === "quantidade") {
      setQuantidade(novoValor);
      const novoVrItem = Number(Number(vr_unit) * Number(novoValor)).toFixed(2);
      setVrItem(Number(novoVrItem));
    }
  };

  const [vr_item, setVrItem] = useState(registroEditando?.vr_item ?? "");

  const [vr_unit, setVrUnit] = useState(registroEditando?.vr_unit ?? "");

  const [quantidade, setQuantidade] = useState(
    registroEditando?.quantidade ?? ""
  );

  return (
    <>
      <div className="h-full flex flex-col px-6">
        {registroEditando && (
          <Card className="mb-6 p-6">
            <h3 className="text-sm font-semibold border-b pb-1 text-black-700 tracking-wide">
              Item do Pedido
            </h3>

            <div className="flex w-full">
              <div className="w-1/2 grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-2 items-end">
                <div className="space-y-2 w-32">
                  <Label htmlFor="produto_id">Código do Produto</Label>
                  <Input placeholder="" value={produto.produto_id || ""} />
                </div>
                <div className="space-y-2 w-10">
                  <Label className="invisible">Buscar</Label>
                  <button
                    onClick={() => setAbrirModalBuscaProduto(true)}
                    type="button"
                    className="w-10 h-9 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dsc_produto">Descrição</Label>
                  <Input
                    id="dsc_produto"
                    name="dsc_produto"
                    value={produto.dsc_produto || ""}
                  />
                </div>
              </div>

              <div className="w-1/2 grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="vr_unit">Valor Unitário</Label>
                  <Input
                    name="vr_unit"
                    placeholder=""
                    value={vr_unit}
                    onChange={aoEditarCampoNumerico}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    name="quantidade"
                    placeholder=""
                    value={quantidade}
                    onChange={aoEditarCampoNumerico}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vr_item">Valor Item</Label>
                  <Input
                    placeholder=""
                    value={vr_item}
                    onChange={aoEditarCampoNumerico}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => setRegistroEditando(null)}
              >
                Cancelar
              </Button>

              <Button
                className="cursor-pointer"
                onClick={() =>
                  aoSalvar({
                    pedido_id: p_id,
                    produto_id: produto.produto_id ?? 0,
                    quantidade: Number(quantidade),
                    vr_unit: Number(vr_unit),
                    vr_item: Number(vr_item),
                  })
                }
              >
                Salvar
              </Button>
            </div>
          </Card>
        )}

        <GridRegistros
          registros={registros}
          colunas={colunasGridItens}
          campoRodape=""
          aoEditar={aoEditar}
          antesDeDeletar={antesDeDeletar}
        />

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
        <ModalBuscaProduto
          open={abrirModalBuscaProduto}
          onClose={() => setAbrirModalBuscaProduto(false)}
          onSelect={(produto) => {
            setProduto((prev) => ({
              ...prev,
              produto_id: produto.produto_id,
              dsc_produto: produto.dsc_produto,
              estoque: produto.estoque,
              preco_venda1: produto.preco_venda1,
              preco_custo1: produto.preco_custo1,
              desconto: produto.desconto,
              categoria_id: produto.categoria_id,
              unidade_fardo: produto.unidade_fardo,
              mililitros: produto.mililitros,
              doses: produto.doses,
              margem1: produto.margem1,
              valor_dose: produto.valor_dose,
              vr_desconto: produto.vr_desconto,
            }));

            setVrUnit(produto.preco_venda1);
            setVrItem(produto.preco_venda1 * Number(quantidade));
          }}
        />
      </div>
    </>
  );
}
