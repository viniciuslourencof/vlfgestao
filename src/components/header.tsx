import { Menu, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/components/search-provider";

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { setSearchQuery } = useSearch();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

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

      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Pesquisar..."
          className="pl-10 w-full"
          onChange={handleSearchChange}
        />
      </div>

      <Button variant="ghost" size="icon" className="cursor-pointer">
        <User className="h-5 w-5" />
      </Button>
    </div>
  );
}
