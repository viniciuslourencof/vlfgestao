import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, RefreshCcw } from "lucide-react";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import { CategoriaType } from "../types/categoria";
import { CategoriaServices } from "../services/categoriaServices";

export function CategoriasPage() {
  const [registros, setRegistros] = useState<CategoriaType[]>([]);
  const [registroEditando, setRegistroEditando] =
    useState<CategoriaType | null>(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [registroIdADeletar, setRegistroIdADeletar] = useState<number | null>(
    null
  );
  const [textoPesquisa, setTextoPesquisa] = useState<string>("");
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

  const carregarRegistros = useCallback(async () => {
    const resultado = await CategoriaServices.buscarRegistros();
    setRegistros(resultado);
  }, []); 

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  const aoInserir = () => {
    setRegistroEditando({ categoria_id: 0, dsc_categoria: "" });
  };

  const aoEditar = (p_registro: CategoriaType) => {
    setRegistroEditando(p_registro);
  };

  const aoFecharFormulario = () => {
    setRegistroEditando(null);
  };

  const antesDeDeletar = (p_registro_id: number) => {
    setRegistroIdADeletar(p_registro_id);
    setMostrarConfirmacao(true);
  };

  const aoDeletar = async () => {
    if (!registroIdADeletar) return;

    setMostrarConfirmacao(false);

    const emUso = await CategoriaServices.registroEmUso(registroIdADeletar);
    if (emUso) {
      setMensagemAviso("Registro em uso dentro de Produtos, verifique!");
      setMostrarAviso(true);
      return;
    }

    const error = await CategoriaServices.deletar(registroIdADeletar);

    if (error) {
      setMensagemAviso("Erro ao apagar registro: " + error);
      setMostrarAviso(true);
      return;
    }

    toast.success("Registro apagado com sucesso!");
    
    carregarRegistros();
  };

  const aoSalvar = async () => {
    if (!registroEditando) return;

    if (!registroEditando.dsc_categoria.trim()) {
      setMensagemAviso("Descrição não pode estar vazia.");
      setMostrarAviso(true);
      return;
    }

    const duplicado = await CategoriaServices.verificaDuplicidade(
      registroEditando.categoria_id,
      registroEditando.dsc_categoria
    );
    if (duplicado) {
      setMensagemAviso("Descrição já cadastrada, verifique.");
      setMostrarAviso(true);
      return;
    }

    if (registroEditando.categoria_id === 0) {
      const error = await CategoriaServices.inserir(
        registroEditando.dsc_categoria
      );

      if (error) {
        setMensagemAviso("Erro ao inserir registro: " + error);
        setMostrarAviso(true);
        return;
      }
    } else {
      const error = await CategoriaServices.atualizar(
        registroEditando.categoria_id,
        registroEditando.dsc_categoria
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

  const registrosFiltrados = registros.filter((registro) =>
    registro.dsc_categoria.toLowerCase().includes(textoPesquisa.toLowerCase())
  );

  function ListaRegistros() {
    return (
      <>
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Input
          type="text"
          placeholder="Pesquisar registros..."
          className="w-full my-4 bg-white"
          value={textoPesquisa}
          onChange={(e) => setTextoPesquisa(e.target.value)}
        />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registrosFiltrados.map((registro) => (
            <Card
              key={registro.categoria_id}
              className="p-4 flex flex-col justify-between"
            >
              <div>
                <h2 className="font-semibold text-lg">
                  {registro.dsc_categoria}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Código: {registro.categoria_id}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => aoEditar(registro)}
                  className="cursor-pointer"
                >
                  <Pencil className="w-4 h-4 mr-1" /> Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => antesDeDeletar(registro.categoria_id)}
                  className="cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Apagar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </>
    );
  }

  function FormularioRegistro() {
    return (
      <>
        {registroEditando ? (
          <Card className=" w-full h-full mx-auto p-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {registroEditando.categoria_id === 0
                  ? "Novo Registro"
                  : "Editar Registro"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição da Categoria</Label>
                <Input
                  id="descricao"
                  value={registroEditando.dsc_categoria}
                  onChange={(e) =>
                    setRegistroEditando((prev) =>
                      prev ? { ...prev, dsc_categoria: e.target.value } : prev
                    )
                  }
                  placeholder="Ex: Bebidas, Alimentos, etc."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={aoFecharFormulario}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button className="cursor-pointer" onClick={aoSalvar}>
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </>
    );
  }

  return (
    <div className="p-6">
      {registroEditando ? FormularioRegistro() : ListaRegistros()}
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
