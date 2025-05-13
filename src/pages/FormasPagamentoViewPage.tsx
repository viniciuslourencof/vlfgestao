import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, RefreshCcw } from "lucide-react";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import { FormaPagamentoType } from "../types/formaPagamento";
import { FormaPagamentoServices } from "../services/formaPagamentoServices";

export function FormasPagamentoViewPage() {
  const [registros, setRegistros] = useState<FormaPagamentoType[]>([]);
  const [registroEditando, setRegistroEditando] =
    useState<FormaPagamentoType | null>(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [registroIdADeletar, setRegistroIdADeletar] = useState<number | null>(
    null
  );
  const [textoPesquisa, setTextoPesquisa] = useState<string>("");
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

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

  const antesDeDeletar = (p_registro_id: number) => {
    setRegistroIdADeletar(p_registro_id);
    setMostrarConfirmacao(true);
  };

  const aoDeletar = async () => {
    if (!registroIdADeletar) return;

    setMostrarConfirmacao(false);

    const emUso = await FormaPagamentoServices.registroEmUso(
      registroIdADeletar
    );
    if (emUso) {
      setMensagemAviso("Registro em uso dentro de Pedidos, verifique!");
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

  const aoSalvar = async () => {
    if (!registroEditando) return;

    if (!registroEditando.dsc_forma_pagamento.trim()) {
      setMensagemAviso("Descrição não pode estar vazia.");
      setMostrarAviso(true);
      return;
    }

    const duplicado = await FormaPagamentoServices.verificaDuplicidade(
      registroEditando.dsc_forma_pagamento
    );
    if (duplicado) {
      setMensagemAviso("Descrição já cadastrada, verifique.");
      setMostrarAviso(true);
      return;
    }

    if (registroEditando.forma_pagamento_id === 0) {
      const error = await FormaPagamentoServices.inserir(
        registroEditando.dsc_forma_pagamento
      );

      if (error) {
        setMensagemAviso("Erro ao inserir registro: " + error);
        setMostrarAviso(true);
        return;
      }
    } else {
      const error = await FormaPagamentoServices.atualizar(
        registroEditando.forma_pagamento_id,
        registroEditando.dsc_forma_pagamento
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
    registro.dsc_forma_pagamento
      .toLowerCase()
      .includes(textoPesquisa.toLowerCase())
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
              key={registro.forma_pagamento_id}
              className="p-4 flex flex-col justify-between"
            >
              <div>
                <h2 className="font-semibold text-lg">
                  {registro.dsc_forma_pagamento}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Código: {registro.forma_pagamento_id}
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
                  onClick={() => antesDeDeletar(registro.forma_pagamento_id)}
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
                {registroEditando.forma_pagamento_id === 0
                  ? "Novo Registro"
                  : "Editar Registro"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição da categoria</Label>
                <Input
                  id="descricao"
                  value={registroEditando.dsc_forma_pagamento}
                  onChange={(e) =>
                    setRegistroEditando((prev) =>
                      prev ? { ...prev, dsc_forma_pagamento: e.target.value } : prev
                    )
                  }
                  placeholder="Ex: Cartão de Débito, Dinheiro, etc."
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
