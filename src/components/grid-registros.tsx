import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  RowSelectionOptions,
  ICellRendererParams,
  IRowNode,
} from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { AG_GRID_LOCALE_BR } from "../lib/locale";
import { SquarePen, Trash2 } from "lucide-react";

// Registro dos módulos (necessário para AG Grid funcionar)
ModuleRegistry.registerModules([AllCommunityModule]);

interface GridProps<T> {
  registros: T[];
  colunas: ColDef[];  
  aoEditar: (registro: T) => void;
  antesDeDeletar: (registro: T) => void;
}

interface ActionButtonsProps<T> {
  data: T;
  node: IRowNode;
  onEdit: (registro: T) => void;
  onDelete: (registro: T) => void;
}

// Componente dos botões de ação
function ActionButtonsCellRenderer<T>({
  data,
  node,
  onEdit,
  onDelete,
}: ActionButtonsProps<T>) {
  if (node?.rowPinned) return null;

  return (
    <div className="flex gap-2 justify-center items-center h-full">
      <Button size="sm" onClick={() => onEdit(data)} className="cursor-pointer">
        <SquarePen />
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => onDelete(data)}
        className="cursor-pointer"
      >
        <Trash2 />
      </Button>
    </div>
  );
}

// Componente genérico de Grid
export default function GridRegistros<T>({
  registros,
  colunas,
  aoEditar,
  antesDeDeletar,
}: GridProps<T>) {
  // Acrescenta a coluna de ações no final
  const [columnDefs] = useState<ColDef[]>([
    ...colunas,
    {
      headerName: "Ações",
      field: "acoes",
      minWidth: 80,
      maxWidth: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <ActionButtonsCellRenderer
          data={params.data}
          onEdit={aoEditar}
          onDelete={antesDeDeletar}
          node={params.node}
        />
      ),
      sortable: false,
      filter: false,
      suppressSizeToFit: true, // impede que o grid tente esticar essa coluna
    },
  ]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      filter: "agTextColumnFilter",
      floatingFilter: true,
    }),
    []
  );

  const rowSelection: RowSelectionOptions = {
    mode: "multiRow",
    headerCheckbox: false,
  };

  return (
    <AgGridReact
      rowData={registros}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      rowSelection={rowSelection}
      pagination={true}
      paginationPageSize={50}
      paginationPageSizeSelector={[50, 100, 500]}
      localeText={AG_GRID_LOCALE_BR}
    />
  );
}
