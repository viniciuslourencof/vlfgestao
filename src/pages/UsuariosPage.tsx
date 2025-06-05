import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import { UsuarioPayloadType, UsuarioType } from "../types/usuario";
import { UsuarioServices } from "../services/usuarioServices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GridRegistros from "../components/grid-registros";
import { Plus, RefreshCcw } from "lucide-react";
import type { ColDef } from "ag-grid-community";

export function UsuariosPage() {
  const [registros, setRegistros] = useState<UsuarioType[]>([]);
  const [registroEditando, setRegistroEditando] = useState<UsuarioType | null>(
    null
  );
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [registroIdADeletar, setRegistroIdADeletar] = useState<number | null>(
    null
  );
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const carregarRegistros = useCallback(async () => {
    const resultado = await UsuarioServices.buscarRegistros();
    setRegistros(resultado);
  }, []);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  const aoInserir = () => {
    setRegistroEditando({
      usuario_id: 0,
      dsc_usuario: "",
      login: "",
      senha: "",
    });
  };

  const aoEditar = (p_registro: UsuarioType) => {
    setRegistroEditando(p_registro);
  };

  const aoFecharFormulario = () => {
    setRegistroEditando(null);
  };

  const antesDeDeletar = (p_registro: UsuarioType) => {
    setRegistroIdADeletar(p_registro.usuario_id);
    setMostrarConfirmacao(true);
  };

  const aoDeletar = async () => {
    if (!registroIdADeletar) return;

    setMostrarConfirmacao(false);

    // const emUso = await UsuarioServices.registroEmUso(registroIdADeletar);
    // if (emUso) {
    //   setMensagemAviso("Registro em uso dentro de Contas a Pagar, verifique!");
    //   setMostrarAviso(true);
    //   return;
    // }

    const error = await UsuarioServices.deletar(registroIdADeletar);

    if (error) {
      setMensagemAviso("Erro ao apagar registro: " + error);
      setMostrarAviso(true);
      return;
    }

    toast.success("Registro apagado com sucesso!");

    carregarRegistros();
  };

  const aoSalvar = async (payload: UsuarioPayloadType) => {
    if (!registroEditando) {
      setMensagemAviso("Erro inesperado ao salvar. Tente novamente.");
      setMostrarAviso(true);
      return;
    }

    const registroParaSalvar: UsuarioType = {
      ...registroEditando, // Mantém quaisquer outros campos de registroEditando
      ...payload, // sobrescreve os campos definidos em payload
    };

    // Validação usando o registroParaSalvar que contém a descrição correta
    if (!registroParaSalvar.dsc_usuario) {
      setMensagemAviso("Descrição não pode estar vazia.");
      setMostrarAviso(true);
      return;
    }

    // Verificação de duplicidade usando registroParaSalvar
    const duplicado = await UsuarioServices.verificaDuplicidade(
      registroParaSalvar.usuario_id,
      registroParaSalvar.dsc_usuario
    );
    if (duplicado) {
      setMensagemAviso("Descrição já cadastrada, verifique.");
      setMostrarAviso(true);
      return;
    }

    // Lógica de inserção ou atualização usando registroParaSalvar
    if (registroParaSalvar.usuario_id === 0) {
      // Novo registro
      const error = await UsuarioServices.inserir(payload);

      if (error) {
        setMensagemAviso("Erro ao inserir registro: " + error);
        setMostrarAviso(true);
        return;
      }
    } else {
      // Edição de registro existente
      const error = await UsuarioServices.atualizar(
        payload,
        registroParaSalvar.usuario_id
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
      field: "usuario_id",
      headerName: "Código",
      editable: false,
      filter: "agNumberColumnFilter",
    },
    {
      field: "dsc_usuario",
      headerName: "Razão Social",
      editable: false,
      filter: "agTextColumnFilter",
      flex: 1,
    },
  ];

  function FormularioRegistro() {
    // Estados locais
    const [dsc_usuario, setDscUsuario] = useState(
      registroEditando?.dsc_usuario ?? ""
    );

    const [login, setLogin] = useState(registroEditando?.login ?? "");

    const [senha, setSenha] = useState(registroEditando?.senha ?? "");

    // Atualiza o estado local toda vez que o registroEditando mudar (ex: abrir edição)
    useEffect(() => {
      setDscUsuario(registroEditando?.dsc_usuario ?? "");
      setLogin(registroEditando?.login ?? "");
      setSenha(registroEditando?.senha ?? "");
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dsc_usuario">Nome do Usuário</Label>
                    <Input
                      id="dsc_usuario"
                      value={dsc_usuario}
                      onChange={(e) => setDscUsuario(e.target.value)}
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
                  aoSalvar({ login, senha, dsc_usuario });
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
      <h1 className="text-2xl font-bold mb-4">Usuários</h1>
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
    </div>
  );
}
