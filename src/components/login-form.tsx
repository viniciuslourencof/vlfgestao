import { useState } from "react";
import { supabase } from "../lib/subabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
      // Verificar se o usuário existe na tabela 'usuarios'
      const { data, error } = await supabase
        .from("usuarios") // Tabela 'usuarios'
        .select("*")
        .eq("login", login)
        .single(); // Busca um único usuário

      if (error) {
        setMensagemAviso("Erro ao buscar usuário: " + error.message);
        setMostrarAviso(true);
        return;
      }

      if (!data) {
        setMensagemAviso("Usuário não encontrado.");
        setMostrarAviso(true);
        return;
      }

      // Verificar se a senha fornecida é correta
      if (data.senha !== password) {
        setMensagemAviso("Senha incorreta.");
        setMostrarAviso(true);
        return;
      }

      localStorage.setItem("usuario_id", data.usuario_id); // salva no navegador
      navigate("/"); // Redireciona para a home
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
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-0 m-0">      
      <Card className="w-full max-w-[400px] p-8 mx-4">
        <CardHeader className="flex items-center">
          <CardTitle className="text-center text-2xl font-bold text-gray-800">
            Acesso ao Sistema
          </CardTitle>
          <img src="vlf.png" alt="eBar Logo" className="w-8 h-8" />
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login" className="mb-2">
                Usuário
              </Label>
              <Input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="mb-2">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {mostrarAviso && (
              <Alert variant="destructive">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{mensagemAviso}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-400 hover:bg-blue-300 text-white font-semibold cursor-pointer"
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
      <ModalAviso
        open={mostrarAviso}
        onClose={setMostrarAviso}
        mensagem={mensagemAviso}
      />
    </div>
  );
}

export default LoginForm;
