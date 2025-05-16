import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import {
  FormaPagamentoPayloadType,
  FormaPagamentoType,
} from "../types/formaPagamento";
import { FormaPagamentoServices } from "../services/formaPagamentoServices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GridRegistros from "../components/grid-registros";
import { Plus, RefreshCcw } from "lucide-react";
import type { ColDef } from "ag-grid-community";

export function FormasPagamentoPage() {
  const [registros, setRegistros] = useState<FormaPagamentoType[]>([]);
  const [registroEditando, setRegistroEditando] =
    useState<FormaPagamentoType | null>(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [registroIdADeletar, setRegistroIdADeletar] = useState<number | null>(
    null
  );
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const carregarRegistros = useCallback(async () => {
    const resultado = await FormaPagamentoServices.buscarRegistros();
    setRegistros(resultado);
  }, []);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  const aoInserir = () => {
    setRegistroEditando({ forma_pagamento_id: 0, dsc_forma_pagamento: "" });
  };

  const aoEditar = (p_registro: FormaPagamentoType) => {
    setRegistroEditando(p_registro);
  };

  const aoFecharFormulario = () => {
    setRegistroEditando(null);
  };

  const antesDeDeletar = (p_registro: FormaPagamentoType) => {
    setRegistroIdADeletar(p_registro.forma_pagamento_id);
    setMostrarConfirmacao(true);
  };

  const aoDeletar = async () => {
    if (!registroIdADeletar) return;

    setMostrarConfirmacao(false);

    const emUso = await FormaPagamentoServices.registroEmUso(
      registroIdADeletar
    );
    if (emUso) {
      setMensagemAviso("Registro em uso dentro de Produtos, verifique!");
      setMostrarAviso(true);
      return;
    }

    const error = await FormaPagamentoServices.deletar(registroIdADeletar);

    if (error) {
      setMensagemAviso("Erro ao apagar registro: " + error);
      setMostrarAviso(true);
      return;
    }

    toast.success("Registro apagado com sucesso!");

    carregarRegistros();
  };

  const aoSalvar = async (payload: FormaPagamentoPayloadType) => {
    if (!registroEditando) {
      setMensagemAviso("Erro inesperado ao salvar. Tente novamente.");
      setMostrarAviso(true);
      return;
    }

    const registroParaSalvar: FormaPagamentoType = {
      ...registroEditando,
      ...payload,
    };

    if (!registroParaSalvar.dsc_forma_pagamento) {
      setMensagemAviso("Descrição não pode estar vazia.");
      setMostrarAviso(true);
      return;
    }

    const duplicado = await FormaPagamentoServices.verificaDuplicidade(
      registroParaSalvar.forma_pagamento_id,
      registroParaSalvar.dsc_forma_pagamento
    );
    if (duplicado) {
      setMensagemAviso("Descrição já cadastrada, verifique.");
      setMostrarAviso(true);
      return;
    }

    if (registroParaSalvar.forma_pagamento_id === 0) {
      // Novo registro
      const error = await FormaPagamentoServices.inserir(payload);

      if (error) {
        setMensagemAviso("Erro ao inserir registro: " + error);
        setMostrarAviso(true);
        return;
      }
    } else {
      // Edição de registro existente
      const error = await FormaPagamentoServices.atualizar(
        registroParaSalvar.forma_pagamento_id,
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
      field: "forma_pagamento_id",
      headerName: "Código",
      editable: false,
      filter: "agNumberColumnFilter",
    },
    {
      field: "dsc_forma_pagamento",
      headerName: "Descrição",
      editable: false,
      filter: "agTextColumnFilter",
      flex: 1,
    },
  ];

  function FormularioRegistro() {
    // Estado local só para o campo descrição
    const [dsc_forma_pagamento, setDscFormaPagamento] = useState(
      registroEditando?.dsc_forma_pagamento ?? ""
    );

    // Atualiza o estado local toda vez que o registroEditando mudar (ex: abrir edição)
    useEffect(() => {
      setDscFormaPagamento(registroEditando?.dsc_forma_pagamento ?? "");
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
                    {registroEditando.forma_pagamento_id === 0
                      ? "Novo Registro"
                      : "Editar Registro"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="descricao">
                      Descrição da Forma de Pagamento
                    </Label>
                    <Input
                      id="descricao"
                      value={dsc_forma_pagamento}
                      onChange={(e) => setDscFormaPagamento(e.target.value)}
                      placeholder="Ex: Bebidas, Alimentos, etc."
                      ref={inputRef}
                    />
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
                  aoSalvar({ dsc_forma_pagamento });
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
      <h1 className="text-2xl font-bold mb-4">Formas de Pagamento</h1>
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
          campoRodape="dsc_forma_pagamento"
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
    </div>
  );
}
