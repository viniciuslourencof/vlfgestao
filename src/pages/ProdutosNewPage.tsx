import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import { PedidosItensPage } from "@/pages/PedidosItensPage";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import {
  ProdutoType,
  ProdutoPayloadType,
  ProdutoComposicaoType,
} from "../types/produto";
import { PedidoServices } from "../services/pedidoServices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GridRegistros from "../components/grid-registros";
import { formatarData } from "@/lib/formatarData";
import { CategoriaType } from "../types/categoria";
import { CategoriaServices } from "@/services/categoriaServices";
import ModalBuscaCategoria from "@/components/modal-busca-categoria";
import { Search, Plus, RefreshCcw } from "lucide-react";

import type { ColDef } from "ag-grid-community";
import { PedidoItemServices } from "@/services/pedidoItemServices";
import { ProdutoServices } from "@/services/produtoServices";
import { ProdutoComposicaoServices } from "@/services/produtoComposicaoServices";

export function PedidosPage() {
  const [registros, setRegistros] = useState<ProdutoType[]>([]);
  const [registroEditando, setRegistroEditando] = useState<ProdutoType | null>(
    null
  );
  const [registrosComp, setRegistrosComp] = useState<ProdutoComposicaoType[]>(
    []
  );
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [registroIdADeletar, setRegistroIdADeletar] = useState<number | null>(
    null
  );
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [abaAtiva, setAbaAtiva] = useState("geral");
  const [categoria, setCategoria] = useState<CategoriaType>({
    categoria_id: 0,
    dsc_categoria: "",
  });
  const [abrirModalBuscaCategoria, setAbrirModalBuscaCategoria] =
    useState(false);

  const carregarRegistros = useCallback(async () => {
    const resultado = await ProdutoServices.buscarRegistros();
    setRegistros(resultado);
  }, []);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros, registrosComp]);

  const aoInserir = () => {
    setAbaAtiva("geral");

    setRegistroEditando({
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

    setRegistrosComp([]);

    setCategoria({
      categoria_id: 0,
      dsc_categoria: "",
    });
  };

  const aoEditar = async (p_registro: ProdutoType) => {
    setAbaAtiva("geral");
    setRegistroEditando(p_registro);
    setCompIdsParaDeletar([]);

    if (p_registro.categoria_id !== 0) {
      const formaPagamento = await CategoriaServices.buscarRegistro(
        Number(p_registro.categoria_id)
      );
      setCategoria(formaPagamento);
    }

    if (p_registro.produto_id !== 0) {
      const composicao = await ProdutoComposicaoServices.buscarRegistros(
        p_registro?.produto_id
      );
      setRegistrosComp(composicao);
    }
  };

  const aoFecharFormulario = () => {
    setRegistroEditando(null);
  };

  const antesDeDeletar = (p_registro: ProdutoType) => {
    setRegistroIdADeletar(p_registro.produto_id);
    setMostrarConfirmacao(true);
  };

  const aoDeletar = async () => {
    if (!registroIdADeletar) return;

    setMostrarConfirmacao(false);

    const emUso = await PedidoServices.registroEmUso(registroIdADeletar);
    if (emUso) {
      setMensagemAviso(
        "Existem Contas a Receber vinculadas a esse pedido, verifique!"
      );
      setMostrarAviso(true);
      return;
    }

    const error = await PedidoServices.deletar(registroIdADeletar);

    if (error) {
      setMensagemAviso("Erro ao apagar registro: " + error);
      setMostrarAviso(true);
      return;
    }

    toast.success("Registro apagado com sucesso!");

    carregarRegistros();
  };

  const aoSalvar = async (payload: ProdutoPayloadType) => {
    if (!registroEditando) {
      setMensagemAviso("Erro inesperado ao salvar. Tente novamente.");
      setMostrarAviso(true);
      return;
    }

    let registroParaSalvar: ProdutoType = {
      ...registroEditando, // Mantém quaisquer outros campos de registroEditando
      ...payload, // sobrescreve os campos definidos em payload
    };

    if (!registroParaSalvar.dsc_produto) {
      setMensagemAviso("Descrição não pode estar vazia.");
      setMostrarAviso(true);
      return;
    }

    // Lógica de inserção ou atualização usando registroParaSalvar
    if (registroParaSalvar.produto_id === 0) {
      // Novo registro
      const { registro: registroInserido, error } =
        await ProdutoServices.inserirComRetorno(payload);

      if (error || !registroInserido) {
        setMensagemAviso("Erro ao inserir registro: " + error);
        setMostrarAviso(true);
        return;
      }

      registroParaSalvar = {
        ...registroInserido,
        ...payload,
      };
    } else {
      // Edição de registro existente
      const error = await ProdutoServices.atualizar(
        payload,
        registroParaSalvar.produto_id
      );

      if (error) {
        setMensagemAviso("Erro ao atualizar registro: " + error);
        setMostrarAviso(true);
        return;
      }
    }

    for (const item of registrosComp) {
      const payload = {
        produtopai_id: registroParaSalvar.produto_id,
        produtofilho_id: item.produtofilho_id ?? 0,
        vr_custo: Number(item.vr_custo),
        quantidade: Number(item.quantidade),
      };

      let error: string | null = null;

      if (!item.produto_composicao_id || item.produto_composicao_id === 0) {
        error = await ProdutoComposicaoServices.inserir(payload);
      } else {
        error = await ProdutoComposicaoServices.atualizar(
          payload,
          item.produto_composicao_id
        );
      }

      if (error) {
        setMensagemAviso("Erro ao salvar item do pedido: " + error);
        setMostrarAviso(true);
        break; // para a execução ao encontrar erro
      }
    }

    // deleta os que o usuário removeu
    for (const id of CompIdsParaDeletar) {
      const error = await PedidoItemServices.deletar(id);

      if (error) {
        setMensagemAviso("Erro ao deletar item do pedido: " + error);
        setMostrarAviso(true);
        return;
      }
    }

    toast.success("Registro salvo com sucesso!");
    carregarRegistros();
    aoFecharFormulario();
    setCompIdsParaDeletar([]);
  };

  const colunasGrid: ColDef[] = [
    { field: "pedido_id", headerName: "Código" },
    {
      field: "dt_inc",
      headerName: "Data",
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString("pt-BR");
      },
    },
    {
      field: "clientes.dsc_razao_social",
      headerName: "Cliente",
    },
    {
      field: "vr_liquido",
      headerName: "Valor",
      valueFormatter: (params) =>
        params.value?.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
    },
  ];

  const [CompIdsParaDeletar, setCompIdsParaDeletar] = useState<number[]>([]);

  function FormularioRegistro() {
    const [produtoId, setProdutoId] = useState(
      registroEditando?.produto_id ?? 0
    );
    const [dscProduto, setDscProduto] = useState(
      registroEditando?.dsc_produto ?? ""
    );
    const [estoque, setEstoque] = useState(registroEditando?.estoque ?? 0);
    const [precoVenda1, setPrecoVenda1] = useState(
      registroEditando?.preco_venda1 ?? 0
    );
    const [precoCusto1, setPrecoCusto1] = useState(
      registroEditando?.preco_custo1 ?? 0
    );
    const [desconto, setDesconto] = useState(registroEditando?.desconto ?? 0);
    const [categoriaId, setCategoriaId] = useState(
      registroEditando?.categoria_id ?? 0
    );
    const [unidadeFardo, setUnidadeFardo] = useState(
      registroEditando?.unidade_fardo ?? 0
    );
    const [mililitros, setMililitros] = useState(
      registroEditando?.mililitros ?? 0
    );
    const [doses, setDoses] = useState(registroEditando?.doses ?? 0);
    const [margem1, setMargem1] = useState(registroEditando?.margem1 ?? 0);
    const [valorDose, setValorDose] = useState(
      registroEditando?.valor_dose ?? 0
    );
    const [vrDesconto, setVrDesconto] = useState(
      registroEditando?.vr_desconto ?? 0
    );

    const aoEditarCampoNumerico = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      let novoValor = value.replace(/[^0-9.,]/g, "").replace(",", ".");

      if (novoValor.includes(".")) {
        const [inteiro, decimal] = novoValor.split(".");
        novoValor = inteiro + "." + decimal.slice(0, 2);
      }

      if (name === "preco_venda1") {
        setPrecoVenda1(novoValor);
      } else if (name === "preco_custo1") {
        setPrecoCusto1(novoValor);
      } else if (name === "desconto") {
        setDesconto(novoValor);
      } else if (name === "estoque") {
        setEstoque(novoValor);
      } else if (name === "categoria_id") {
        setCategoriaId(novoValor);
      } else if (name === "unidade_fardo") {
        setUnidadeFardo(novoValor);
      } else if (name === "mililitros") {
        setMililitros(novoValor);
      } else if (name === "doses") {
        setDoses(novoValor);
      } else if (name === "margem1") {
        setMargem1(novoValor);
      } else if (name === "valor_dose") {
        setValorDose(novoValor);
      } else if (name === "vr_desconto") {
        setVrDesconto(novoValor);
      }
    };

    // Atualiza o estado local toda vez que o registroEditando mudar (ex: abrir edição)
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    return (
      <>
        {registroEditando ? (
          <Tabs
            value={abaAtiva}
            onValueChange={setAbaAtiva}
            className="w-full h-full max-w-none mx-auto"
          >
            <TabsList className="flex space-x-2 bg-muted p-1 rounded-xl shadow-inner border">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="itens">Itens</TabsTrigger>
            </TabsList>

            <TabsContent value="geral">
              <Card className=" w-full h-full mx-auto p-6">
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="pedido_id">Código do Pedido</Label>
                      <Input
                        id="pedido_id"
                        value={registroEditando.pedido_id}
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dt_inc">Data de Emissão</Label>
                      <Input
                        id="dt_inc"
                        value={formatarData(registroEditando.dt_inc)}
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vr_liquido">Vr. Líquido</Label>
                      <Input
                        id="vr_liquido"
                        name="vr_liquido"
                        value={vr_liquido}
                        onChange={aoEditarCampoNumerico}
                        ref={inputRef}
                        // readOnly
                      />
                    </div>
                  </div>

                  <Card className="p-4 gap-3">
                    <h3 className="text-sm font-semibold border-b pb-1 text-black-700 tracking-wide">
                      Forma de Pagamento
                    </h3>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-2 items-end">
                      <div className="space-y-2 w-32">
                        <Label htmlFor="forma_pagamento_id">Código</Label>
                        <Input
                          id="forma_pagamento_id"
                          name="forma_pagamento_id"
                          value={
                            formaPagamento.forma_pagamento_id === 0
                              ? ""
                              : formaPagamento.forma_pagamento_id
                          }
                          readOnly
                        />
                      </div>

                      <div className="space-y-2 w-10">
                        <Label className="invisible">Buscar</Label>
                        <button
                          onClick={() => setAbrirModalBuscaFormaPagamento(true)}
                          type="button"
                          className="w-10 h-9 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent cursor-pointer"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dsc_forma_pagamento">Descrição</Label>
                        <Input
                          id="dsc_forma_pagamento"
                          name="dsc_forma_pagamento"
                          value={formaPagamento.dsc_forma_pagamento || ""}
                          readOnly
                        />
                      </div>
                    </div>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="itens">
              <Card className=" w-full h-full mx-auto p-6">
                <PedidosItensPage
                  p_id={registroEditando.pedido_id}
                  registros={registrosComp}
                  setRegistros={setRegistrosComp}
                  registrarExclusao={(id: number) => {
                    setCompIdsParaDeletar((prev) => [...prev, id]);
                  }}
                />
              </Card>
            </TabsContent>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={aoFecharFormulario}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                className="cursor-pointer"
                onClick={() => {
                  aoSalvar({
                    cliente_id: cliente.cliente_id,
                    forma_pagamento_id: formaPagamento.forma_pagamento_id,
                    vr_liquido: vr_liquido,
                  });
                }}
              >
                Salvar
              </Button>
            </div>
          </Tabs>
        ) : null}
      </>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Pedidos</h1>
      <div className="flex items-center mb-4">
        <div className="flex gap-2">
          <Button onClick={aoInserir} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2 cursor-pointer" /> Novo
          </Button>
          <Button onClick={carregarRegistros} className="cursor-pointer">
            <RefreshCcw className="w-4 h-4 mr-2 cursor-pointer" />
            <span className="max-[400px]:hidden">Atualizar</span>
          </Button>
        </div>
      </div>

      {registroEditando ? (
        <FormularioRegistro />
      ) : (
        <GridRegistros
          registros={registros}
          colunas={colunasGrid}
          aoEditar={aoEditar}
          antesDeDeletar={antesDeDeletar}
        />
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
      <ModalBuscaCategoria
        open={abrirModalBuscaCategoria}
        onClose={() => setAbrirModalBuscaCategoria(false)}
        onSelect={(categoria) => {
          setCategoria((prev) => ({
            ...prev,
            categoria_id: categoria.categoria_id,
            dsc_categoria: categoria.dsc_categoria,
          }));
        }}
      />
    </div>
  );
}
