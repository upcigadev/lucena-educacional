import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  usuario: {
    login: (credentials: any) => ipcRenderer.invoke('usuario:login', credentials)
  },
  escola: {
    listar: () => ipcRenderer.invoke('escola:listar')
  },
  turma: {
    listar: () => ipcRenderer.invoke('turma:listar')
  },
  serie: {
    listar: () => ipcRenderer.invoke('serie:listar')
  },
  aluno: {
    criar: (data: any) => ipcRenderer.invoke('aluno:criar', data),
    listar: () => ipcRenderer.invoke('aluno:listar')
  },
  professor: {
    listar: () => ipcRenderer.invoke('professor:listar')
  },
  justificativa: {
    listar: () => ipcRenderer.invoke('justificativa:listar')
  },
  responsavel: {
    listar: () => ipcRenderer.invoke('responsavel:listar')
  },
  diretor: {
    listar: () => ipcRenderer.invoke('diretor:listar')
  },
  frequencia: {
    registrarPassagem: (idEquipamento: number) => ipcRenderer.invoke('frequencia:registrarPassagem', idEquipamento),
    listar: () => ipcRenderer.invoke('frequencia:listar')
  },
  hardware: {
    iniciarCadastroBiometrico: (alunoId: string, ipiDFace: string) => ipcRenderer.invoke('hardware:iniciarCadastroBiometrico', alunoId, ipiDFace)
  },
  onNovaFrequencia: (callback: (data: any) => void) => {
    ipcRenderer.on('nova-frequencia-registada', (_event, value) => callback(value));
  }
});
