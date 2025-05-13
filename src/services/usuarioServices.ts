import { supabase } from "../lib/subabase";

export class UsuarioServices {
  static async buscarUsuarioPeloLogin(p_login: string) {
    // Verifica se o id é válido antes de realizar a consulta
    if (p_login == "") {
      return {
        usuario_id: 0,
        dsc_usuario: "",
      };
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("usuario_id, login, dsc_usuario")
      .eq("login", p_login)
      .single();

    if (error || !data) {
      return {
        usuario_id: 0,
        dsc_usuario: "",
        login: "",
      };
    }

    
  }
}
