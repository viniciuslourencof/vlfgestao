import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pencil,
  Trash2,
  Plus,
  RefreshCcw,
  Search,
  ClipboardList,
} from "lucide-react";
import { ModalConfirmacao } from "@/components/modal-confirmacao";
import ModalAviso from "@/components/modal-aviso";
import { toast } from "sonner";
import ModalBuscaFormaPagamento from "@/components/modal-busca-forma-pagamento";
import ModalRelProdutosVendidos from "@/components/modal-rel-produtos-vendidos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormaPagamentoType } from "../types/formaPagamento";
import {
  PedidoType,
  PedidoItemType,
  PedidoComRelacionamentoType,
} from "../types/pedido";
import { PedidoItemServices } from "../services/pedidoItemServices";
import { PedidoServices } from "../services/pedidoServices";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatarData } from "@/lib/formatarData";
import { FormaPagamentoServices } from "@/services/formaPagamentoServices";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const frameworks = [
  {
    value: "Vendas por Produtos por Período",
    label: "Vendas por Produtos por Período",
  },
];

export function PedidosPage() {
  const [registros, setRegistros] = useState<PedidoType[]>([]);
  const [registroEditando, setRegistroEditando] = useState<PedidoType | null>(
    null
  );
  const [itensPedido, setItensPedido] = useState<PedidoItemType[]>([]);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [registroIdADeletar, setRegistroIdADeletar] = useState<number | null>(
    null
  );
  const [textoConsulta, setTextoConsulta] = useState<string>("");
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoType>({
    forma_pagamento_id: 0,
    dsc_forma_pagamento: "",
  });
  const [abrirModalBuscaFormaPagamento, setAbrirModalBuscaFormaPagamento] =
    useState(false);
  const [abrirModalRelProdutosVendidos, setAbrirModalRelProdutosVendidos] =
    useState(false);
  const [filtro, setFiltro] = useState<{
    dataInicio?: Date;
    dataFim?: Date;
    opcao: string;
  }>({
    opcao: "todos",
  });

  const carregarRegistros = useCallback(async () => {
    const resultado = await PedidoServices.buscarRegistros();

    const resultadosFormatado: PedidoType[] = resultado.map(
      (pedido: PedidoComRelacionamentoType) => ({
        pedido_id: pedido.pedido_id,
        vr_liquido: pedido.vr_liquido,
        forma_pagamento_id: pedido.forma_pagamento_id,
        dt_inc: pedido.dt_inc,
        dsc_forma_pagamento: pedido.formas_pagamento?.dsc_forma_pagamento ?? "",
      })
    );

    setRegistros(resultadosFormatado);
  }, []);

  const carregarItensDoPedido = useCallback(async () => {
    if (!registroEditando) return;

    const resultado = await PedidoItemServices.buscarRegistros(
      registroEditando.pedido_id
    );

    setItensPedido(resultado);
  }, [registroEditando]);

  useEffect(() => {
    const carregarDados = async () => {
      // Sempre carrega os registros principais
      await carregarRegistros();

      // Se estiver editando um registro válido, carrega os dados detalhados
      if (registroEditando && registroEditando.pedido_id > 0) {
        await carregarItensDoPedido(); // ou o nome da função de detalhe correspondente
      }
    };

    carregarDados();
  }, [registroEditando, carregarRegistros, carregarItensDoPedido]);

  const aoInserir = () => {
    setRegistroEditando({
      pedido_id: 0,
      vr_liquido: 0.0,
      forma_pagamento_id: 0,
      dt_inc: "",
    });
  };

  const aoEditar = async (p_registro: PedidoType) => {
    setRegistroEditando(p_registro);

    if (p_registro.forma_pagamento_id !== 0) {
      const formaPagamento = await FormaPagamentoServices.buscarRegistro(
        Number(p_registro.forma_pagamento_id)
      );
      setFormaPagamento(formaPagamento);
    }
  };

  const aoFecharFormulario = () => {
    setRegistroEditando(null);
  };

  const aoClicarEmDeletar = (p_id: number) => {
    setRegistroIdADeletar(p_id);
    setMostrarConfirmacao(true);
  };

  const aoDeletar = async () => {
    if (!registroIdADeletar) return;

    setMostrarConfirmacao(false);

    const error = await PedidoServices.deletar(registroIdADeletar);

    if (error) {
      setMensagemAviso("Erro ao apagar registro: " + error);
      setMostrarAviso(true);

      return;
    }

    toast.success("Registro apagado com sucesso!");

    setMostrarConfirmacao(false);
    carregarRegistros();
  };

  const aoSalvar = async () => {
    if (!registroEditando) return;

    registroEditando.forma_pagamento_id = formaPagamento.forma_pagamento_id;

    if (registroEditando.pedido_id === 0) {
      const error = await PedidoServices.inserir(
        registroEditando.vr_liquido,
        registroEditando.forma_pagamento_id
      );

      if (error) {
        setMensagemAviso("Erro ao inserir registro: " + error);
        setMostrarAviso(true);
        return;
      }
    } else {
      const error = await PedidoServices.atualizar(
        registroEditando.pedido_id,
        registroEditando.vr_liquido,
        registroEditando.forma_pagamento_id
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
    registro.pedido_id.toString().includes(textoConsulta)
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
            <Button onClick={aoInserir} className="cursor-pointer hidden">
              <Plus className="w-4 h-4 mr-2 cursor-pointer" /> Novo
            </Button>
            <Button onClick={carregarRegistros} className="cursor-pointer">
              <RefreshCcw className="w-4 h-4 mr-2 cursor-pointer" />
              <span className="max-[400px]:hidden">Atualizar</span>
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  role="combobox"
                  className="w-auto justify-between h-full cursor-pointer"
                >
                  <ClipboardList></ClipboardList>
                  Relatórios
                </Button>
              </PopoverTrigger>
              <PopoverContent className=" w-auto p-0" align="start">
                <Command className="">
                  <CommandList>
                    <CommandGroup>
                      {frameworks.map((framework) => (
                        <CommandItem
                          key={framework.value}
                          value={framework.value}
                          className="cursor-pointer"
                          onSelect={() =>
                            setAbrirModalRelProdutosVendidos(true)
                          }
                        >
                          {framework.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registrosFiltrados.map((registro) => (
            <Card
              key={registro.pedido_id}
              className="p-4 flex flex-col justify-between"
            >
              <div>
                <h2 className="font-semibold text-lg">
                  PEDIDO #{registro.pedido_id}
                </h2>
                <p className="text-muted-foreground text-sm text-gray-600">
                  Data: {formatarData(registro.dt_inc)}
                </p>

                <p className="text-sm mt-1 ">
                  Vr. Pedido: {registro.vr_liquido.toFixed(2)}
                </p>

                <p className="text-sm ">
                  Forma de Pagamento: {registro.dsc_forma_pagamento}
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
                  onClick={() => aoClicarEmDeletar(registro.pedido_id)}
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
              <TabsTrigger value="itens">Itens</TabsTrigger>
            </TabsList>

            <TabsContent value="geral">
              <Card className="w-full h-full mx-auto">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {registroEditando.pedido_id === 0
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
                        value={registroEditando.pedido_id}
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dt_inc">Data de Efetivação</Label>
                      <Input
                        id="dt_inc"
                        value={formatarData(registroEditando.dt_inc)}
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vr_liquido">Vr. Liquido</Label>
                      <Input
                        id="vr_liquido"
                        value={(registroEditando.vr_liquido ?? 0).toFixed(2)}
                        readOnly
                      />
                    </div>
                  </div>

                  <Card className="p-4 gap-3">
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
      <ModalRelProdutosVendidos
        open={abrirModalRelProdutosVendidos}
        onClose={() => setAbrirModalRelProdutosVendidos(false)}
        onConfirm={(data) => {
          setFiltro(data);
          console.log(filtro);
        }}
      />
    </div>
  );
}
