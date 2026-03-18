import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

// Convert import.meta.url for use in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'), // Vite builds it to mjs by default
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
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

  ipcMain.handle('aluno:criar', async (_, data) => {
    // Expects data to contain necessary fields according to Aluno schema
    return await prisma.aluno.create({
      data
    });
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
}
