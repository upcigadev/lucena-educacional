import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type PerfilUsuario = 'responsavel' | 'professor' | 'diretor' | 'secretaria';

interface UsuarioData {
  id: string;
  nome: string;
  cpf: string;
  papel: string;
  email: string | null;
  ativo: boolean;
}

interface AuthContextType {
  perfil: PerfilUsuario | null;
  nomeUsuario: string;
  usuario: UsuarioData | null;
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (cpf: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const papelToPerfilMap: Record<string, PerfilUsuario> = {
  RESPONSAVEL: 'responsavel',
  PROFESSOR: 'professor',
  DIRETOR: 'diretor',
  SECRETARIA: 'secretaria',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<UsuarioData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsuario = async (authId: string) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (!error && data) {
      setUsuario(data as UsuarioData);
    } else {
      setUsuario(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => fetchUsuario(session.user.id), 0);
        } else {
          setUsuario(null);
        }

        if (event === 'SIGNED_OUT') {
          setUsuario(null);
        }
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsuario(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (cpf: string, password: string): Promise<{ error?: string }> => {
    // 1. Look up the user's email by CPF
    const { data: usuarioData, error: lookupError } = await supabase
      .from('usuarios')
      .select('email, auth_id')
      .eq('cpf', cpf)
      .single();

    if (lookupError || !usuarioData) {
      return { error: 'CPF não encontrado no sistema.' };
    }

    if (!usuarioData.auth_id) {
      return { error: 'Este usuário ainda não possui credenciais de acesso. Contate a Secretaria.' };
    }

    if (!usuarioData.email) {
      return { error: 'E-mail não cadastrado para este usuário.' };
    }

    // 2. Sign in with Supabase Auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: usuarioData.email,
      password,
    });

    if (authError) {
      return { error: 'Senha incorreta ou conta não ativada.' };
    }

    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    setSession(null);
    setUser(null);
  };

  const perfil = usuario ? (papelToPerfilMap[usuario.papel] || null) : null;
  const nomeUsuario = usuario?.nome || '';

  return (
    <AuthContext.Provider value={{ perfil, nomeUsuario, usuario, user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
