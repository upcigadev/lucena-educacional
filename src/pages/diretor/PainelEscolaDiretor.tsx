import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { School, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function PainelEscolaDiretor() {
  const { escolaId } = useParams();
  const { usuario } = useAuth();
  const [escolas, setEscolas] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!usuario) return;

      // Get diretor record to find escola_id
      const { data: diretor } = await supabase
        .from('diretores')
        .select('escola_id')
        .eq('usuario_id', usuario.id)
        .single();

      if (!diretor) {
        setLoading(false);
        return;
      }

      const [escolasRes, seriesRes] = await Promise.all([
        supabase.from('escolas').select('*').eq('id', diretor.escola_id),
        supabase.from('series').select('*').eq('escola_id', diretor.escola_id).order('nome'),
      ]);

      if (escolasRes.data) setEscolas(escolasRes.data);
      if (seriesRes.data) setSeries(seriesRes.data);
      setLoading(false);
    };
    fetchData();
  }, [usuario]);

  if (loading) return <div>Carregando escola...</div>;
  if (escolas.length === 0) return <div className="text-muted-foreground">Nenhuma escola vinculada ao seu perfil.</div>;

  const escola = escolas[0];
  const seriesEscola = series;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{escola.nome}</h1>
      <p className="text-muted-foreground mb-6">
        {escola.endereco && `${escola.endereco} | `}
        {escola.telefone && `Tel: ${escola.telefone}`}
      </p>

      {seriesEscola.length === 0 ? (
        <div className="bg-card rounded-lg border p-8 text-center">
          <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground">Nenhuma série cadastrada</p>
          <p className="text-sm text-muted-foreground mt-1">Solicite à Secretaria a criação da estrutura acadêmica.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seriesEscola.map((serie: any) => (
            <Link key={serie.id} to={`/diretor/serie/${serie.id}`} className="block">
              <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg text-card-foreground">{serie.nome}</h3>
                <p className="text-xs text-muted-foreground mt-1">Clique para ver turmas</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
