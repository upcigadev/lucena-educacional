import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo-educacional.png';
import { formatCpf } from '@/lib/masks';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export default function EsqueceuSenha() {
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      setErro('CPF inválido.');
      return;
    }

    setLoading(true);

    // Look up email by CPF
    const { data: usuario, error: lookupError } = await supabase
      .from('usuarios')
      .select('email')
      .eq('cpf', cpf)
      .single();

    if (lookupError || !usuario?.email) {
      setLoading(false);
      setErro('CPF não encontrado ou sem e-mail cadastrado.');
      return;
    }

    // Send password reset email
    const redirectUrl = `${window.location.origin}${window.location.pathname}#/redefinir-senha`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(usuario.email, {
      redirectTo: redirectUrl,
    });

    setLoading(false);

    if (resetError) {
      setErro('Erro ao enviar e-mail de redefinição. Tente novamente.');
      return;
    }

    setEnviado(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo Educacional" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h1 className="text-xl font-bold text-primary">Redefinir Senha</h1>
          <p className="text-sm text-muted-foreground mt-1">Informe seu CPF para receber o link de redefinição</p>
        </div>

        <div className="bg-card rounded-lg shadow-lg border p-6">
          {enviado ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-card-foreground font-medium mb-2">E-mail enviado!</p>
              <p className="text-sm text-muted-foreground mb-4">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </p>
              <Link
                to="/login"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {erro && (
                <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
                  {erro}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-card-foreground mb-1.5">CPF</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={e => { setCpf(formatCpf(e.target.value)); setErro(''); }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>

              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Voltar ao login
                </Link>
              </div>
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
