// Componente GridRegistros.tsx (arquivo separado ou no mesmo arquivo, mas fora do CategoriasPage)
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, RowSelectionOptions } from "ag-grid-community";
import { AG_GRID_LOCALE_BR } from "../lib/locale";
import { IRowNode } from "ag-grid-community";
import type { ICellRendererParams } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { FornecedorType } from "../types/fornecedor";
    
ModuleRegistry.registerModules([ AllCommunityModule ]);

interface CellRendererParams extends ICellRendererParams {
  data: FornecedorType;
  onEdit: (registro: FornecedorType) => void;
}

type Props = {
  data: FornecedorType;
  onEdit: (registro: FornecedorType) => void;
  onDelete: (registro: FornecedorType) => void;
  node?: IRowNode;
};

type GridProps = {
  registros: FornecedorType[];
  aoEditar: (registro: FornecedorType) => void;
  antesDeDeletar: (registro: FornecedorType) => void;
};

const ActionButtonsCellRenderer: React.FC<Props> = ({
  data,
  onEdit,
  onDelete,
  node,
}) => {
  if (node?.rowPinned) {
    return <span />; // ou null, ou alguma coisa vazia, pra não mostrar botões no footer
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Button
        size="sm"
        variant="default"
        className="cursor-pointer"
        onClick={() => onEdit(data)}
      >
        Editar
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="cursor-pointer"
        onClick={() => onDelete(data)}
      >
        Excluir
      </Button>
    </div>
  );
};

export function GridRegistros({
  registros,  
  aoEditar,
  antesDeDeletar,
}: GridProps) {
  const [columnDefs] = useState<ColDef[]>([
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
    {
      headerName: "Ações",
      field: "acoes",
      width: 180,
      cellRenderer: (params: CellRendererParams) => (
        <ActionButtonsCellRenderer
          data={params.data}
          onEdit={aoEditar}
          onDelete={antesDeDeletar}
          node={params.node}
        />
      ),
      sortable: false,
      filter: false,
    },
  ]);

  const defaultColDef = useMemo(
    () => ({
      filter: "agTextColumnFilter",
      floatingFilter: true,
    }),
    []
  );

  const totalCount = registros.length;

  const rowSelection: RowSelectionOptions = {
    mode: "multiRow",
    headerCheckbox: false,
  };

  return (
    <div style={{ height: 500 }}>
      <AgGridReact
        rowData={registros}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection={rowSelection}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 25, 50]}
        localeText={AG_GRID_LOCALE_BR}
        pinnedBottomRowData={[
          {
            dsc_categoria: "Quantidade de Registros: " + totalCount.toString(),
          },
        ]}
      />
    </div>
  );
}
