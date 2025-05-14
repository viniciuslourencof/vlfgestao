import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { defaultTheme } from "../themes/defaultTheme";
// import { blueTheme } from "../themes/blueTheme";
// import { useState } from "react";

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  // const [isAlt, setIsAlt] = useState(false);

  // const applyTheme = (theme) => {
  //   const root = document.documentElement;
  //   for (const key in theme) {
  //     root.style.setProperty(key, theme[key]);
  //   }
  // };

  // const toggleTheme = () => {
  //   const newTheme = isAlt ? defaultTheme : blueTheme;
  //   applyTheme(newTheme);
  //   setIsAlt(!isAlt);
  // };

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
      {/* <button
        onClick={toggleTheme}
        className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded"
      >
        Alternar Tema
      </button>       */}
    </div>
  );
}
