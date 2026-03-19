import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo-educacional.png';
import { Loader2, CheckCircle } from 'lucide-react';

export default function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // When Supabase redirects back with recovery token, it auto-signs in the user
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if already in a session (user may have been redirected)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não conferem.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setLoading(false);

    if (error) {
      setErro('Erro ao redefinir senha. O link pode ter expirado.');
      return;
    }

    setSucesso(true);
    setTimeout(() => navigate('/login'), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo Educacional" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h1 className="text-xl font-bold text-primary">Nova Senha</h1>
          <p className="text-sm text-muted-foreground mt-1">Defina sua nova senha de acesso</p>
        </div>

        <div className="bg-card rounded-lg shadow-lg border p-6">
          {sucesso ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-card-foreground font-medium mb-2">Senha redefinida com sucesso!</p>
              <p className="text-sm text-muted-foreground">Redirecionando para o login...</p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center py-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Verificando link de redefinição...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {erro && (
                <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
                  {erro}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Nova senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={e => { setNovaSenha(e.target.value); setErro(''); }}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Confirmar senha</label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={e => { setConfirmarSenha(e.target.value); setErro(''); }}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          © 2026 Prefeitura Municipal de Lucena — Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
