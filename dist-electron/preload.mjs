"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  usuario: {
    login: (credentials) => electron.ipcRenderer.invoke("usuario:login", credentials)
  },
  escola: {
    listar: () => electron.ipcRenderer.invoke("escola:listar")
  },
  turma: {
    listar: () => electron.ipcRenderer.invoke("turma:listar")
  },
  serie: {
    listar: () => electron.ipcRenderer.invoke("serie:listar")
  },
  aluno: {
    criar: (data) => electron.ipcRenderer.invoke("aluno:criar", data)
  },
  frequencia: {
    registrarPassagem: (idEquipamento) => electron.ipcRenderer.invoke("frequencia:registrarPassagem", idEquipamento)
  }
});
