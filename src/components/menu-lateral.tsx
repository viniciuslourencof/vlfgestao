import {
  Cuboid,
  LogOut,
  Store,
  Group,
  CreditCard,
  ShoppingCartIcon,
  ContactRound,
  BanknoteArrowDown,
  BanknoteArrowUp,
  Handshake,
  ChartColumn,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const itensMenu = [
  { icon: Store, label: "PDV", path: "/" },
  {
    icon: Cuboid,
    label: "Produtos",
    path: "/produtos",
  },
  {
    icon: Group,
    label: "Categorias",
    path: "/categorias",
  },
  {
    icon: CreditCard,
    label: "Formas de Pagamento",
    path: "/formasPagamento",
  },
  {
    icon: ShoppingCartIcon,
    label: "Pedidos",
    path: "/pedidos",
  },
  {
    icon: ContactRound,
    label: "Fornecedores",
    path: "/fornecedores",
  },
  {
    icon: Handshake,
    label: "Clientes",
    path: "/clientes",
  },
  {
    icon: BanknoteArrowDown,
    label: "Contas a Pagar",
    path: "/contasPagar",
  },
  {
    icon: BanknoteArrowUp,
    label: "Contas a Receber",
    path: "/contasReceber",
  },
  {
    icon: Navigation,
    label: "Tipos de Movimento",
    path: "/tiposMovimento",
  },
  {
    icon: ChartColumn,
    label: "Resumo Financeiro",
    path: "/resumoFinanceiro",
  },
];

export function MenuLateral({
  menuLateralAberto,
  aoFechar: aoFechar,
}: {
  menuLateralAberto: boolean;
  aoFechar: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario_id");
    navigate("/login");
  };

  return (
    <div
      className={`fixed z-40 top-0 left-0 h-full bg-white border-r w-64 p-4 transform transition-transform duration-300 ease-in-out
      ${
        menuLateralAberto ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:static md:block`}
    >
      <div className="flex items-center gap-2 mb-8">
        <img src="vlf.png" alt="eBar Logo" className="w-8 h-8" />
        <span className="font-semibold">VLF Sistemas</span>
      </div>

      <nav className="space-y-2">
        {itensMenu.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link to={item.path} key={index} onClick={aoFechar}>
              <Button
                variant="ghost"
                className={`w-full justify-start cursor-pointer ${
                  isActive
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Button
        variant="ghost"
        className="justify-start mt-auto text-muted-foreground absolute bottom-4 cursor-pointer w-56 "
        onClick={() => {
          aoFechar();
          handleLogout();
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
