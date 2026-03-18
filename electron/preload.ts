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
    criar: (data: any) => ipcRenderer.invoke('aluno:criar', data)
  },
  frequencia: {
    registrarPassagem: (idEquipamento: number) => ipcRenderer.invoke('frequencia:registrarPassagem', idEquipamento)
  }
});
