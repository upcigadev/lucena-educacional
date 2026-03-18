import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

// Convert import.meta.url for use in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();


let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'), // Vite builds it to mjs by default
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  setupIpcHandlers();
  setupDeviceServer();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupIpcHandlers() {
  ipcMain.handle('usuario:login', async (_, credentials) => {
    const { email, senha } = credentials;
    // Basic verification without bcrypt right now as requested schema has plain text password mock
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });
    if (usuario && usuario.senhaHash === senha) {
      return { success: true, usuario };
    }
    return { success: false, error: 'Credenciais inválidas' };
  });

  ipcMain.handle('escola:listar', async () => {
    return await prisma.escola.findMany({
      include: {
        series: true,
        turmas: true,
      }
    });
  });

  ipcMain.handle('escola:criar', async (_, data) => {
    try {
      return await prisma.escola.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002') throw new Error('INEP já cadastrado para outra escola.');
      throw new Error(error.message);
    }
  });

  ipcMain.handle('turma:listar', async () => {
    return await prisma.turma.findMany({
      include: {
        escola: true,
        serie: true,
      }
    });
  });

  ipcMain.handle('serie:listar', async () => {
    return await prisma.serie.findMany({
      include: {
        escola: true,
      }
    });
  });

  ipcMain.handle('serie:criar', async (_, data) => {
    try {
      const { nome, escolaId, horarioInicio, toleranciaMinutos, limiteEntrada, aplicarTodasTurmas } = data;
      return await prisma.serie.create({
        data: {
          nome,
          escolaId,
          horarioInicio,
          toleranciaMinutos: Number(toleranciaMinutos),
          limiteEntrada,
          aplicarTodasTurmas: aplicarTodasTurmas ?? true,
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  });

  ipcMain.handle('turma:criar', async (_, data) => {
    try {
      const { nome, serieId, escolaId, sobrescreverRegras, horarioInicio, toleranciaMinutos, limiteEntrada } = data;
      return await prisma.turma.create({
        data: {
          nome,
          serieId,
          escolaId,
          sobrescreverRegras: sobrescreverRegras ?? false,
          horarioInicio: horarioInicio || null,
          toleranciaMinutos: toleranciaMinutos != null ? Number(toleranciaMinutos) : null,
          limiteEntrada: limiteEntrada || null,
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  });

  ipcMain.handle('aluno:criar', async (_, data) => {
    return await prisma.aluno.create({ data });
  });

  ipcMain.handle('aluno:listar', async () => {
    return await prisma.aluno.findMany({ include: { turma: { include: { escola: true, serie: true } }, responsavel: true, frequencias: { include: { justificativa: true } } } });
  });

  ipcMain.handle('professor:listar', async () => {
    return await prisma.professor.findMany({ include: { usuario: true, turmas: { include: { turma: true } } } });
  });

  ipcMain.handle('justificativa:listar', async () => {
    return await prisma.justificativa.findMany({ include: { frequencia: { include: { aluno: true } } } });
  });

  ipcMain.handle('responsavel:listar', async () => {
    return await prisma.responsavel.findMany({ include: { usuario: true, alunos: true } });
  });

  ipcMain.handle('diretor:listar', async () => {
    return await prisma.diretor.findMany({ include: { usuario: true, escola: true } });
  });

  // ── DIRETOR: criar ──────────────────────────────────────────────────────────
  ipcMain.handle('diretor:criar', async (_, data) => {
    try {
      const { nome, email, cpf, escolaId } = data;
      const senhaHash = cpf.replace(/\D/g, '').slice(0, 6);

      return await prisma.$transaction(async (tx) => {
        const usuario = await tx.usuario.create({
          data: { nome, email, cpf, senhaHash, papel: 'DIRETOR', primeiroAcesso: true },
        });
        const diretor = await tx.diretor.create({
          data: { usuarioId: usuario.id, escolaId },
        });
        return { success: true, usuario, diretor };
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return { success: false, error: 'CPF ou Email já cadastrado no sistema.' };
      }
      return { success: false, error: error.message };
    }
  });

  // ── PROFESSOR: criar ─────────────────────────────────────────────────────────
  ipcMain.handle('professor:criar', async (_, data) => {
    try {
      const { nome, email, cpf } = data;
      const senhaHash = cpf.replace(/\D/g, '').slice(0, 6);

      return await prisma.$transaction(async (tx) => {
        const usuario = await tx.usuario.create({
          data: { nome, email, cpf, senhaHash, papel: 'PROFESSOR', primeiroAcesso: true },
        });
        const professor = await tx.professor.create({
          data: { usuarioId: usuario.id },
        });
        return { success: true, usuario, professor };
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return { success: false, error: 'CPF ou Email já cadastrado no sistema.' };
      }
      return { success: false, error: error.message };
    }
  });

  // ── RESPONSAVEL: criar ───────────────────────────────────────────────────────
  ipcMain.handle('responsavel:criar', async (_, data) => {
    try {
      const { nome, email, cpf, telefone } = data;
      const senhaHash = cpf.replace(/\D/g, '').slice(0, 6);

      return await prisma.$transaction(async (tx) => {
        const usuario = await tx.usuario.create({
          data: { nome, email, cpf, senhaHash, papel: 'RESPONSAVEL', primeiroAcesso: true },
        });
        const responsavel = await tx.responsavel.create({
          data: { usuarioId: usuario.id, telefone },
        });
        return { success: true, usuario, responsavel };
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return { success: false, error: 'CPF ou Email já cadastrado no sistema.' };
      }
      return { success: false, error: error.message };
    }
  });

  // ── SECRETARIA: listar e criar ───────────────────────────────────────────────
  ipcMain.handle('secretaria:listar', async () => {
    return await prisma.usuario.findMany({ where: { papel: 'SECRETARIA' } });
  });

  ipcMain.handle('secretaria:criar', async (_, data) => {
    try {
      const { nome, email, cpf } = data;
      const senhaHash = cpf.replace(/\D/g, '').slice(0, 6);

      const usuario = await prisma.usuario.create({
        data: { nome, email, cpf, senhaHash, papel: 'SECRETARIA', primeiroAcesso: true },
      });
      return { success: true, usuario };
    } catch (error: any) {
      if (error.code === 'P2002') {
        return { success: false, error: 'CPF ou Email já cadastrado no sistema.' };
      }
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('frequencia:listar', async () => {
    return await prisma.frequencia.findMany({ include: { aluno: true, justificativa: true } });
  });

  ipcMain.handle('frequencia:registrarPassagem', async (_, idEquipamento) => {
    try {
      const aluno = await prisma.aluno.findUnique({
        where: { idEquipamento },
        include: {
          turma: {
            include: { serie: true }
          }
        }
      });

      if (!aluno) {
        return { success: false, error: 'Aluno não encontrado para este equipamento.' };
      }

      const turma = aluno.turma;
      const serie = turma.serie;

      // Determinar as regras
      const aplicarTurma = turma.sobrescreverRegras;
      const horarioInicioStr = aplicarTurma && turma.horarioInicio ? turma.horarioInicio : serie.horarioInicio;
      const toleranciaMinutos = aplicarTurma && turma.toleranciaMinutos != null ? turma.toleranciaMinutos : serie.toleranciaMinutos;
      const limiteEntradaStr = aplicarTurma && turma.limiteEntrada ? turma.limiteEntrada : serie.limiteEntrada;

      // Calcular o tempo
      const agora = new Date();
      const horaAtual = agora.getHours();
      const minAtual = agora.getMinutes();
      const tempoAtualTotal = horaAtual * 60 + minAtual;

      const [horaInc, minInc] = horarioInicioStr.split(':').map(Number);
      const tempoInicioTotal = horaInc * 60 + minInc;

      const [horaLim, minLim] = limiteEntradaStr.split(':').map(Number);
      const tempoLimiteTotal = horaLim * 60 + minLim;

      let status = 'PRESENTE';

      if (tempoAtualTotal > tempoLimiteTotal) {
        status = 'BLOQUEADO';
      } else if (tempoAtualTotal > tempoInicioTotal + toleranciaMinutos) {
        status = 'ATRASADO';
      }

      const frequencia = await prisma.frequencia.create({
        data: {
          alunoId: aluno.id,
          status,
          metodo: 'FACIAL',
        }
      });

      return { success: true, frequencia, status };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hardware:iniciarCadastroBiometrico', async (_, alunoId: string, ipiDFace: string) => {
    try {
      const aluno = await prisma.aluno.findUnique({ where: { id: alunoId } });
      if (!aluno || !aluno.idEquipamento) return { success: false, error: "Conferir se o aluno possui um ID Equipamento associado" };
      
      const idStr = String(aluno.idEquipamento);
      
      await fetch(`http://${ipiDFace}/add_users.fcgi?session=simulacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: [{ id: idStr, name: aluno.nomeCompleto }] })
      });

      await fetch(`http://${ipiDFace}/remote_enroll.fcgi?session=simulacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: idStr, type: "face", save: true })
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
}

function setupDeviceServer() {
  const server = express();
  server.use(express.json());

  server.post('/api/notifications', async (req, res) => {
    try {
      const body = req.body;
      const idEquipamento = body.user_id ? Number(body.user_id) : null;
      if (!idEquipamento) return res.status(400).json({ error: 'Missing user_id' });

      const aluno = await prisma.aluno.findUnique({
        where: { idEquipamento },
        include: { turma: { include: { serie: true } } }
      });

      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });

      const turma = aluno.turma;
      const serie = turma.serie;
      const aplicarTurma = turma.sobrescreverRegras;
      const horarioInicioStr = aplicarTurma && turma.horarioInicio ? turma.horarioInicio : serie.horarioInicio;
      const toleranciaMinutos = aplicarTurma && turma.toleranciaMinutos != null ? turma.toleranciaMinutos : serie.toleranciaMinutos;
      const limiteEntradaStr = aplicarTurma && turma.limiteEntrada ? turma.limiteEntrada : serie.limiteEntrada;

      const agora = new Date();
      const tempoAtualTotal = agora.getHours() * 60 + agora.getMinutes();
      const [horaInc, minInc] = horarioInicioStr.split(':').map(Number);
      const [horaLim, minLim] = limiteEntradaStr.split(':').map(Number);
      
      let status = 'PRESENTE';
      if (tempoAtualTotal > (horaLim * 60 + minLim)) {
        status = 'BLOQUEADO';
      } else if (tempoAtualTotal > (horaInc * 60 + minInc) + toleranciaMinutos) {
        status = 'ATRASADO';
      }

      const frequencia = await prisma.frequencia.create({
        data: { alunoId: aluno.id, status, metodo: 'FACIAL' }
      });

      if (mainWindow) {
        mainWindow.webContents.send('nova-frequencia-registada', {
          sucesso: true, frequencia, status, aluno: { nome: aluno.nomeCompleto }
        });
      }
      return res.status(200).json({ success: true, frequencia });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  });

  server.listen(3000, () => {
    console.log('DeviceService rodando na porta 3000 para webhooks iDFace');
  });
}
