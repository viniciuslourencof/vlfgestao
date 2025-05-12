import { Cuboid, LogOut, Home, Group } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Inicio", color: "text-green-600", path: "/" },
  {
    icon: Cuboid,
    label: "Produtos",
    color: "text-green-600",
    path: "/produtos",
  },
  {
    icon: Group,
    label: "Categorias",
    color: "text-green-600",
    path: "/categorias",
  },
];

export function SidebarNav({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
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
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:static md:block`}
    >
      <div className="flex items-center gap-2 mb-8">
        <img src="vlf.png" alt="eBar Logo" className="w-8 h-8" />
        <span className="font-semibold">VLF Sistemas</span>
      </div>

      <nav className="space-y-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link to={item.path} key={index} onClick={onClose}>
              <Button
                variant="ghost"
                className={`w-full justify-start ${
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
        className="w-full justify-start mt-auto text-muted-foreground absolute bottom-4 cursor-pointer"
        onClick={() => {
          onClose();
          handleLogout();
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
