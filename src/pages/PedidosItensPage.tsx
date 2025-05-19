import { useState } from "react";
import { PedidoItemPayloadType, PedidoItemType } from "@/types/pedido";
import GridRegistros from "../components/grid-registros";
import type { ColDef } from "ag-grid-community";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import { toast } from "sonner";
import { PedidoItemServices } from "@/services/pedidoItemServices";
import ModalAviso from "@/components/modal-aviso";
import { Input } from "@/components/ui/input"; // ou outro componente de input que esteja usando
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

type PedidosItensPageProps = {
  p_id: number;
  registros: PedidoItemType[];
};

export function PedidosItensPage({ p_id, registros }: PedidosItensPageProps) {
  const [registroEditando, setRegistroEditando] =
    useState<PedidoItemType | null>(null);
  const [registroIdADeletar, setRegistroIdADeletar] = useState<number | null>(
    null
  );
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const aoEditar = async (p_registro: PedidoItemType) => {
    setRegistroEditando(p_registro);
  };

  const aoDeletar = async () => {
    if (!registroIdADeletar) return;

    setMostrarConfirmacao(false);

    const error = await PedidoItemServices.deletar(registroIdADeletar);

    if (error) {
      setMensagemAviso("Erro ao apagar registro: " + error);
      setMostrarAviso(true);
      return;
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

    const registroParaSalvar: PedidoItemType = {
      ...registroEditando,
      ...payload,
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

    // Inserção ou atualização
    if (registroParaSalvar.pedido_item_id === 0) {
      const error = await PedidoItemServices.inserir(payload);

      if (error) {
        setMensagemAviso("Erro ao inserir item do pedido: " + error);
        setMostrarAviso(true);
        return;
      }
    } else {
      const error = await PedidoItemServices.atualizar(
        payload,
        registroEditando.pedido_item_id
      );

      if (error) {
        setMensagemAviso("Erro ao atualizar item do pedido: " + error);
        setMostrarAviso(true);
        return;
      }
    }

    toast.success("Item salvo com sucesso!");
    // aoFecharFormulario(); // Fecha o formulário/modal
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
                  <Input
                    placeholder=""
                    value={registroEditando.produto_id}
                    onChange={(e) =>
                      setRegistroEditando((prev) =>
                        prev
                          ? { ...prev, produto_id: Number(e.target.value) }
                          : null
                      )
                    }
                  />
                </div>
                <div className="space-y-2 w-10">
                  <Label className="invisible">Buscar</Label>
                  <button
                    // onClick={() => setAbrirModalBusca(true)}
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
                    // value={formComposicao.dsc_produto}
                    // onChange={handleChange}
                  />
                </div>
              </div>

              <div className="w-1/2 grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="vr_unit">Valor Unitário</Label>
                  <Input
                    placeholder=""
                    value={registroEditando.vr_unit}
                    onChange={(e) =>
                      setRegistroEditando((prev) =>
                        prev
                          ? { ...prev, vr_unit: Number(e.target.value) }
                          : null
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    placeholder=""
                    value={registroEditando.quantidade}
                    onChange={(e) =>
                      setRegistroEditando((prev) =>
                        prev
                          ? { ...prev, quantidade: Number(e.target.value) }
                          : null
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vr_item">Valor Item</Label>
                  <Input
                    placeholder=""
                    value={registroEditando.vr_item}
                    onChange={(e) =>
                      setRegistroEditando((prev) =>
                        prev
                          ? { ...prev, vr_unit: Number(e.target.value) }
                          : null
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-x-2">
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
                    produto_id: registroEditando?.produto_id ?? 0,
                    quantidade: registroEditando?.quantidade ?? 0,
                    vr_unit: registroEditando?.vr_unit ?? 0,
                    vr_item: registroEditando?.vr_item ?? 0,
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
      </div>
    </>
  );
}
