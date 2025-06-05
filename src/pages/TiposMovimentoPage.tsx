import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import {
  TipoMovimentoPayloadType,
  TipoMovimentoType,
} from "../types/tiposMovimento";
import { TipoMovimentoServices } from "../services/tipoMovimentoServices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GridRegistros from "../components/grid-registros";
import { Plus, RefreshCcw, Search } from "lucide-react";
import type { ColDef } from "ag-grid-community";
import { ClienteType } from "@/types/cliente";
import ModalBuscaCliente from "@/components/modal-busca-cliente";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ClienteServices } from "@/services/clienteServices";

export function TipoMovimentoPage() {
  const [registros, setRegistros] = useState<TipoMovimentoType[]>([]);
  const [registroEditando, setRegistroEditando] =
    useState<TipoMovimentoType | null>(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [registroIdADeletar, setRegistroIdADeletar] = useState<number | null>(
    null
  );
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [abrirModalBuscaCliente, setAbrirModalBuscaCliente] = useState(false);
  const [cliente, setCliente] = useState<ClienteType>({
    cliente_id: 0,
    dsc_razao_social: "",
    dsc_nome_fantasia: "",
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const carregarRegistros = useCallback(async () => {
    const resultado = await TipoMovimentoServices.buscarRegistros();
    setRegistros(resultado);
  }, []);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  const aoInserir = () => {
    setRegistroEditando({
      tipo_movimento_id: 0,
      dsc_tipo_movimento: "",
      estoque: "N",
      financeiro: "N",
      dt_inc: new Date().toISOString(),
      cliente_vendas_padrao_id: 0,
    });

    setCliente({
      cliente_id: 0,
      dsc_razao_social: "",
      dsc_nome_fantasia: "",
    });
  };

  const aoEditar = async (p_registro: TipoMovimentoType) => {
    setRegistroEditando(p_registro);

    if (p_registro.cliente_vendas_padrao_id !== 0) {
      const cliente = await ClienteServices.buscarRegistro(
        Number(p_registro.cliente_vendas_padrao_id)
      );
      setCliente(cliente);
    }
  };

  const aoFecharFormulario = () => {
    setRegistroEditando(null);
  };

  const antesDeDeletar = (p_registro: TipoMovimentoType) => {
    setRegistroIdADeletar(p_registro.tipo_movimento_id);
    setMostrarConfirmacao(true);
  };

  const aoDeletar = async () => {
    if (!registroIdADeletar) return;

    setMostrarConfirmacao(false);

    const emUso = await TipoMovimentoServices.registroEmUso(registroIdADeletar);
    if (emUso) {
      setMensagemAviso("Registro em uso dentro de Produtos, verifique!");
      setMostrarAviso(true);
      return;
    }

    const error = await TipoMovimentoServices.deletar(registroIdADeletar);

    if (error) {
      setMensagemAviso("Erro ao apagar registro: " + error);
      setMostrarAviso(true);
      return;
    }

    toast.success("Registro apagado com sucesso!");

    carregarRegistros();
  };

  const aoSalvar = async (payload: TipoMovimentoPayloadType) => {
    if (!registroEditando) {
      setMensagemAviso("Erro inesperado ao salvar. Tente novamente.");
      setMostrarAviso(true);
      return;
    }

    const registroParaSalvar: TipoMovimentoType = {
      ...registroEditando, // Mantém quaisquer outros campos de registroEditando
      ...payload,
    };

    if (!registroParaSalvar.dsc_tipo_movimento) {
      setMensagemAviso("Descrição não pode estar vazia.");
      setMostrarAviso(true);
      return;
    }

    if (registroParaSalvar.cliente_vendas_padrao_id === 0) {
      setMensagemAviso("Cliente Padrão de Vendas não pode estar vazio.");
      setMostrarAviso(true);
      return;
    }

    const duplicado = await TipoMovimentoServices.verificaDuplicidade(
      registroParaSalvar.tipo_movimento_id,
      registroParaSalvar.dsc_tipo_movimento
    );
    if (duplicado) {
      setMensagemAviso("Descrição já cadastrada, verifique.");
      setMostrarAviso(true);
      return;
    }

    if (registroParaSalvar.tipo_movimento_id === 0) {
      // Novo registro
      const error = await TipoMovimentoServices.inserir(payload);

      if (error) {
        setMensagemAviso("Erro ao inserir registro: " + error);
        setMostrarAviso(true);
        return;
      }
    } else {
      // Edição de registro existente
      const error = await TipoMovimentoServices.atualizar(
        registroParaSalvar.tipo_movimento_id,
        payload
      );

      if (error) {
        setMensagemAviso("Erro ao atualizar registro: " + error);
        setMostrarAviso(true);
        return;
      }
    }

    toast.success("Registro salvo com sucesso!");
    carregarRegistros(); // Recarrega a lista de registros
    aoFecharFormulario(); // Fecha o formulário e limpa registroEditando
  };

  const colunasGrid: ColDef[] = [
    {
      field: "tipo_movimento_id",
      headerName: "Código",
      editable: false,
      filter: "agNumberColumnFilter",
    },
    {
      field: "dsc_tipo_movimento",
      headerName: "Descrição",
      editable: false,
      filter: "agTextColumnFilter",
      flex: 1,
    },
  ];

  function FormularioRegistro() {
    const [dsc_tipo_movimento, setDscTipoMovimento] = useState(
      registroEditando?.dsc_tipo_movimento ?? ""
    );

    const [estoque, setEstoque] = useState<string>(
      registroEditando?.estoque ?? ""
    );

    const [financeiro, setFinanceiro] = useState<string>(
      registroEditando?.financeiro ?? ""
    );

    // Atualiza o estado local toda vez que o registroEditando mudar (ex: abrir edição)
    useEffect(() => {
      setDscTipoMovimento(registroEditando?.dsc_tipo_movimento ?? "");
      setEstoque(registroEditando?.estoque ?? "");
      setFinanceiro(registroEditando?.financeiro ?? "");

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [registroEditando]);

    return (
      <>
        {registroEditando ? (
          <Tabs
            defaultValue="geral"
            className="w-full h-full max-w-none mx-auto"
          >
            <TabsList className="flex space-x-2 bg-muted p-1 rounded-xl shadow-inner border">
              <TabsTrigger value="geral">Geral</TabsTrigger>
            </TabsList>

            <TabsContent value="geral">
              <Card className=" w-full h-full mx-auto p-6">
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="tipo_movimento_id">Código</Label>
                      <Input
                        id="tipo_movimento_id"
                        value={registroEditando.tipo_movimento_id}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input
                        id="descricao"
                        value={dsc_tipo_movimento}
                        onChange={(e) => setDscTipoMovimento(e.target.value)}
                        placeholder="Ex: Vendas, Bonificações, Compras, etc."
                        ref={inputRef}
                      />
                    </div>

                    {/* Coluna da esquerda: Estoque e Financeiro lado a lado */}
                    <div className="grid grid-cols-2 gap-2 h-full">
                      <Card className="p-4 mt-2">
                        <Label className="text-sm font-semibold border-b pb-1 text-black-700 tracking-wide">
                          Estoque
                        </Label>
                        <RadioGroup
                          className="grid grid-cols-3 gap-4"
                          defaultValue="N"
                          value={estoque}
                          onValueChange={setEstoque}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="E" id="estoque_entrada" />
                            <Label htmlFor="estoque_entrada">Entrada</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="N" id="estoque_neutro" />
                            <Label htmlFor="estoque_neutro">Neutro</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="S" id="estoque_saida" />
                            <Label htmlFor="estoque_saida">Saída</Label>
                          </div>
                        </RadioGroup>
                      </Card>

                      <Card className="p-4 mt-2">
                        <Label className="text-sm font-semibold border-b pb-1 text-black-700 tracking-wide">
                          Financeiro
                        </Label>
                        <RadioGroup
                          className="grid grid-cols-3 gap-4"
                          defaultValue="N"
                          value={financeiro}
                          onValueChange={setFinanceiro}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="E" id="financeiro_receber" />
                            <Label htmlFor="financeiro_receber">Receber</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="N" id="financeiro_neutro" />
                            <Label htmlFor="financeiro_neutro">Neutro</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="S" id="financeiro_pagar" />
                            <Label htmlFor="financeiro_pagar">Pagar</Label>
                          </div>
                        </RadioGroup>
                      </Card>
                    </div>

                    {/* Coluna da direita: Cliente */}
                    <div className="mt-2">
                      <Card className="p-4 gap-3 h-full">
                        <h3 className="text-sm font-semibold border-b pb-1 text-black-700 tracking-wide">
                          Cliente Padrão de Vendas
                        </h3>
                        <div className="grid grid-cols-[auto_auto_1fr] gap-2 items-end">
                          <div className="space-y-2 w-32">
                            <Label htmlFor="cliente_id">Código</Label>
                            <Input
                              id="cliente_id"
                              name="cliente_id"
                              value={cliente.cliente_id}
                              readOnly
                            />
                          </div>

                          <div className="space-y-2 w-10">
                            <Label className="invisible">Buscar</Label>
                            <button
                              onClick={() => setAbrirModalBuscaCliente(true)}
                              type="button"
                              className="w-10 h-9 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent cursor-pointer"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dsc_forma_pagamento">
                              Descrição
                            </Label>
                            <Input
                              id="dsc_forma_pagamento"
                              name="dsc_forma_pagamento"
                              value={cliente.dsc_razao_social || ""}
                              readOnly
                            />
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </CardContent>
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
                    dsc_tipo_movimento: dsc_tipo_movimento,
                    estoque: estoque,
                    financeiro: financeiro,
                    cliente_vendas_padrao_id: cliente.cliente_id,
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
      <h1 className="text-2xl font-bold mb-4">Tipos de Movimento</h1>
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
      <ModalBuscaCliente
        open={abrirModalBuscaCliente}
        onClose={() => setAbrirModalBuscaCliente(false)}
        onSelect={(cliente) => {
          setCliente((prev) => ({
            ...prev,
            cliente_id: cliente.cliente_id,
            dsc_razao_social: cliente.dsc_razao_social,
            dsc_nome_fantasia: cliente.dsc_nome_fantasia,
          }));
        }}
      />
    </div>
  );
}
