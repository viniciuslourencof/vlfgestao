import { supabase } from "../lib/subabase";
import { UsuarioType } from "@/types/usuario";

export class UsuarioServices {
  static async buscarRegistro(p_id: number) {
    if (p_id <= 0) {
      return {
        usuario_id: 0,
        login: "",
        dsc_usuario: "",
      };
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("usuario_id, login, dsc_usuario")
      .eq("usuario_id", p_id)
      .single();

    if (error || !data) {
      return {
        usuario_id: 0,
        login: "",
        dsc_usuario: "",
      };
    }

    return data;
  }

  static async buscarRegistros(): Promise<UsuarioType[]> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("dsc_usuario", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data;
  }

  static async verificaDuplicidade(
    p_id: number,
    p_login: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("usuario_id")
      .eq("login", p_login)
      .neq("usuario_id", p_id);

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  static async registroEmUso(p_id: number): Promise<boolean> {
    // Exemplo genérico — ajuste se o usuário estiver relacionado a outra tabela (ex: pedidos)
    const { data, error } = await supabase
      .from("pedidos")
      .select("pedido_id")
      .eq("usuario_id", p_id)
      .limit(1);

    if (error) {
      return false;
    }

    return data.length > 0;
  }

  static async inserir(
    payload: Omit<UsuarioType, "usuario_id">
  ): Promise<string | null> {
    const { error } = await supabase.from("usuarios").insert(payload);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async deletar(p_id: number): Promise<string | null> {
    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("usuario_id", p_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async atualizar(
    payload: Omit<UsuarioType, "usuario_id">,
    p_usuario_id: number
  ): Promise<string | null> {
    const { error } = await supabase
      .from("usuarios")
      .update(payload)
      .eq("usuario_id", p_usuario_id);

    if (error) {
      return error.message;
    }

    return null;
  }

  static async buscarPorLogin(p_login: string): Promise<UsuarioType | null> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("login", p_login)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }
}
