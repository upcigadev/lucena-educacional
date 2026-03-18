-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Escola" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "inep" TEXT,
    "endereco" TEXT,
    "telefone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Diretor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "escolaId" TEXT NOT NULL,
    CONSTRAINT "Diretor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Diretor_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Professor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "Professor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Responsavel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    CONSTRAINT "Responsavel_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Serie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "escolaId" TEXT NOT NULL,
    "horarioInicio" TEXT NOT NULL,
    "toleranciaMinutos" INTEGER NOT NULL,
    "limiteEntrada" TEXT NOT NULL,
    "aplicarTodasTurmas" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Serie_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Turma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "escolaId" TEXT NOT NULL,
    "serieId" TEXT NOT NULL,
    "sobrescreverRegras" BOOLEAN NOT NULL DEFAULT false,
    "horarioInicio" TEXT,
    "toleranciaMinutos" INTEGER,
    "limiteEntrada" TEXT,
    CONSTRAINT "Turma_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Turma_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TurmaProfessor" (
    "professorId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,

    PRIMARY KEY ("professorId", "turmaId"),
    CONSTRAINT "TurmaProfessor_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TurmaProfessor_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeCompleto" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "dataNascimento" DATETIME NOT NULL,
    "biometriaCadastrada" BOOLEAN NOT NULL DEFAULT false,
    "idEquipamento" INTEGER,
    "fotoPerfilBase64" TEXT,
    "responsavelId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Aluno_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Responsavel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Frequencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alunoId" TEXT NOT NULL,
    "dataHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    CONSTRAINT "Frequencia_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Justificativa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "frequenciaId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "anexoUrl" TEXT,
    "status" TEXT NOT NULL,
    "dataEnvio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analisadaPor" TEXT,
    CONSTRAINT "Justificativa_frequenciaId_fkey" FOREIGN KEY ("frequenciaId") REFERENCES "Frequencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Escola_inep_key" ON "Escola"("inep");

-- CreateIndex
CREATE UNIQUE INDEX "Diretor_usuarioId_key" ON "Diretor"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Diretor_escolaId_key" ON "Diretor"("escolaId");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_usuarioId_key" ON "Professor"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Responsavel_usuarioId_key" ON "Responsavel"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_matricula_key" ON "Aluno"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_idEquipamento_key" ON "Aluno"("idEquipamento");

-- CreateIndex
CREATE UNIQUE INDEX "Justificativa_frequenciaId_key" ON "Justificativa"("frequenciaId");
