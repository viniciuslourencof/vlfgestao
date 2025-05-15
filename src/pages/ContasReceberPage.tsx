import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import {
  ContaReceberType,
  ContaReceberPayloadType,
} from "../types/contaReceber";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GridRegistros } from "../components/grid-contas-receber"; // caminho correto do arquivo
import { formatarData } from "@/lib/formatarData";
import { FormaPagamentoType } from "../types/formaPagamento";
import { FormaPagamentoServices } from "@/services/formaPagamentoServices";
import ModalBuscaFormaPagamento from "@/components/modal-busca-forma-pagamento";
import { ClienteType } from "@/types/cliente";
import { ClienteServices } from "@/services/clienteServices";
import ModalBuscaCliente from "@/components/modal-busca-cliente";
import { Search, Plus, RefreshCcw } from "lucide-react";
import { ContasReceberServices } from "@/services/contaReceberServices";

export function ContasReceberPage() {
  const [registros, setRegistros] = useState<ContaReceberType[]>([]);
  const [registroEditando, setRegistroEditando] =
    useState<ContaReceberType | null>(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [registroIdADeletar, setRegistroIdADeletar] = useState<number | null>(
    null
  );
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoType>({
    forma_pagamento_id: 0,
    dsc_forma_pagamento: "",
  });
  const [cliente, setCliente] = useState<ClienteType>({
    cliente_id: 0,
    dsc_razao_social: "",
    dsc_nome_fantasia: "",
  });
  const [abrirModalBuscaFormaPagamento, setAbrirModalBuscaFormaPagamento] =
    useState(false);
  const [abrirModalBuscaCliente, setAbrirModalBuscaCliente] = useState(false);

  const carregarRegistros = useCallback(async () => {
    const resultado = await ContasReceberServices.buscarRegistros();
    setRegistros(resultado);
  }, []);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  const aoInserir = () => {
    setRegistroEditando({
      conta_receber_id: 0,
      cliente_id: 0,
      forma_pagamento_id: 0,
      vr_liquido: 0.0,
      dt_inc: new Date().toISOString(),
    });

    setCliente({
      cliente_id: 0,
      dsc_razao_social: "",
      dsc_nome_fantasia: "",
    });

    setFormaPagamento({
      forma_pagamento_id: 0,
      dsc_forma_pagamento: "",
    });
  };

  const aoEditar = async (p_registro: ContaReceberType) => {
    setRegistroEditando(p_registro);

    if (p_registro.forma_pagamento_id !== 0) {
      const formaPagamento = await FormaPagamentoServices.buscarRegistro(
        Number(p_registro.forma_pagamento_id)
      );
      setFormaPagamento(formaPagamento);
    }

    if (p_registro.cliente_id !== 0) {
      const cliente = await ClienteServices.buscarRegistro(
        Number(p_registro.cliente_id)
      );
      setCliente(cliente);
    }
  };

  const aoFecharFormulario = () => {
    setRegistroEditando(null);
  };

  const antesDeDeletar = (p_registro: ContaReceberType) => {
    setRegistroIdADeletar(p_registro.conta_receber_id);
    setMostrarConfirmacao(true);
  };

  const aoDeletar = async () => {
    if (!registroIdADeletar) return;

    setMostrarConfirmacao(false);

    // const emUso = await ContasReceberServices.registroEmUso(registroIdADeletar);
    // if (emUso) {
    //   setMensagemAviso(
    //     "Registro em uso dentro de Contas a Receber, verifique!"
    //   );
    //   setMostrarAviso(true);
    //   return;
    // }

    const error = await ContasReceberServices.deletar(registroIdADeletar);

    if (error) {
      setMensagemAviso("Erro ao apagar registro: " + error);
      setMostrarAviso(true);
      return;
    }

    toast.success("Registro apagado com sucesso!");

    carregarRegistros();
  };

  const aoSalvar = async (payload: ContaReceberPayloadType) => {
    if (!registroEditando) {
      setMensagemAviso("Erro inesperado ao salvar. Tente novamente.");
      setMostrarAviso(true);
      return;
    }

    const registroParaSalvar: ContaReceberType = {
      ...registroEditando, // Mantém quaisquer outros campos de registroEditando
      ...payload, // sobrescreve os campos definidos em payload
    };

    if (!registroParaSalvar.vr_liquido) {
      setMensagemAviso("Valor da Conta não pode estar vazio.");
      setMostrarAviso(true);
      return;
    }

    if (!registroParaSalvar.forma_pagamento_id) {
      setMensagemAviso("Forma de Pagamento não pode estar vazia.");
      setMostrarAviso(true);
      return;
    }

    if (!registroParaSalvar.cliente_id) {
      setMensagemAviso("Cliente não pode estar vazio.");
      setMostrarAviso(true);
      return;
    }

    // // Verificação de duplicidade usando registroParaSalvar
    // const duplicado = await ContasReceberServices.verificaDuplicidade(
    //   registroParaSalvar.cliente_id,
    //   registroParaSalvar.dsc_razao_social
    // );
    // if (duplicado) {
    //   setMensagemAviso("Descrição já cadastrada, verifique.");
    //   setMostrarAviso(true);
    //   return;
    // }

    // Lógica de inserção ou atualização usando registroParaSalvar
    if (registroParaSalvar.conta_receber_id === 0) {
      // Novo registro
      const error = await ContasReceberServices.inserir(payload);

      if (error) {
        setMensagemAviso("Erro ao inserir registro: " + error);
        setMostrarAviso(true);
        return;
      }
    } else {
      // Edição de registro existente
      const error = await ContasReceberServices.atualizar(
        payload,
        registroEditando.conta_receber_id
      );

      if (error) {
        setMensagemAviso("Erro ao atualizar registro: " + error);
        setMostrarAviso(true);
        return;
      }
    }

    toast.success("Registro salvo com sucesso!");
    carregarRegistros();
    aoFecharFormulario();
  };

  const aoEditarCampoNumerico = (e: React.ChangeEvent<HTMLInputElement>) => {
    let novoValor = e.target.value
      .replace(/[^0-9.,]/g, "") // Remove letras e símbolos inválidos
      .replace(",", "."); // Converte vírgula para ponto

    if (novoValor.includes(".")) {
      const [inteiro, decimal] = novoValor.split(".");
      novoValor = inteiro + "." + decimal.slice(0, 2); // Limita a 2 casas decimais
    }

    if (registroEditando) {
      setRegistroEditando({
        ...registroEditando,
        vr_liquido: novoValor,
      });
    }
  };

  function FormularioRegistro() {
    // Estado locais
    const [vr_liquido, setVrLiquido] = useState(
      registroEditando?.vr_liquido ?? ""
    );

    // Atualiza o estado local toda vez que o registroEditando mudar (ex: abrir edição)
    useEffect(() => {
      setVrLiquido(registroEditando?.vr_liquido ?? "");
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
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {registroEditando.conta_receber_id === 0
                      ? "Novo Registro"
                      : "Editar Registro"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="pedido_id">Código da Conta</Label>
                      <Input
                        id="pedido_id"
                        value={registroEditando.conta_receber_id}
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
                          value={formaPagamento.forma_pagamento_id}
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

                  <Card className="p-4 gap-3">
                    <h3 className="text-sm font-semibold border-b pb-1 text-black-700 tracking-wide">
                      Cliente
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
                        <Label htmlFor="dsc_forma_pagamento">Descrição</Label>
                        <Input
                          id="dsc_forma_pagamento"
                          name="dsc_forma_pagamento"
                          value={cliente.dsc_razao_social || ""}
                          readOnly
                        />
                      </div>
                    </div>
                  </Card>
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contas a Receber</h1>
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
      <ModalBuscaFormaPagamento
        open={abrirModalBuscaFormaPagamento}
        onClose={() => setAbrirModalBuscaFormaPagamento(false)}
        onSelect={(forma_pagamento) => {
          setFormaPagamento((prev) => ({
            ...prev,
            forma_pagamento_id: forma_pagamento.forma_pagamento_id,
            dsc_forma_pagamento: forma_pagamento.dsc_forma_pagamento,
          }));
        }}
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
