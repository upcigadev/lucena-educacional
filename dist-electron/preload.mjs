"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  usuario: {
    login: (credentials) => electron.ipcRenderer.invoke("usuario:login", credentials)
  },
  escola: {
    listar: () => electron.ipcRenderer.invoke("escola:listar"),
    criar: (d) => electron.ipcRenderer.invoke("escola:criar", d)
  },
  turma: {
    listar: () => electron.ipcRenderer.invoke("turma:listar"),
    criar: (d) => electron.ipcRenderer.invoke("turma:criar", d)
  },
  serie: {
    listar: () => electron.ipcRenderer.invoke("serie:listar"),
    criar: (d) => electron.ipcRenderer.invoke("serie:criar", d)
  },
  aluno: {
    listar: () => electron.ipcRenderer.invoke("aluno:listar"),
    criar: (d) => electron.ipcRenderer.invoke("aluno:criar", d)
  },
  diretor: {
    listar: () => electron.ipcRenderer.invoke("diretor:listar"),
    criar: (d) => electron.ipcRenderer.invoke("diretor:criar", d)
  },
  professor: {
    listar: () => electron.ipcRenderer.invoke("professor:listar"),
    criar: (d) => electron.ipcRenderer.invoke("professor:criar", d)
  },
  responsavel: {
    listar: () => electron.ipcRenderer.invoke("responsavel:listar"),
    criar: (d) => electron.ipcRenderer.invoke("responsavel:criar", d)
  },
  secretaria: {
    listar: () => electron.ipcRenderer.invoke("secretaria:listar"),
    criar: (d) => electron.ipcRenderer.invoke("secretaria:criar", d)
  },
  justificativa: {
    listar: () => electron.ipcRenderer.invoke("justificativa:listar")
  },
  frequencia: {
    listar: () => electron.ipcRenderer.invoke("frequencia:listar"),
    registrarPassagem: (idEquipamento) => electron.ipcRenderer.invoke("frequencia:registrarPassagem", idEquipamento)
  },
  hardware: {
    iniciarCadastroBiometrico: (alunoId, ipiDFace) => electron.ipcRenderer.invoke("hardware:iniciarCadastroBiometrico", alunoId, ipiDFace)
  },
  onNovaFrequencia: (callback) => {
    electron.ipcRenderer.on("nova-frequencia-registada", (_event, value) => callback(value));
  }
});
