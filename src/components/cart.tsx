import { Button } from "@/components/ui/button";
import { ChevronsRight, ChevronsLeft, Trash2, Search } from "lucide-react";
import ModalAviso from "@/components/modal-aviso";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import ModalBuscaFormaPagamento from "@/components/modal-busca-forma-pagamento";
import { FormaPagamentoType } from "../types/formaPagamento";
import { CartPropsType } from "../types/pedido";
import { PedidoServices } from "@/services/pedidoServices";
import { ClienteType } from "@/types/cliente";

export function Cart({
  carrinho,
  onRemoveItem,
  carrinhoMinimizado,
  setCarrinhoMinimizado,
  limpaCarrinho: resetCarrinho,
}: CartPropsType) {
  const [efetuandoOperacao, setEfetuandoOperacao] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [formaPagamento, setformaPagamento] = useState<FormaPagamentoType>({
    forma_pagamento_id: 0,
    dsc_forma_pagamento: "",
  });
  const [cliente] = useState<ClienteType>({
    cliente_id: 2,
    dsc_razao_social: "",
    dsc_nome_fantasia: "",
  });

  const [abrirModalBuscaFormaPagamento, setAbrirModalBuscaFormaPagamento] =
    useState(false);

  const aoFinalizar = async () => {
    setEfetuandoOperacao(true);

    try {
      const resultado = await PedidoServices.efetivarPedido(carrinho, {
        vr_liquido: 0.0,
        cliente_id: cliente.cliente_id,
        forma_pagamento_id: formaPagamento.forma_pagamento_id,
      });

      if (resultado.erro) {
        setMensagemAviso(resultado.erro);
        setMostrarAviso(true);
        return;
      }

      setMensagemAviso("Pedido finalizado com sucesso!");
      setMostrarAviso(true);
      resetCarrinho();
      setformaPagamento({ forma_pagamento_id: 0, dsc_forma_pagamento: "" });
    } finally {
      setEfetuandoOperacao(false);
    }
  };

  if (!carrinho) return;

  const subtotal = carrinho.reduce(
    (acumulado, item) => acumulado + item.vr_unit * item.quantidade,
    0
  );

  const total = subtotal;

  return (
    <div
      className={`bg-background border-t md:border-l flex flex-col h-[600px] md:h-full transition-all duration-300 ${
        carrinhoMinimizado ? "w-0 md:w-0" : "w-full md:w-[380px]"
      }`}
    >
      {/* Top bar com botão de minimizar */}
      <div className="p-4 border-b flex justify-between items-center">
        {!carrinhoMinimizado ? (
          <>
            <div>
              <h2 className="text-xl font-bold">Pedido</h2>
              <p className="text-sm text-gray-500">Cliente atual</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCarrinhoMinimizado(true)}
                className="cursor-pointer"
              >
                <ChevronsRight className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCarrinhoMinimizado(false)}
          >
            <ChevronsLeft className="h-5 w-5" />
          </Button>
        )}
      </div>

      {!carrinhoMinimizado && (
        <>
          <div className="flex-1 overflow-auto p-4">
            {carrinho.length === 0 ? (
              <p className="text-gray-500">Seu carrinho está vazio.</p>
            ) : (
              carrinho.map((item) => (
                <div
                  key={item.produto_id}
                  className="flex items-center gap-3 mb-4"
                >
                  {/* <div className="w-16 h-16 bg-gray-200 rounded-lg" /> */}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">
                      {item.produtos ? item.produtos.dsc_produto : ""}
                    </h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-black-600 font-bold">
                        R$ {item.vr_unit.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.quantidade}x
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => onRemoveItem(item.produto_id)}
                    className="hover:bg-red-700 hover:text-white cursor-pointer bg-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="border-t p-4">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <Card className="p-4 gap-3 mb-4">
              <h3 className="text-sm font-semibold border-b pb-1 text-black-700 tracking-wide">
                Forma de Pagamento
              </h3>

              <div className="grid grid-cols-[auto_auto_1fr] gap-2 items-end">
                <div className="space-y-2 w-12">
                  <Label htmlFor="1oria_id">Código</Label>
                  <Input
                    id="56oria_id"
                    name="categoria_id"
                    value={formaPagamento?.forma_pagamento_id || ""}
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

                <div className="space-y-2 w-full">
                  <Label htmlFor="dsc_forma_pagamento">Descrição</Label>
                  <Input
                    id="dsc_forma_pagamento"
                    name="dsc_forma_pagamento"
                    value={formaPagamento?.dsc_forma_pagamento || ""}
                    readOnly
                  />
                </div>
              </div>
            </Card>

            <Button
              className="w-full bg-gray-600 hover:bg-gray-700 text-white h-12 cursor-pointer"
              onClick={aoFinalizar}
              disabled={efetuandoOperacao}
            >
              {efetuandoOperacao ? "Finalizando..." : "Finalizar Pedido"}
            </Button>
          </div>
        </>
      )}
      <ModalBuscaFormaPagamento
        open={abrirModalBuscaFormaPagamento}
        onClose={() => setAbrirModalBuscaFormaPagamento(false)}
        onSelect={(forma_pagamento) => {
          setformaPagamento((prev) => ({
            ...prev,
            forma_pagamento_id: forma_pagamento.forma_pagamento_id,
            dsc_forma_pagamento: forma_pagamento.dsc_forma_pagamento,
          }));
        }}
      />
      <ModalAviso
        open={mostrarAviso}
        onClose={setMostrarAviso}
        mensagem={mensagemAviso}
      />
    </div>
  );
}
