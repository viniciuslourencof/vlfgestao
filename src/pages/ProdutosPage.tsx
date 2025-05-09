import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "../lib/subabase";

type ProdutoFormProps = {
  produto?: {
    produto_id: string;
    descricao: string;
    estoque: string;
    preco_venda1: string;
    preco_custo1: string;
    desconto: string;
    categoria_id: string;
    unidade_fardo: string;
    mililitros: string;
    doses: string;
    margem1: string;
    valor_dose: string;
  };
  onClose?: () => void;
  onSave?: () => void;
};

export function ProdutosPage({ produto, onClose, onSave }: ProdutoFormProps) {

  const calcularMargem = (precoCusto: string, precoVenda: string) => {
    const custo = parseFloat(precoCusto.replace(",", "."));
    const venda = parseFloat(precoVenda.replace(",", "."));

    var margem;

    if ((venda == 0) || (custo == 0) || (isNaN(venda)) || (isNaN(custo))) {
      margem = 0;      
    }
    else {    
      margem = ((venda - custo) / venda) * 100;
    }

    setForm((prev) => ({
      ...prev,
      margem1: parseFloat(margem).toFixed(2),
    }));    
  };

  const calcularDoses = (precoCusto: string, mililitros: string) => {
    const quantidadeML = parseFloat(mililitros.replace(",", "."));
    const dosesCalculadas = quantidadeML / 50;

    if (!isNaN(quantidadeML) && quantidadeML !== 0) {
      setForm((prev) => ({
        ...prev,
        doses: dosesCalculadas,
        valor_dose: parseFloat(precoCusto / dosesCalculadas).toFixed(2)
      }));
    }
  };

  const [form, setForm] = useState(
    produto || {
      produto_id: crypto.randomUUID(),
      dsc_produto: "",
      estoque: "",
      preco_venda1: "",
      preco_custo1: "",
      desconto: "",
      categoria_id: "",
      unidade_fardo: "",
      mililitros: "",
      doses: "",
      margem1: "",
      valor_dose: "",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const numericFields = [
      "preco_custo1",
      "preco_venda1",
      "desconto",      
      "mililitros",
      "doses",
      "margem1",
      "valor_dose",
    ];

    var sanitizedValue = numericFields.includes(name)
      ? value.replace(",", ".")
      : value;

    if (numericFields.includes(name)) {
      const match = sanitizedValue.match(/^\d*\.?\d{0,2}/);
      sanitizedValue = match ? match[0] : "";
    }

    setForm((prev) => {
      const updated = { ...prev, [name]: sanitizedValue };

      if (name === "preco_custo1" || name === "preco_venda1") {
        calcularMargem(updated.preco_custo1, updated.preco_venda1);
        calcularDoses(updated.preco_custo1, updated.mililitros);
      }

      if (name === "mililitros") {
        calcularDoses(updated.preco_custo1, updated.mililitros);
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const camposNumericos = [
      "preco_custo1",
      "preco_venda1",
      "desconto",
      "unidade_fardo",
      "mililitros",
      "doses",
      "estoque",
      "margem1"
    ];
  
    const formToSave = { ...form };
    let campoNaoNumericoVazio = false;
  
    for (const [campo, valor] of Object.entries(formToSave)) {
      if (valor === null || valor === "" || valor === undefined) {
        if (camposNumericos.includes(campo)) {
          formToSave[campo] = "0.00"; // ou "0" se preferir
        } else {
          campoNaoNumericoVazio = true;
          break;
        }
      }
    }
  
    if (campoNaoNumericoVazio) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
  
    if (!formToSave.produto_id || formToSave.produto_id === "0") {
      delete formToSave.produto_id;
    }
  
    if (!formToSave.categoria_id || formToSave.categoria_id === "0") {
      delete formToSave.categoria_id;
    }
  
    const { error } = await supabase
      .from("produtos")
      .upsert(formToSave, { onConflict: "produto_id" });
  
    if (error) {
      alert("Erro ao salvar produto: " + error.message);
      return;
    }
  
    alert("Produto salvo com sucesso!");
    onSave?.();
    onClose?.();
  };
  

  return (
    <Card className="w-full h-full max-w-none mx-auto">

      <CardHeader>
        <CardTitle>{produto ? "Editar Produto" : "Novo Produto"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="produto_id">Código do Produto</Label>
              <Input
                id="produto_id"
                name="produto_id"
                value={form.produto_id}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estoque">Estoque</Label>
              <Input
                id="estoque"
                name="estoque"
                value={form.estoque}
                onChange={handleChange}
                onBlur={(e) => {
                  const valor = parseFloat(e.target.value.replace(",", "."));
                  if (!isNaN(valor)) {
                    setForm((prev) => ({ ...prev, estoque: valor.toFixed(2) }));
                  }
                }}                  
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dsc_produto">Descrição</Label>
            <Input
              id="dsc_produto"
              name="dsc_produto"
              value={form.dsc_produto}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco_custo1">Preço de Custo</Label>
              <Input
                id="preco_custo1"
                name="preco_custo1"
                value={form.preco_custo1}
                onChange={handleChange}
                onBlur={(e) => {
                  const valor = parseFloat(e.target.value.replace(",", "."));
                  if (!isNaN(valor)) {
                    setForm((prev) => ({ ...prev, preco_custo1: valor.toFixed(2) }));
                  }
                }}                  
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco_venda1">Preço de Venda</Label>
              <Input
                id="preco_venda1"
                name="preco_venda1"
                value={form.preco_venda1}
                onChange={handleChange}
                onBlur={(e) => {
                  const valor = parseFloat(e.target.value.replace(",", "."));
                  if (!isNaN(valor)) {
                    setForm((prev) => ({ ...prev, preco_venda1: valor.toFixed(2) }));
                  }
                }}                  
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="margem1">Margem de Lucro (%)</Label>
              <Input
                id="margem1"
                name="margem1"
                value={form.margem1}
                onChange={handleChange}
                readOnly
                onBlur={(e) => {
                  const valor = parseFloat(e.target.value.replace(",", "."));
                  if (!isNaN(valor)) {
                    setForm((prev) => ({ ...prev, margem1: valor.toFixed(2) }));
                  }
                }}               
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desconto">Desconto (%)</Label>
              <Input
                id="desconto"
                name="desconto"         
                onChange={handleChange}                
                onBlur={(e) => {
                  const valor = parseFloat(e.target.value.replace(",", "."));
                  if (!isNaN(valor)) {
                    setForm((prev) => ({ ...prev, desconto: valor.toFixed(2) }));
                  }
                }}     
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria_id">Categoria ID</Label>
            <Input
              id="categoria_id"
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unidade_fardo">Unidade/Fardo</Label>
              <Input
                id="unidade_fardo"
                name="unidade_fardo"
                value={form.unidade_fardo}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mililitros">Mililitros</Label>
              <Input
                id="mililitros"
                name="mililitros"
                value={form.mililitros}
                onChange={handleChange}
                onBlur={(e) => {
                  const valor = parseFloat(e.target.value.replace(",", "."));
                  if (!isNaN(valor)) {
                    setForm((prev) => ({ ...prev, mililitros: valor.toFixed(2) }));
                  }
                }}              
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doses">Doses</Label>
              <Input
                id="doses"
                name="doses"
                value={form.doses}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_dose">Preço de Custo da Dose</Label>
              <Input
                id="valor_dose"
                name="valor_dose"
                value={form.valor_dose}
                onChange={handleChange}
                onBlur={(e) => {
                  const valor = parseFloat(e.target.value.replace(",", "."));
                  if (!isNaN(valor)) {
                    setForm((prev) => ({ ...prev, valor_dose: valor.toFixed(2) }));
                  }
                }}              
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="cursor-pointer w-auto"
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" className="cursor-pointer w-auto">
              Salvar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
