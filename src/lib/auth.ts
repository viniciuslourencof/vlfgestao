import { supabase } from "../lib/subabase";

// Função para obter a sessão atual
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Função para verificar se o usuário está logado
export const isLoggedIn = async () => {
  const session = await getSession();
  return session && session.user;
};
