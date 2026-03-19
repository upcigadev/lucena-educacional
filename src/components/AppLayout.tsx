import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, PerfilUsuario } from '@/contexts/AuthContext';
import {
  Home, Users, FileText, Settings, BookOpen, GraduationCap,
  School, UserCheck, Bell, LogOut, Menu, X, ChevronDown, User, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const menusPorPerfil: Record<PerfilUsuario, MenuItem[]> = {
  responsavel: [
    { label: 'Painel', path: '/responsavel', icon: <Home className="w-5 h-5" /> },
    { label: 'Notificações', path: '/responsavel/notificacoes', icon: <Bell className="w-5 h-5" /> },
    { label: 'Justificativas', path: '/responsavel/justificativas', icon: <FileText className="w-5 h-5" /> },
    { label: 'Meus Dados', path: '/responsavel/meus-dados', icon: <User className="w-5 h-5" /> },
  ],
  professor: [
    { label: 'Escolas', path: '/professor', icon: <School className="w-5 h-5" /> },
    { label: 'Alunos', path: '/professor/alunos', icon: <Users className="w-5 h-5" /> },
    { label: 'Relatórios', path: '/professor/relatorios', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Meus Dados', path: '/professor/meus-dados', icon: <User className="w-5 h-5" /> },
  ],
  diretor: [
    { label: 'Painel', path: '/diretor', icon: <Home className="w-5 h-5" /> },
    { label: 'Justificativas', path: '/diretor/justificativas', icon: <FileText className="w-5 h-5" /> },
    { label: 'Alunos', path: '/diretor/alunos', icon: <Users className="w-5 h-5" /> },
    { label: 'Responsáveis', path: '/diretor/responsaveis', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Turmas', path: '/diretor/turmas', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Professores', path: '/diretor/professores', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Relatórios', path: '/diretor/relatorios', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Configurações', path: '/diretor/configuracoes', icon: <Settings className="w-5 h-5" /> },
    { label: 'Meus Dados', path: '/diretor/meus-dados', icon: <User className="w-5 h-5" /> },
  ],
  secretaria: [
    { label: 'Escolas', path: '/secretaria', icon: <School className="w-5 h-5" /> },
    { label: 'Diretores', path: '/secretaria/diretores', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Professores', path: '/secretaria/professores', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Responsáveis', path: '/secretaria/responsaveis', icon: <Users className="w-5 h-5" /> },
    { label: 'Alunos', path: '/secretaria/alunos', icon: <Users className="w-5 h-5" /> },
    { label: 'Justificativas', path: '/secretaria/justificativas', icon: <FileText className="w-5 h-5" /> },
    { label: 'Relatórios', path: '/secretaria/relatorios', icon: <BarChart3 className="w-5 h-5" /> },
  ],
};

const nomesPerfil: Record<PerfilUsuario, string> = {
  responsavel: 'Responsável',
  professor: 'Professor',
  diretor: 'Diretor',
  secretaria: 'Secretaria Municipal',
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { perfil, nomeUsuario, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  if (loading || !perfil) return null;

  const menu = menusPorPerfil[perfil];
  const notifs: any[] = [];
  const unread = notifs.filter((n: any) => !n.lida).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen w-full">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        sidebarOpen ? "w-64" : "w-0 -translate-x-full md:w-16 md:translate-x-0"
      )}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <School className="w-8 h-8 text-sidebar-primary flex-shrink-0" />
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-sidebar-primary leading-tight">Sistema Educacional</h1>
              <p className="text-xs text-sidebar-foreground/70">Lucena - PB</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {menu.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/' + perfil && location.pathname.startsWith(item.path + '/'));
            const isExactActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm transition-colors",
                  (isExactActive || isActive)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/60">{nomesPerfil[perfil]}</div>
            <div className="text-sm font-medium text-sidebar-primary truncate">{nomeUsuario}</div>
          </div>
        )}
      </aside>

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-0 md:ml-16"
      )}>
        <header className="sticky top-0 z-20 bg-card border-b flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md hover:bg-secondary">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-medium text-muted-foreground hidden sm:block">
              Prefeitura Municipal de Lucena
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-1.5 rounded-md hover:bg-secondary relative">
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-card rounded-lg shadow-lg border z-50 max-h-80 overflow-y-auto">
                  <div className="p-3 border-b font-semibold text-sm">Notificações</div>
                  {notifs.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">Nenhuma notificação</div>
                  ) : (
                    notifs.map((n: any) => (
                      <div key={n.id} className={cn("p-3 border-b text-sm", !n.lida && "bg-secondary/50")}>
                        <div className="font-medium">{n.titulo}</div>
                        <div className="text-muted-foreground text-xs mt-1">{n.mensagem}</div>
                        <div className="text-muted-foreground text-xs mt-1">{n.data}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{nomeUsuario}</span>
              <span className="badge-presente text-xs px-2 py-0.5 rounded-full">{nomesPerfil[perfil]}</span>
            </div>

            <button onClick={handleLogout} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
