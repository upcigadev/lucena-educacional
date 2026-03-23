/**
 * Centralized Supabase query functions.
 * Maps snake_case DB columns to camelCase shapes expected by the components.
 */
import { supabase } from '@/integrations/supabase/client';

// ---------------------------------------------------------------------------
// Escolas
// ---------------------------------------------------------------------------
export async function listarEscolas() {
  const { data, error } = await supabase
    .from('escolas')
    .select('*')
    .order('nome');
  if (error) throw error;
  return (data ?? []).map((e) => ({
    id: e.id,
    nome: e.nome,
    endereco: e.endereco,
    telefone: e.telefone,
    inep: e.inep,
  }));
}

// ---------------------------------------------------------------------------
// Series
// ---------------------------------------------------------------------------
export async function listarSeries() {
  const { data, error } = await supabase
    .from('series')
    .select('*, escola:escolas(id, nome)')
    .order('nome');
  if (error) throw error;
  return (data ?? []).map((s) => ({
    id: s.id,
    nome: s.nome,
    escolaId: s.escola_id,
    escola: s.escola,
    horarioInicio: s.horario_inicio,
    toleranciaMin: s.tolerancia_min,
    limiteMax: s.limite_max,
  }));
}

// ---------------------------------------------------------------------------
// Turmas
// ---------------------------------------------------------------------------
export async function listarTurmas() {
  const { data, error } = await supabase
    .from('turmas')
    .select('*, serie:series(id, nome, escola_id), escola:escolas(id, nome)')
    .order('nome');
  if (error) throw error;
  return (data ?? []).map((t) => ({
    id: t.id,
    nome: t.nome,
    sala: t.sala,
    escolaId: t.escola_id,
    serieId: t.serie_id,
    horarioInicio: t.horario_inicio,
    toleranciaMin: t.tolerancia_min,
    limiteMax: t.limite_max,
    escola: t.escola,
    serie: t.serie,
  }));
}

// ---------------------------------------------------------------------------
// Alunos
// ---------------------------------------------------------------------------
export async function listarAlunos() {
  const { data, error } = await supabase
    .from('alunos')
    .select(`
      *,
      turma:turmas(
        id, nome, sala, serie_id, escola_id,
        serie:series(id, nome),
        escola:escolas(id, nome)
      ),
      responsavel:responsaveis(
        id, telefone,
        usuario:usuarios(id, nome, cpf, papel)
      )
    `)
    .eq('ativo', true)
    .order('nome_completo');
  if (error) throw error;
  return (data ?? []).map((a) => ({
    id: a.id,
    nomeCompleto: a.nome_completo,
    matricula: a.matricula,
    escolaId: a.escola_id,
    turmaId: a.turma_id,
    responsavelId: a.responsavel_id,
    dataNascimento: a.data_nascimento,
    ativo: a.ativo,
    turma: a.turma
      ? {
          id: a.turma.id,
          nome: a.turma.nome,
          sala: a.turma.sala,
          serieId: a.turma.serie_id,
          escolaId: a.turma.escola_id,
          serie: a.turma.serie ? { id: a.turma.serie.id, nome: a.turma.serie.nome } : null,
          escola: a.turma.escola ? { id: a.turma.escola.id, nome: a.turma.escola.nome } : null,
        }
      : null,
    responsavel: a.responsavel
      ? {
          id: a.responsavel.id,
          telefone: a.responsavel.telefone,
          usuario: a.responsavel.usuario,
        }
      : null,
  }));
}

// ---------------------------------------------------------------------------
// Professores
// ---------------------------------------------------------------------------
export async function listarProfessores() {
  const { data, error } = await supabase
    .from('professores')
    .select(`
      id,
      usuario:usuarios(id, nome, cpf, papel),
      turmas:turma_professores(
        id,
        turma:turmas(id, nome, escola_id, escola:escolas(id, nome))
      )
    `);
  if (error) throw error;
  return (data ?? []).map((p) => ({
    id: p.id,
    usuario: p.usuario,
    turmas: p.turmas ?? [],
  }));
}

// ---------------------------------------------------------------------------
// Responsaveis
// ---------------------------------------------------------------------------
export async function listarResponsaveis() {
  const { data, error } = await supabase
    .from('responsaveis')
    .select(`
      id, telefone,
      usuario:usuarios(id, nome, cpf, papel),
      alunos:alunos(
        id, nome_completo,
        turma:turmas(id, nome, escola_id, escola:escolas(id, nome))
      )
    `);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    telefone: r.telefone,
    usuario: r.usuario,
    alunos: (r.alunos ?? []).map((a: any) => ({
      id: a.id,
      nomeCompleto: a.nome_completo,
      turma: a.turma
        ? {
            id: a.turma.id,
            nome: a.turma.nome,
            escolaId: a.turma.escola_id,
            escola: a.turma.escola,
          }
        : null,
    })),
  }));
}

// ---------------------------------------------------------------------------
// Diretores
// ---------------------------------------------------------------------------
export async function listarDiretores() {
  const { data, error } = await supabase
    .from('diretores')
    .select(`
      id, escola_id,
      usuario:usuarios(id, nome, cpf, papel),
      escola:escolas(id, nome)
    `);
  if (error) throw error;
  return (data ?? []).map((d) => ({
    id: d.id,
    escolaId: d.escola_id,
    usuario: d.usuario,
    escola: d.escola,
  }));
}

// ---------------------------------------------------------------------------
// Justificativas — there is no justificativas table in the schema yet.
// Return empty array so pages degrade gracefully until it's created.
// ---------------------------------------------------------------------------
export async function listarJustificativas(): Promise<any[]> {
  return [];
}
