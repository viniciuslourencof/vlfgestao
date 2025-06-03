import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import { FornecedorPayloadType, FornecedorType } from "../types/fornecedor";
import { FornecedorServices } from "../services/fornecedorServices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GridRegistros from "../components/grid-registros";
import { Plus, RefreshCcw } from "lucide-react";
import type { ColDef } from "ag-grid-community";

export function FornecedoresPage() {
  const [registros, setRegistros] = useState<FornecedorType[]>([]);
  const [registroEditando, setRegistroEditando] =
    useState<FornecedorType | null>(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [registroIdADeletar, setRegistroIdADeletar] = useState<number | null>(
    null
  );
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const carregarRegistros = useCallback(async () => {
    const resultado = await FornecedorServices.buscarRegistros();
    setRegistros(resultado);
  }, []);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  const aoInserir = () => {
    setRegistroEditando({
      fornecedor_id: 0,
      dsc_razao_social: "",
      dsc_nome_fantasia: "",
    });
  };

  const aoEditar = (p_registro: FornecedorType) => {
    setRegistroEditando(p_registro);
  };

  const aoFecharFormulario = () => {
    setRegistroEditando(null);
  };

  const antesDeDeletar = (p_registro: FornecedorType) => {
    setRegistroIdADeletar(p_registro.fornecedor_id);
    setMostrarConfirmacao(true);
  };

  const aoDeletar = async () => {
    if (!registroIdADeletar) return;

    setMostrarConfirmacao(false);

    const emUso = await FornecedorServices.registroEmUso(registroIdADeletar);
    if (emUso) {
      setMensagemAviso(
        "Registro em uso dentro de Contas a Pagar, verifique!"
      );
      setMostrarAviso(true);
      return;
    }

    const error = await FornecedorServices.deletar(registroIdADeletar);

    if (error) {
      setMensagemAviso("Erro ao apagar registro: " + error);
      setMostrarAviso(true);
      return;
    }

    toast.success("Registro apagado com sucesso!");

    carregarRegistros();
  };

  const aoSalvar = async (payload: FornecedorPayloadType) => {
    if (!registroEditando) {
      setMensagemAviso("Erro inesperado ao salvar. Tente novamente.");
      setMostrarAviso(true);
      return;
    }

    const registroParaSalvar: FornecedorType = {
      ...registroEditando, // Mantém quaisquer outros campos de registroEditando
      ...payload, // sobrescreve os campos definidos em payload
    };

    // Validação usando o registroParaSalvar que contém a descrição correta
    if (!registroParaSalvar.dsc_razao_social) {
      setMensagemAviso("Descrição não pode estar vazia.");
      setMostrarAviso(true);
      return;
    }

    // Verificação de duplicidade usando registroParaSalvar
    const duplicado = await FornecedorServices.verificaDuplicidade(
      registroParaSalvar.fornecedor_id,
      registroParaSalvar.dsc_razao_social
    );
    if (duplicado) {
      setMensagemAviso("Descrição já cadastrada, verifique.");
      setMostrarAviso(true);
      return;
    }

    // Lógica de inserção ou atualização usando registroParaSalvar
    if (registroParaSalvar.fornecedor_id === 0) {
      // Novo registro
      const error = await FornecedorServices.inserir(payload);

      if (error) {
        setMensagemAviso("Erro ao inserir registro: " + error);
        setMostrarAviso(true);
        return;
      }
    } else {
      // Edição de registro existente
      const error = await FornecedorServices.atualizar(
        payload,
        registroParaSalvar.fornecedor_id
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
      field: "fornecedor_id",
      headerName: "Código",
      editable: false,
      filter: "agNumberColumnFilter",
    },
    {
      field: "dsc_razao_social",
      headerName: "Razão Social",
      editable: false,
      filter: "agTextColumnFilter",
      flex: 1,
    },
    {
      field: "dsc_nome_fantasia",
      headerName: "Nome Fantasia",
      editable: false,
      filter: "agTextColumnFilter",
      flex: 1,
    },
  ];

  function FormularioRegistro() {
    // Estados locais
    const [dsc_razao_social, setDscRazaoSocial] = useState(
      registroEditando?.dsc_razao_social ?? ""
    );

    const [dsc_nome_fantasia, setDscNomeFantasia] = useState(
      registroEditando?.dsc_nome_fantasia ?? ""
    );

    // Atualiza o estado local toda vez que o registroEditando mudar (ex: abrir edição)
    useEffect(() => {
      setDscRazaoSocial(registroEditando?.dsc_razao_social ?? "");
      setDscNomeFantasia(registroEditando?.dsc_nome_fantasia ?? "");
      inputRef.current?.focus(); // foca no campo ao montar
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
                    {registroEditando.fornecedor_id === 0
                      ? "Novo Registro"
                      : "Editar Registro"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dsc_razao_social">Razão Social</Label>
                    <Input
                      id="dsc_razao_social"
                      value={dsc_razao_social}
                      onChange={(e) => setDscRazaoSocial(e.target.value)}
                      ref={inputRef}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dsc_nome_fantasia">Nome Fantasia</Label>
                    <Input
                      id="dsc_nome_fantasia"
                      value={dsc_nome_fantasia}
                      onChange={(e) => setDscNomeFantasia(e.target.value)}
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
                  aoSalvar({ dsc_razao_social, dsc_nome_fantasia });
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
      <h1 className="text-2xl font-bold mb-4">Fornecedores</h1>
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
          campoRodape="dsc_razao_social"
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
