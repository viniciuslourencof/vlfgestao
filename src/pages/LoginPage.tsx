import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import ModalAviso from "@/components/modal-aviso";
import { UsuarioServices } from "@/services/usuarioServices";

export function LoginPage() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");

  const aoLogar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1) Buscar usuário pelo login (sempre armazenado em maiúsculas no BD)
      const usuario = await UsuarioServices.buscarPorLogin(login.toUpperCase());

      if (!usuario) {
        setMensagemAviso("Usuário não encontrado.");
        setMostrarAviso(true);
        return;
      }

      // 2) Verificar se a senha bate
      if (usuario.senha !== senha) {
        setMensagemAviso("Senha incorreta.");
        setMostrarAviso(true);
        return;
      }

      // 3) Se chegou até aqui, está tudo certo: gravar no localStorage e redirecionar
      localStorage.setItem("usuario_id", String(usuario.usuario_id));
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
        <div className="basis-1/2 bg-gradient-to-br from-gray-100 to-gray-300 hidden md:flex items-center justify-center">
          <img
            src="/vlf.png"
            alt="Ilustração de login"
            className="w-[90%] h-[90%] object-contain"
          />
        </div>

        {/* Formulário à direita */}
        <div className="basis-full md:basis-1/2 flex items-center justify-center">
          <Card className="w-full bg-white border-none shadow-none px-6">
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
              <form onSubmit={aoLogar} className="space-y-4">
                <div>
                  <Label htmlFor="login" className="mb-2">
                    Usuário
                  </Label>
                  <Input
                    id="login"
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="uppercase"
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
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
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

export default LoginPage;
