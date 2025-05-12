import { useState } from "react";
import { supabase } from "../lib/subabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import ModalAviso from "@/components/modal-aviso";

export function LoginForm() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("login", login);

      if (error) {
        setMensagemAviso("Erro ao buscar usuário: " + error.message);
        setMostrarAviso(true);
        return;
      }

      if (data.length === 0) {
        setMensagemAviso("Usuário não encontrado.");
        setMostrarAviso(true);
        return;
      }

      if (data[0].senha !== password) {
        setMensagemAviso("Senha incorreta.");
        setMostrarAviso(true);
        return;
      }

      localStorage.setItem("usuario_id", data[0].usuario_id);
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMensagemAviso("Erro ao tentar fazer login: " + err.message);
      } else {
        setMensagemAviso("Erro inesperado ao tentar fazer login.");
      }
      setMostrarAviso(true);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4 m-0">
      <div className="flex w-full max-w-5xl h-[500px] bg-white rounded-lg shadow overflow-hidden">
        {/* Imagem à esquerda */}
        <div className="basis-1/2 bg-gradient-to-br from-gray-100 to-gray-300 hidden md:block">
          <img
            src="/vlf.png"
            alt="Ilustração de login"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Formulário à direita */}
        <div className="basis-full md:basis-1/2 p-1 flex items-center justify-center">
          <Card className="w-full max-w-sm border-none shadow-none">
            <div className="mb-4 block md:hidden">
              <img
                src="vlf.png"
                alt="eBar Logo"
                className="w-12 h-12 mx-auto"
              />
            </div>

            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Acesso ao Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login" className="mb-2">Usuário</Label>
                  <Input
                    id="login"
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="mb-2">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-400 hover:bg-blue-500 text-white font-semibold cursor-pointer"
                >
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <ModalAviso
        open={mostrarAviso}
        onClose={setMostrarAviso}
        mensagem={mensagemAviso}
      />
    </div>
  );
}

export default LoginForm;
