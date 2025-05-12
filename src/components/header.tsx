import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <div className="bg-white p-4 flex items-center gap-4 border-b">
      {/* Botão menu hambúrguer no mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onToggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1"></div> {/* Espaço vazio, sem o input de busca */}

      <Button variant="ghost" size="icon" className="cursor-pointer">
        <User className="h-5 w-5" />
      </Button>
    </div>
  );
}
