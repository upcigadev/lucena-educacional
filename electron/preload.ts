import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  usuario: {
    login: (credentials: any) => ipcRenderer.invoke('usuario:login', credentials),
  },
  escola: {
    listar: () => ipcRenderer.invoke('escola:listar'),
    criar: (d: any) => ipcRenderer.invoke('escola:criar', d),
  },
  turma: {
    listar: () => ipcRenderer.invoke('turma:listar'),
    criar: (d: any) => ipcRenderer.invoke('turma:criar', d),
  },
  serie: {
    listar: () => ipcRenderer.invoke('serie:listar'),
    criar: (d: any) => ipcRenderer.invoke('serie:criar', d),
  },
  aluno: {
    listar: () => ipcRenderer.invoke('aluno:listar'),
    criar: (d: any) => ipcRenderer.invoke('aluno:criar', d),
  },
  diretor: {
    listar: () => ipcRenderer.invoke('diretor:listar'),
    criar: (d: any) => ipcRenderer.invoke('diretor:criar', d),
  },
  professor: {
    listar: () => ipcRenderer.invoke('professor:listar'),
    criar: (d: any) => ipcRenderer.invoke('professor:criar', d),
  },
  responsavel: {
    listar: () => ipcRenderer.invoke('responsavel:listar'),
    criar: (d: any) => ipcRenderer.invoke('responsavel:criar', d),
  },
  secretaria: {
    listar: () => ipcRenderer.invoke('secretaria:listar'),
    criar: (d: any) => ipcRenderer.invoke('secretaria:criar', d),
  },
  justificativa: {
    listar: () => ipcRenderer.invoke('justificativa:listar'),
  },
  frequencia: {
    listar: () => ipcRenderer.invoke('frequencia:listar'),
    registrarPassagem: (idEquipamento: number) =>
      ipcRenderer.invoke('frequencia:registrarPassagem', idEquipamento),
  },
  hardware: {
    iniciarCadastroBiometrico: (alunoId: string, ipiDFace: string) =>
      ipcRenderer.invoke('hardware:iniciarCadastroBiometrico', alunoId, ipiDFace),
  },
  onNovaFrequencia: (callback: (data: any) => void) => {
    ipcRenderer.on('nova-frequencia-registada', (_event, value) => callback(value));
  },
});
