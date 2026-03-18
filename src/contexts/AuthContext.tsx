import { createContext, useContext, useState, ReactNode } from 'react';

export type PerfilUsuario = 'responsavel' | 'professor' | 'diretor' | 'secretaria';

interface AuthContextType {
  perfil: PerfilUsuario | null;
  nomeUsuario: string;
  login: (perfil: PerfilUsuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const nomesPorPerfil: Record<PerfilUsuario, string> = {
  responsavel: 'Responsável',
  professor: 'Professor',
  diretor: 'Diretor',
  secretaria: 'Secretaria Municipal',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  const login = (p: PerfilUsuario) => setPerfil(p);
  const logout = () => setPerfil(null);
  const nomeUsuario = perfil ? nomesPorPerfil[perfil] : '';

  return (
    <AuthContext.Provider value={{ perfil, nomeUsuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
