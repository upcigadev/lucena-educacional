export type PerfilUsuario = 'responsavel' | 'professor' | 'diretor' | 'secretaria';
export type StatusJustificativa = 'pendente' | 'aprovada' | 'rejeitada';
export type StatusFrequencia = 'presente' | 'ausente' | 'justificado';

export interface Escola {
  id: string;
  nome: string;
  diretorId: string;
  diretorNome: string;
  frequenciaMedia: number;
}

export interface Serie {
  id: string;
  nome: string;
  escolaId: string;
  frequenciaMedia: number;
}

export interface Turma {
  id: string;
  nome: string;
  serieId: string;
  escolaId: string;
  sala: string;
  professorIds: string[];
  frequenciaMedia: number;
}

export interface Aluno {
  id: string;
  nome: string;
  cpf: string;
  matricula: string;
  turmaId: string;
  escolaId: string;
  serieName: string;
  turmaName: string;
  escolaNome: string;
  responsavelIds: string[];
  frequenciaEntrada: number;
  frequenciaTurma: number;
}

export interface Professor {
  id: string;
  nome: string;
  cpf: string;
  disciplinas: string[];
  escolaIds: string[];
  turmaIds: string[];
}

export interface Responsavel {
  id: string;
  nome: string;
  cpf: string;
  whatsapp: string;
  parentesco: string;
  dependenteIds: string[];
}

export interface Diretor {
  id: string;
  nome: string;
  cpf: string;
  escolaIds: string[];
}

export interface Justificativa {
  id: string;
  alunoId: string;
  alunoNome: string;
  responsavelId: string;
  responsavelNome: string;
  periodoInicio: string;
  periodoFim: string;
  status: StatusJustificativa;
  dataEnvio: string;
  documento: string;
  escolaId: string;
  escolaNome: string;
}

export interface RegistroFrequencia {
  data: string;
  status: StatusFrequencia;
}

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
}

export interface Dispositivo {
  id: string;
  nome: string;
  ip: string;
  status: 'online' | 'offline';
  escolaId: string;
}

export interface ConfiguracaoEscola {
  escolaId: string;
  portariaEntradaSaida: boolean;
  frequenciaTurma: boolean;
  chamadaAppMobile: boolean;
  percentualMinimo: number;
}

// ============ DATA ============

export const escolas: Escola[] = [
  { id: '1', nome: 'Escola Municipal Padre Cícero', diretorId: '1', diretorNome: 'João Ferreira', frequenciaMedia: 87 },
  { id: '2', nome: 'Escola Municipal Castro Alves', diretorId: '2', diretorNome: 'Ana Santos', frequenciaMedia: 91 },
  { id: '3', nome: 'Escola Municipal Monteiro Lobato', diretorId: '3', diretorNome: 'Pedro Lima', frequenciaMedia: 84 },
  { id: '4', nome: 'Escola Municipal Cecília Meireles', diretorId: '4', diretorNome: 'Lúcia Oliveira', frequenciaMedia: 89 },
];

export const diretores: Diretor[] = [
  { id: '1', nome: 'João Ferreira', cpf: '456.789.123-00', escolaIds: ['1'] },
  { id: '2', nome: 'Ana Santos', cpf: '567.890.234-11', escolaIds: ['2'] },
  { id: '3', nome: 'Pedro Lima', cpf: '678.901.345-22', escolaIds: ['3'] },
  { id: '4', nome: 'Lúcia Oliveira', cpf: '789.012.456-33', escolaIds: ['4'] },
];

export const series: Serie[] = [
  { id: 's1', nome: '1º Ano', escolaId: '1', frequenciaMedia: 89 },
  { id: 's2', nome: '2º Ano', escolaId: '1', frequenciaMedia: 85 },
  { id: 's3', nome: '3º Ano', escolaId: '1', frequenciaMedia: 82 },
  { id: 's4', nome: '4º Ano', escolaId: '1', frequenciaMedia: 88 },
  { id: 's5', nome: '5º Ano', escolaId: '1', frequenciaMedia: 90 },
  { id: 's6', nome: '1º Ano', escolaId: '2', frequenciaMedia: 91 },
  { id: 's7', nome: '2º Ano', escolaId: '2', frequenciaMedia: 88 },
  { id: 's8', nome: '3º Ano', escolaId: '2', frequenciaMedia: 92 },
  { id: 's9', nome: '4º Ano', escolaId: '2', frequenciaMedia: 87 },
  { id: 's10', nome: '5º Ano', escolaId: '2', frequenciaMedia: 93 },
  { id: 's11', nome: '1º Ano', escolaId: '3', frequenciaMedia: 84 },
  { id: 's12', nome: '2º Ano', escolaId: '3', frequenciaMedia: 82 },
  { id: 's13', nome: '3º Ano', escolaId: '3', frequenciaMedia: 86 },
  { id: 's14', nome: '1º Ano', escolaId: '4', frequenciaMedia: 90 },
  { id: 's15', nome: '2º Ano', escolaId: '4', frequenciaMedia: 88 },
  { id: 's16', nome: '3º Ano', escolaId: '4', frequenciaMedia: 91 },
  { id: 's17', nome: '4º Ano', escolaId: '4', frequenciaMedia: 87 },
];

export const turmas: Turma[] = [
  { id: 't1', nome: '3º Ano A', serieId: 's3', escolaId: '1', sala: 'Sala 5', professorIds: ['1', '4'], frequenciaMedia: 82 },
  { id: 't2', nome: '4º Ano A', serieId: 's4', escolaId: '1', sala: 'Sala 7', professorIds: ['1'], frequenciaMedia: 88 },
  { id: 't3', nome: '1º Ano A', serieId: 's1', escolaId: '1', sala: 'Sala 1', professorIds: ['2', '4'], frequenciaMedia: 89 },
  { id: 't4', nome: '2º Ano A', serieId: 's2', escolaId: '1', sala: 'Sala 3', professorIds: ['2'], frequenciaMedia: 85 },
  { id: 't5', nome: '5º Ano A', serieId: 's5', escolaId: '1', sala: 'Sala 9', professorIds: ['3'], frequenciaMedia: 90 },
  { id: 't6', nome: '1º Ano B', serieId: 's6', escolaId: '2', sala: 'Sala 2', professorIds: ['3'], frequenciaMedia: 91 },
  { id: 't7', nome: '2º Ano A', serieId: 's7', escolaId: '2', sala: 'Sala 4', professorIds: ['1'], frequenciaMedia: 88 },
  { id: 't8', nome: '3º Ano A', serieId: 's8', escolaId: '2', sala: 'Sala 6', professorIds: ['5'], frequenciaMedia: 92 },
  { id: 't9', nome: '1º Ano A', serieId: 's11', escolaId: '3', sala: 'Sala 1', professorIds: ['4'], frequenciaMedia: 84 },
  { id: 't10', nome: '2º Ano A', serieId: 's12', escolaId: '3', sala: 'Sala 2', professorIds: ['5'], frequenciaMedia: 82 },
  { id: 't11', nome: '1º Ano A', serieId: 's14', escolaId: '4', sala: 'Sala 1', professorIds: ['6'], frequenciaMedia: 90 },
  { id: 't12', nome: '3º Ano A', serieId: 's16', escolaId: '4', sala: 'Sala 3', professorIds: ['6'], frequenciaMedia: 91 },
];

export const professores: Professor[] = [
  { id: '1', nome: 'Carlos Mendes', cpf: '987.654.321-00', disciplinas: ['Matemática', 'Ciências'], escolaIds: ['1', '2'], turmaIds: ['t1', 't2', 't7'] },
  { id: '2', nome: 'Fernanda Rocha', cpf: '876.543.210-11', disciplinas: ['Português', 'História'], escolaIds: ['1'], turmaIds: ['t3', 't4'] },
  { id: '3', nome: 'Roberto Silva', cpf: '765.432.109-22', disciplinas: ['Geografia', 'Artes'], escolaIds: ['1', '2'], turmaIds: ['t5', 't6'] },
  { id: '4', nome: 'Patrícia Nunes', cpf: '654.321.098-33', disciplinas: ['Educação Física'], escolaIds: ['1', '3'], turmaIds: ['t1', 't3', 't9'] },
  { id: '5', nome: 'Marcelo Santos', cpf: '543.210.987-44', disciplinas: ['Inglês', 'Ciências'], escolaIds: ['2', '3'], turmaIds: ['t8', 't10'] },
  { id: '6', nome: 'Juliana Pereira', cpf: '432.109.876-55', disciplinas: ['Matemática', 'Português'], escolaIds: ['4'], turmaIds: ['t11', 't12'] },
];

export const responsaveis: Responsavel[] = [
  { id: '1', nome: 'Maria da Silva', cpf: '123.456.789-00', whatsapp: '(83) 99999-1234', parentesco: 'Mãe', dependenteIds: ['a1', 'a6'] },
  { id: '2', nome: 'José Oliveira', cpf: '321.654.987-00', whatsapp: '(83) 99888-5678', parentesco: 'Pai', dependenteIds: ['a2'] },
  { id: '3', nome: 'Sandra Costa', cpf: '234.567.890-12', whatsapp: '(83) 99777-9012', parentesco: 'Mãe', dependenteIds: ['a3'] },
  { id: '4', nome: 'Paulo Souza', cpf: '345.678.901-23', whatsapp: '(83) 99666-3456', parentesco: 'Pai', dependenteIds: ['a4', 'a5'] },
  { id: '5', nome: 'Ana Rodrigues', cpf: '456.789.012-34', whatsapp: '(83) 99555-7890', parentesco: 'Mãe', dependenteIds: ['a7', 'a9'] },
  { id: '6', nome: 'Cláudia Almeida', cpf: '567.890.123-45', whatsapp: '(83) 99444-1234', parentesco: 'Mãe', dependenteIds: ['a8', 'a10'] },
  { id: '7', nome: 'Fernando Lima', cpf: '678.901.234-56', whatsapp: '(83) 99333-5678', parentesco: 'Pai', dependenteIds: ['a11', 'a16'] },
  { id: '8', nome: 'Luciana Ribeiro', cpf: '789.012.345-67', whatsapp: '(83) 99222-9012', parentesco: 'Mãe', dependenteIds: ['a17', 'a18'] },
  { id: '9', nome: 'Marcos Nascimento', cpf: '890.123.456-78', whatsapp: '(83) 99111-3456', parentesco: 'Pai', dependenteIds: ['a13', 'a14'] },
  { id: '10', nome: 'Beatriz Martins', cpf: '901.234.567-89', whatsapp: '(83) 99000-7890', parentesco: 'Mãe', dependenteIds: ['a15'] },
];

export const alunos: Aluno[] = [
  { id: 'a1', nome: 'Lucas da Silva', cpf: '111.222.333-44', matricula: '2026001', turmaId: 't1', escolaId: '1', serieName: '3º Ano', turmaName: '3º Ano A', escolaNome: 'E.M. Padre Cícero', responsavelIds: ['1'], frequenciaEntrada: 82, frequenciaTurma: 85 },
  { id: 'a2', nome: 'Pedro Oliveira', cpf: '222.333.444-55', matricula: '2026002', turmaId: 't1', escolaId: '1', serieName: '3º Ano', turmaName: '3º Ano A', escolaNome: 'E.M. Padre Cícero', responsavelIds: ['2'], frequenciaEntrada: 90, frequenciaTurma: 88 },
  { id: 'a3', nome: 'Mariana Costa', cpf: '333.444.555-66', matricula: '2026003', turmaId: 't1', escolaId: '1', serieName: '3º Ano', turmaName: '3º Ano A', escolaNome: 'E.M. Padre Cícero', responsavelIds: ['3'], frequenciaEntrada: 78, frequenciaTurma: 75 },
  { id: 'a4', nome: 'João Souza', cpf: '444.555.666-77', matricula: '2026004', turmaId: 't1', escolaId: '1', serieName: '3º Ano', turmaName: '3º Ano A', escolaNome: 'E.M. Padre Cícero', responsavelIds: ['4'], frequenciaEntrada: 70, frequenciaTurma: 72 },
  { id: 'a5', nome: 'Isabela Santos', cpf: '555.666.777-88', matricula: '2026005', turmaId: 't1', escolaId: '1', serieName: '3º Ano', turmaName: '3º Ano A', escolaNome: 'E.M. Padre Cícero', responsavelIds: ['4'], frequenciaEntrada: 95, frequenciaTurma: 93 },
  { id: 'a6', nome: 'Ana da Silva', cpf: '666.777.888-99', matricula: '2026006', turmaId: 't6', escolaId: '2', serieName: '1º Ano', turmaName: '1º Ano B', escolaNome: 'E.M. Castro Alves', responsavelIds: ['1'], frequenciaEntrada: 91, frequenciaTurma: 88 },
  { id: 'a7', nome: 'Sofia Rodrigues', cpf: '777.888.999-00', matricula: '2026007', turmaId: 't3', escolaId: '1', serieName: '1º Ano', turmaName: '1º Ano A', escolaNome: 'E.M. Padre Cícero', responsavelIds: ['5'], frequenciaEntrada: 91, frequenciaTurma: 89 },
  { id: 'a8', nome: 'Miguel Almeida', cpf: '888.999.000-11', matricula: '2026008', turmaId: 't3', escolaId: '1', serieName: '1º Ano', turmaName: '1º Ano A', escolaNome: 'E.M. Padre Cícero', responsavelIds: ['6'], frequenciaEntrada: 87, frequenciaTurma: 85 },
  { id: 'a9', nome: 'Gabriel Ferreira', cpf: '999.000.111-22', matricula: '2026009', turmaId: 't2', escolaId: '1', serieName: '4º Ano', turmaName: '4º Ano A', escolaNome: 'E.M. Padre Cícero', responsavelIds: ['5'], frequenciaEntrada: 88, frequenciaTurma: 86 },
  { id: 'a10', nome: 'Larissa Lima', cpf: '000.111.222-33', matricula: '2026010', turmaId: 't2', escolaId: '1', serieName: '4º Ano', turmaName: '4º Ano A', escolaNome: 'E.M. Padre Cícero', responsavelIds: ['6'], frequenciaEntrada: 92, frequenciaTurma: 90 },
  { id: 'a11', nome: 'Rafael Mendes', cpf: '112.223.334-44', matricula: '2026011', turmaId: 't2', escolaId: '1', serieName: '4º Ano', turmaName: '4º Ano A', escolaNome: 'E.M. Padre Cícero', responsavelIds: ['7'], frequenciaEntrada: 85, frequenciaTurma: 83 },
  { id: 'a13', nome: 'Arthur Nascimento', cpf: '334.445.556-66', matricula: '2026013', turmaId: 't7', escolaId: '2', serieName: '2º Ano', turmaName: '2º Ano A', escolaNome: 'E.M. Castro Alves', responsavelIds: ['9'], frequenciaEntrada: 86, frequenciaTurma: 84 },
  { id: 'a14', nome: 'Helena Carvalho', cpf: '445.556.667-77', matricula: '2026014', turmaId: 't7', escolaId: '2', serieName: '2º Ano', turmaName: '2º Ano A', escolaNome: 'E.M. Castro Alves', responsavelIds: ['9'], frequenciaEntrada: 91, frequenciaTurma: 89 },
  { id: 'a15', nome: 'Enzo Martins', cpf: '556.667.778-88', matricula: '2026015', turmaId: 't7', escolaId: '2', serieName: '2º Ano', turmaName: '2º Ano A', escolaNome: 'E.M. Castro Alves', responsavelIds: ['10'], frequenciaEntrada: 88, frequenciaTurma: 86 },
  { id: 'a16', nome: 'Valentina Barbosa', cpf: '667.778.889-99', matricula: '2026016', turmaId: 't3', escolaId: '1', serieName: '1º Ano', turmaName: '1º Ano A', escolaNome: 'E.M. Padre Cícero', responsavelIds: ['7'], frequenciaEntrada: 93, frequenciaTurma: 91 },
  { id: 'a17', nome: 'Davi Ribeiro', cpf: '778.889.990-00', matricula: '2026017', turmaId: 't6', escolaId: '2', serieName: '1º Ano', turmaName: '1º Ano B', escolaNome: 'E.M. Castro Alves', responsavelIds: ['8'], frequenciaEntrada: 89, frequenciaTurma: 87 },
  { id: 'a18', nome: 'Laura Gomes', cpf: '889.990.001-11', matricula: '2026018', turmaId: 't6', escolaId: '2', serieName: '1º Ano', turmaName: '1º Ano B', escolaNome: 'E.M. Castro Alves', responsavelIds: ['8'], frequenciaEntrada: 94, frequenciaTurma: 92 },
  { id: 'a19', nome: 'Thiago Pereira', cpf: '990.001.112-22', matricula: '2026019', turmaId: 't8', escolaId: '2', serieName: '3º Ano', turmaName: '3º Ano A', escolaNome: 'E.M. Castro Alves', responsavelIds: ['3'], frequenciaEntrada: 92, frequenciaTurma: 90 },
  { id: 'a20', nome: 'Manuela Dias', cpf: '001.112.223-33', matricula: '2026020', turmaId: 't9', escolaId: '3', serieName: '1º Ano', turmaName: '1º Ano A', escolaNome: 'E.M. Monteiro Lobato', responsavelIds: ['10'], frequenciaEntrada: 84, frequenciaTurma: 80 },
  { id: 'a21', nome: 'Bernardo Campos', cpf: '012.123.234-44', matricula: '2026021', turmaId: 't11', escolaId: '4', serieName: '1º Ano', turmaName: '1º Ano A', escolaNome: 'E.M. Cecília Meireles', responsavelIds: ['2'], frequenciaEntrada: 90, frequenciaTurma: 88 },
];

export const justificativas: Justificativa[] = [
  { id: 'j1', alunoId: 'a1', alunoNome: 'Lucas da Silva', responsavelId: '1', responsavelNome: 'Maria da Silva', periodoInicio: '2026-03-03', periodoFim: '2026-03-05', status: 'pendente', dataEnvio: '2026-03-06', documento: 'atestado_medico.pdf', escolaId: '1', escolaNome: 'E.M. Padre Cícero' },
  { id: 'j2', alunoId: 'a2', alunoNome: 'Pedro Oliveira', responsavelId: '2', responsavelNome: 'José Oliveira', periodoInicio: '2026-02-20', periodoFim: '2026-02-21', status: 'aprovada', dataEnvio: '2026-02-22', documento: 'declaracao.pdf', escolaId: '1', escolaNome: 'E.M. Padre Cícero' },
  { id: 'j3', alunoId: 'a6', alunoNome: 'Ana da Silva', responsavelId: '1', responsavelNome: 'Maria da Silva', periodoInicio: '2026-02-10', periodoFim: '2026-02-10', status: 'rejeitada', dataEnvio: '2026-02-11', documento: 'justificativa.jpg', escolaId: '2', escolaNome: 'E.M. Castro Alves' },
  { id: 'j4', alunoId: 'a9', alunoNome: 'Gabriel Ferreira', responsavelId: '5', responsavelNome: 'Ana Rodrigues', periodoInicio: '2026-02-15', periodoFim: '2026-02-28', status: 'pendente', dataEnvio: '2026-02-16', documento: 'atestado.pdf', escolaId: '1', escolaNome: 'E.M. Padre Cícero' },
  { id: 'j5', alunoId: 'a13', alunoNome: 'Arthur Nascimento', responsavelId: '9', responsavelNome: 'Marcos Nascimento', periodoInicio: '2026-03-02', periodoFim: '2026-03-04', status: 'pendente', dataEnvio: '2026-03-05', documento: 'receita_medica.pdf', escolaId: '2', escolaNome: 'E.M. Castro Alves' },
  { id: 'j6', alunoId: 'a4', alunoNome: 'João Souza', responsavelId: '4', responsavelNome: 'Paulo Souza', periodoInicio: '2026-03-06', periodoFim: '2026-03-07', status: 'pendente', dataEnvio: '2026-03-08', documento: 'atestado_medico2.pdf', escolaId: '1', escolaNome: 'E.M. Padre Cícero' },
];

export const notificacoes: Record<PerfilUsuario, Notificacao[]> = {
  responsavel: [
    { id: 'n1', titulo: 'Justificativa Pendente', mensagem: 'A justificativa de Lucas da Silva para os dias 03-05/03 está pendente de avaliação.', data: '2026-03-06', lida: false },
    { id: 'n2', titulo: 'Aviso do Professor', mensagem: 'Prof. Carlos Mendes: Reunião de pais dia 15/03 às 14h.', data: '2026-03-04', lida: true },
    { id: 'n3', titulo: 'Frequência Baixa', mensagem: 'Lucas da Silva está com frequência de entrada abaixo de 75% na escola.', data: '2026-03-03', lida: false },
  ],
  professor: [
    { id: 'n4', titulo: 'Nova Justificativa', mensagem: 'Responsável enviou justificativa para Lucas da Silva (3º Ano A).', data: '2026-03-06', lida: false },
    { id: 'n5', titulo: 'Aluno com Frequência Baixa', mensagem: 'João Souza (3º Ano A) está com frequência abaixo de 75%.', data: '2026-03-05', lida: false },
  ],
  diretor: [
    { id: 'n6', titulo: 'Justificativas Pendentes', mensagem: 'Existem 3 justificativas pendentes de avaliação.', data: '2026-03-08', lida: false },
    { id: 'n7', titulo: 'Dispositivo Offline', mensagem: 'O leitor da portaria lateral está offline desde 08/03.', data: '2026-03-08', lida: false },
    { id: 'n8', titulo: 'Frequência Geral', mensagem: 'A turma 3º Ano A apresenta frequência média de 82%.', data: '2026-03-07', lida: true },
  ],
  secretaria: [
    { id: 'n9', titulo: 'Relatório Mensal', mensagem: 'O relatório de frequência de fevereiro está disponível.', data: '2026-03-01', lida: true },
    { id: 'n10', titulo: 'Justificativas Pendentes +15 dias', mensagem: 'Existem 1 justificativa pendente há mais de 15 dias.', data: '2026-03-08', lida: false },
  ],
};

export const dispositivos: Dispositivo[] = [
  { id: 'd1', nome: 'Leitor Portaria Principal', ip: '192.168.1.10', status: 'online', escolaId: '1' },
  { id: 'd2', nome: 'Leitor Portaria Lateral', ip: '192.168.1.11', status: 'offline', escolaId: '1' },
  { id: 'd3', nome: 'Leitor Entrada Principal', ip: '192.168.1.20', status: 'online', escolaId: '2' },
  { id: 'd4', nome: 'Leitor Portaria', ip: '192.168.1.30', status: 'online', escolaId: '3' },
  { id: 'd5', nome: 'Leitor Entrada', ip: '192.168.1.40', status: 'online', escolaId: '4' },
];

export const configuracoesEscolas: ConfiguracaoEscola[] = [
  { escolaId: '1', portariaEntradaSaida: true, frequenciaTurma: true, chamadaAppMobile: false, percentualMinimo: 75 },
  { escolaId: '2', portariaEntradaSaida: true, frequenciaTurma: true, chamadaAppMobile: true, percentualMinimo: 75 },
  { escolaId: '3', portariaEntradaSaida: false, frequenciaTurma: true, chamadaAppMobile: false, percentualMinimo: 75 },
  { escolaId: '4', portariaEntradaSaida: true, frequenciaTurma: false, chamadaAppMobile: false, percentualMinimo: 75 },
];

// ============ FREQUENCY GENERATOR ============

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function gerarFrequencia(alunoId: string, percEntrada: number, percTurma: number): { entrada: RegistroFrequencia[], turma: RegistroFrequencia[] } {
  const entrada: RegistroFrequencia[] = [];
  const turma: RegistroFrequencia[] = [];
  const meses: [number, number][] = [[2026, 2], [2026, 3]];

  for (const [ano, mes] of meses) {
    const diasNoMes = new Date(ano, mes, 0).getDate();
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const d = new Date(ano, mes - 1, dia);
      if (ano === 2026 && mes === 3 && dia > 9) continue;
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue;

      const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const h1 = hashStr(alunoId + dataStr + 'e') % 100;
      const h2 = hashStr(alunoId + dataStr + 't') % 100;

      entrada.push({ data: dataStr, status: h1 < percEntrada ? 'presente' : h1 < percEntrada + 5 ? 'justificado' : 'ausente' });
      turma.push({ data: dataStr, status: h2 < percTurma ? 'presente' : h2 < percTurma + 5 ? 'justificado' : 'ausente' });
    }
  }
  return { entrada, turma };
}

// ============ HELPER FUNCTIONS ============

export function getAlunosByTurma(turmaId: string): Aluno[] {
  return alunos.filter(a => a.turmaId === turmaId);
}

export function getAlunosByEscola(escolaId: string): Aluno[] {
  return alunos.filter(a => a.escolaId === escolaId);
}

export function getTurmasByEscola(escolaId: string): Turma[] {
  return turmas.filter(t => t.escolaId === escolaId);
}

export function getSeriesByEscola(escolaId: string): Serie[] {
  return series.filter(s => s.escolaId === escolaId);
}

export function getTurmasBySerie(serieId: string): Turma[] {
  return turmas.filter(t => t.serieId === serieId);
}

export function getResponsaveisByAluno(alunoId: string): Responsavel[] {
  const aluno = alunos.find(a => a.id === alunoId);
  if (!aluno) return [];
  return responsaveis.filter(r => aluno.responsavelIds.includes(r.id));
}

export function getProfessoresByTurma(turmaId: string): Professor[] {
  return professores.filter(p => p.turmaIds.includes(turmaId));
}

export function getJustificativasByEscola(escolaId: string): Justificativa[] {
  return justificativas.filter(j => j.escolaId === escolaId);
}

export function getJustificativasByResponsavel(responsavelId: string): Justificativa[] {
  return justificativas.filter(j => j.responsavelId === responsavelId);
}

export function getDependentes(responsavelId: string): Aluno[] {
  const resp = responsaveis.find(r => r.id === responsavelId);
  if (!resp) return [];
  return alunos.filter(a => resp.dependenteIds.includes(a.id));
}

export function getEscolasByProfessor(professorId: string): Escola[] {
  const prof = professores.find(p => p.id === professorId);
  if (!prof) return [];
  return escolas.filter(e => prof.escolaIds.includes(e.id));
}

export function getTurmasByProfessorEscola(professorId: string, escolaId: string): Turma[] {
  const prof = professores.find(p => p.id === professorId);
  if (!prof) return [];
  return turmas.filter(t => prof.turmaIds.includes(t.id) && t.escolaId === escolaId);
}

export const nomesPerfil: Record<PerfilUsuario, string> = {
  responsavel: 'Responsável',
  professor: 'Professor',
  diretor: 'Diretor',
  secretaria: 'Secretaria',
};
