import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, RefreshCcw, Search } from "lucide-react";
import { supabase } from "../lib/subabase";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import ModalBuscaFormaPagamento from "@/components/modal-busca-forma-pagamento";
import { FormaPagamentoServices } from "../services/formaPagamentoServices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormaPagamentoType } from "../types/formaPagamento";
import {
  PedidoType,  
  PedidoItemType,
  PedidoComRelacionamentoType
} from "../types/pedido";
import { PedidoServices } from "../services/pedidoServices"; // Ajuste o caminho conforme necessário
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatarData } from "@/lib/formatarData"; // ajuste o caminho conforme sua estrutura

export function PedidosViewPage() {
  const [pedidos, setPedidos] = useState<PedidoType[]>([]);
  const [pedidoEditando, setPedidoEditando] = useState<PedidoType | null>(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [pedidoIdADeletar, setPedidoIdADeletar] = useState<number | null>(null);
  const [textoConsulta, setTextoConsulta] = useState<string>("");
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoType>({
    forma_pagamento_id: 0,
    dsc_forma_pagamento: "",
  });
  const [abrirModalBuscaFormaPagamento, setAbrirModalBuscaFormaPagamento] =
    useState(false);
  const [itensPedido, setItensPedido] = useState<PedidoItemType[]>([]);

  async function carregarPedidos() {
    const resultado = await PedidoServices.buscarPedidos();

    const resultadosFormatado: PedidoType[] = resultado.map((pedido: PedidoComRelacionamentoType) => ({
      pedido_id: pedido.pedido_id,
      vr_liquido: pedido.vr_liquido,
      forma_pagamento_id: pedido.forma_pagamento_id,
      dt_inc: pedido.dt_inc,
      dsc_forma_pagamento: pedido.formas_pagamento?.dsc_forma_pagamento ?? "",
    }));

    setPedidos(resultadosFormatado);
  }

  const carregarItensDoPedido = useCallback(async () => {
    if (!pedidoEditando) return;

    const resultado = await PedidoServices.buscarItensDoPedido(
      pedidoEditando.pedido_id
    );

    setItensPedido(resultado);
  }, [pedidoEditando]);

  useEffect(() => {
    const carregarPedido = async () => {
      carregarPedidos();

      if (!pedidoEditando) return;

      if (pedidoEditando.pedido_id > 0) {
        await carregarItensDoPedido(); // Usando 'await' para garantir que a chamada seja resolvida
      }
    };

    carregarPedido();
  }, [pedidoEditando, carregarItensDoPedido]);

  const aoInserir = () => {
    setPedidoEditando({
      pedido_id: 0,
      vr_liquido: 0.0,
      forma_pagamento_id: 0,
      dt_inc: "",
    });
  };

  const aoEditar = async (pedido: PedidoType) => {
    setPedidoEditando(pedido);

    if (pedido.forma_pagamento_id !== 0) {
      const formaPagamento = await FormaPagamentoServices.buscarFormaPagamento(
        Number(pedido.forma_pagamento_id)
      );
      setFormaPagamento(formaPagamento);
    }
  };

  const AoFecharForm = () => {
    setPedidoEditando(null);
  };

  const aoClicarEmDeletar = (pedido_id: number) => {
    setPedidoIdADeletar(pedido_id);
    setMostrarConfirmacao(true);
  };

  const aoDeletar = async () => {
    if (!pedidoIdADeletar) return;

    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("pedido_id", pedidoIdADeletar);

    if (error) {
      setMensagemAviso("Erro ao apagar registro: " + error.message);
      setMostrarAviso(true);

      return;
    }

    toast.success("Registro apagado com sucesso!");

    setMostrarConfirmacao(false);
    carregarPedidos();
  };

  const pedidosFiltrados = pedidos.filter((pedido) =>
    pedido.pedido_id.toString().includes(textoConsulta)
  );

  function ListaRegistros() {
    return (
      <>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Input
          type="text"
          placeholder="Pesquisar registros..."
          className="w-full my-4 bg-white"
          value={textoConsulta}
          onChange={(e) => setTextoConsulta(e.target.value)}
        />
        <div className="flex items-center mb-4">
          <div className="flex gap-2">
            <Button onClick={aoInserir} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2 cursor-pointer" /> Novo
            </Button>
            <Button onClick={carregarPedidos} className="cursor-pointer">
              <RefreshCcw className="w-4 h-4 mr-2 cursor-pointer" />
              <span className="max-[400px]:hidden">Atualizar</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidosFiltrados.map((pedido) => (
            <Card
              key={pedido.pedido_id}
              className="p-4 flex flex-col justify-between"
            >
              <div>
                <h2 className="font-semibold text-lg">
                  Pedido #{pedido.pedido_id}
                </h2>
                <p className="text-sm mt-1 text-gray-600">
                  Data: {formatarData(pedido.dt_inc)}
                </p>

                <p className="text-sm ">
                  Vr. Pedido: {pedido.vr_liquido.toFixed(2)}
                </p>

                <p className="text-sm ">Forma: {pedido.dsc_forma_pagamento}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => aoEditar(pedido)}
                  className="cursor-pointer"
                >
                  <Pencil className="w-4 h-4 mr-1" /> Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => aoClicarEmDeletar(pedido.pedido_id)}
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
        {pedidoEditando ? (
          <Tabs
            defaultValue="geral"
            className="w-full h-full max-w-none mx-auto"
          >
            <TabsList className="flex space-x-2 bg-muted p-1 rounded-xl shadow-inner border">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="itens">Itens</TabsTrigger>
            </TabsList>

            <TabsContent value="geral">
              <Card className="w-full h-full mx-auto">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {pedidoEditando.pedido_id === 0
                      ? "Novo Registro"
                      : "Editar Registro"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="pedido_id">Código do Pedido</Label>
                      <Input
                        id="pedido_id"
                        value={pedidoEditando.pedido_id}
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dt_inc">Data de Efetivação</Label>
                      <Input
                        id="dt_inc"
                        value={formatarData(pedidoEditando.dt_inc)}
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vr_liquido">Vr. Liquido</Label>
                      <Input
                        id="vr_liquido"
                        value={(pedidoEditando.vr_liquido ?? 0).toFixed(2)}
                        readOnly
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
                          className="w-10 h-10 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent cursor-pointer"
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
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="itens">
              <Card className="w-full h-full mx-auto">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Itens do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="p-2 border rounded-md bg-gray-50">
                      <TableRow>
                        <TableCell className="font-semibold px-4 py-2">
                          Código
                        </TableCell>
                        <TableCell className="font-semibold px-4 py-2">
                          Descrição
                        </TableCell>
                        <TableCell className="font-semibold px-4 py-2">
                          Quantidade
                        </TableCell>
                        <TableCell className="font-semibold px-4 py-2">
                          Valor Unitário
                        </TableCell>
                        <TableCell className="font-semibold px-4 py-2">
                          Valor Total
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensPedido.map((item) => (
                        <TableRow key={item.pedido_item_id}>
                          <TableCell className="px-4 py-2">
                            {item.produto_id}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            {item.produtos?.dsc_produto}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            {item.quantidade}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            R$ {item.vr_unit.toFixed(2)}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            R$ {item.vr_item.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={AoFecharForm}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                className="cursor-pointer"
                onClick={async () => {
                  if (pedidoEditando.pedido_id === 0) {
                    const { error } = await supabase.from("pedidos").insert({
                      vr_liquido: pedidoEditando.vr_liquido,
                      forma_pagamento_id: formaPagamento.forma_pagamento_id,
                    });

                    if (error) {
                      setMensagemAviso(
                        "Erro ao criar registro: " + error.message
                      );
                      setMostrarAviso(true);
                      return;
                    }
                  } else {
                    const { error } = await supabase
                      .from("pedidos")
                      .update({
                        pedido_id: pedidoEditando.pedido_id,
                        vr_liquido: pedidoEditando.vr_liquido,
                        forma_pagamento_id: formaPagamento.forma_pagamento_id,
                      })
                      .eq("pedido_id", pedidoEditando.pedido_id);

                    if (error) {
                      setMensagemAviso(
                        "Erro ao atualizar registro: " + error.message
                      );
                      setMostrarAviso(true);
                      return;
                    }
                  }

                  toast.success("Registro salvo com sucesso!");
                  carregarPedidos();
                  AoFecharForm();
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
      {pedidoEditando ? FormularioRegistro() : ListaRegistros()}

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
    </div>
  );
}
