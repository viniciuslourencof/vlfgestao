import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, RefreshCcw, Search } from "lucide-react";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ContaPagarType,
  ContaPagarComRelacionamentoType,
} from "../types/contasPagar";
import { ContasPagarServices } from "../services/contasPagarServices";
import { formatarData } from "@/lib/formatarData";
import ModalBuscaFormaPagamento from "@/components/modal-busca-forma-pagamento";
import ModalBuscaFornecedor from "@/components/modal-busca-fornecedor";
import { FormaPagamentoType } from "../types/formaPagamento";
import { FornecedorType } from "@/types/fornecedor";
import { FormaPagamentoServices } from "@/services/formaPagamentoServices";
import { FornecedorServices } from "@/services/fornecedorServices";

export function ContasPagarPage() {
  const [registros, setRegistros] = useState<ContaPagarType[]>([]);
  const [registroEditando, setRegistroEditando] =
    useState<ContaPagarType | null>(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [registroIdADeletar, setRegistroIdADeletar] = useState<number | null>(
    null
  );
  const [textoPesquisa, setTextoPesquisa] = useState<string>("");
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [abrirModalBuscaFormaPagamento, setAbrirModalBuscaFormaPagamento] =
    useState(false);
  const [abrirModalBuscaFornecedor, setAbrirModalBuscaFornecedor] =
    useState(false);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoType>({
    forma_pagamento_id: 0,
    dsc_forma_pagamento: "",
  });
  const [fornecedor, setFornecedor] = useState<FornecedorType>({
    fornecedor_id: 0,
    dsc_razao_social: "",
    dsc_nome_fantasia: "",
  });

  const carregarRegistros = useCallback(async () => {
    const resultado = await ContasPagarServices.buscarRegistros();

    const resultadosFormatado: ContaPagarType[] = resultado.map(
      (contaPagar: ContaPagarComRelacionamentoType) => ({
        conta_pagar_id: contaPagar.conta_pagar_id,
        fornecedor_id: contaPagar.fornecedor_id,
        forma_pagamento_id: contaPagar.forma_pagamento_id,
        vr_liquido: contaPagar.vr_liquido,
        dt_inc: contaPagar.dt_inc,
        dsc_forma_pagamento: contaPagar.formas_pagamento?.dsc_forma_pagamento,
        dsc_razao_social: contaPagar.fornecedores?.dsc_razao_social,
      })
    );

    setRegistros(resultadosFormatado);
  }, []);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  const aoInserir = () => {
    setRegistroEditando({
      conta_pagar_id: 0,
      fornecedor_id: 0,
      forma_pagamento_id: 0,
      vr_liquido: 0.0,
      dt_inc: new Date().toISOString(),
    });

    setFormaPagamento({ forma_pagamento_id: 0, dsc_forma_pagamento: "" });

    setFornecedor({
      fornecedor_id: 0,
      dsc_razao_social: "",
      dsc_nome_fantasia: "",
    });
  };

  const aoEditar = async (p_registro: ContaPagarType) => {
    setRegistroEditando(p_registro);

    if (p_registro.forma_pagamento_id !== 0) {
      const formaPagamento = await FormaPagamentoServices.buscarRegistro(
        Number(p_registro.forma_pagamento_id)
      );
      setFormaPagamento(formaPagamento);
    }

    if (p_registro.fornecedor_id !== 0) {
      const fornecedor = await FornecedorServices.buscarRegistro(
        Number(p_registro.fornecedor_id)
      );
      setFornecedor(fornecedor);
    }
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

    // const emUso = await ContasPagarServices.registroEmUso(
    //   registroIdADeletar
    // );
    // if (emUso) {
    //   setMensagemAviso("Registro em uso dentro de Pedidos, verifique!");
    //   setMostrarAviso(true);
    //   return;
    // }

    const error = await ContasPagarServices.deletar(registroIdADeletar);

    console.log("oi");

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

    if (registroEditando.vr_liquido === 0) {
      setMensagemAviso("Valor da Conta não pode ser zero.");
      setMostrarAviso(true);
      return;
    }    

    if (formaPagamento.forma_pagamento_id === 0) {
      setMensagemAviso("Forma de Pagamento não pode estar vazia.");
      setMostrarAviso(true);
      return;
    }

    if (fornecedor.fornecedor_id === 0) {
      setMensagemAviso("Fornecedor não pode estar vazio.");
      setMostrarAviso(true);
      return;
    }

    // const duplicado = await ContasPagarServices.verificaDuplicidade(
    //   registroEditando.forma_pagamento_id,
    //   registroEditando.dsc_forma_pagamento
    // );
    // if (duplicado) {
    //   setMensagemAviso("Descrição já cadastrada, verifique.");
    //   setMostrarAviso(true);
    //   return;
    // }

    registroEditando.forma_pagamento_id = formaPagamento.forma_pagamento_id;
    registroEditando.fornecedor_id = fornecedor.fornecedor_id;

    if (registroEditando.conta_pagar_id === 0) {
      const error = await ContasPagarServices.inserir(
        registroEditando.fornecedor_id,
        registroEditando.forma_pagamento_id,
        Number(registroEditando.vr_liquido)
      );

      if (error) {
        setMensagemAviso("Erro ao inserir registro: " + error);
        setMostrarAviso(true);
        return;
      }
    } else {
      const error = await ContasPagarServices.atualizar(
        registroEditando.conta_pagar_id,
        registroEditando.fornecedor_id,
        registroEditando.forma_pagamento_id,
        Number(registroEditando.vr_liquido)
      );

      if (error) {
        setMensagemAviso("Erro ao atualizar registro: " + error);
        setMostrarAviso(true);
        return;
      }
    }

    toast.success("Registro salvo com sucesso!");

    console.log("salvo");
    carregarRegistros();
    aoFecharFormulario();
  };

  const registrosFiltrados = registros.filter((registro) =>
    registro.conta_pagar_id.toString().includes(textoPesquisa.toLowerCase())
  );

  function ListaRegistros() {
    return (
      <>
        <h1 className="text-2xl font-bold">Contas a Pagar</h1>
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
              key={registro.conta_pagar_id}
              className="p-4 flex flex-col justify-between"
            >
              <div>
                <h2 className="font-semibold text-lg">
                  CONTA #{registro.conta_pagar_id}
                </h2>
                <p className="text-sm mt-1 text-gray-600">
                  Data: {formatarData(registro.dt_inc)}
                </p>

                <p className="text-sm mt-1 ">
                  Vr. Pedido: {Number(registro.vr_liquido).toFixed(2)}
                </p>

                <p className="text-sm ">
                  Forma de Pagamento: {registro.dsc_forma_pagamento}
                </p>
                <p className="text-sm ">
                  Fornecedor: {registro.dsc_razao_social}
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
                  onClick={() => antesDeDeletar(registro.conta_pagar_id)}
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
          <Tabs
            defaultValue="geral"
            className="w-full h-full max-w-none mx-auto"
          >
            <TabsList className="flex space-x-2 bg-muted p-1 rounded-xl shadow-inner border">
              <TabsTrigger value="geral">Geral</TabsTrigger>
            </TabsList>

            <TabsContent value="geral">
              <Card className="w-full h-full mx-auto">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {registroEditando.conta_pagar_id === 0
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
                        value={registroEditando.conta_pagar_id}
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
                        value={registroEditando.vr_liquido ?? ""}
                        onChange={(e) => {
                          const valor = e.target.value.replace(",", ".");
                          if (registroEditando) {
                            setRegistroEditando({
                              ...registroEditando,
                              vr_liquido: valor,
                            });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <Card className="p-4">
                    <h3 className="text-sm font-semibold border-b pb-1 text-black-700 tracking-wide">
                      Forma de Pagamento
                    </h3>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-2 items-end">
                      <div className="space-y-2 w-32">
                        <Label htmlFor="categoria_id">Código</Label>
                        <Input
                          id="categoria_id"
                          name="categoria_id"
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
                        <Label htmlFor="dsc_categoria">Descrição</Label>
                        <Input
                          id="dsc_categoria"
                          name="dsc_categoria"
                          value={formaPagamento.dsc_forma_pagamento || ""}
                          readOnly
                        />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h3 className="text-sm font-semibold border-b pb-1 text-black-700 tracking-wide">
                      Fornecedor
                    </h3>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-2 items-end">
                      <div className="space-y-2 w-32">
                        <Label htmlFor="categoria_id">Código</Label>
                        <Input
                          id="categoria_id"
                          name="categoria_id"
                          value={fornecedor.fornecedor_id}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2 w-10">
                        <Label className="invisible">Buscar</Label>
                        <button
                          onClick={() => setAbrirModalBuscaFornecedor(true)}
                          type="button"
                          className="w-10 h-9 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent cursor-pointer"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dsc_categoria">Descrição</Label>
                        <Input
                          id="dsc_categoria"
                          name="dsc_categoria"
                          value={fornecedor.dsc_razao_social || ""}
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
              <Button className="cursor-pointer" onClick={aoSalvar}>
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
      <ModalBuscaFornecedor
        open={abrirModalBuscaFornecedor}
        onClose={() => setAbrirModalBuscaFornecedor(false)}
        onSelect={(fornecedor) => {
          setFornecedor((prev) => ({
            ...prev,
            fornecedor_id: fornecedor.fornecedor_id,
            dsc_razao_social: fornecedor.dsc_razao_social,
            dsc_nome_fantasia: fornecedor.dsc_nome_fantasia,
          }));
        }}
      />
    </div>
  );
}
