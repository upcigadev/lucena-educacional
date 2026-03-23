import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== "production";
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL ?? "http://localhost:8080";
let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 900,
    title: "Lucena Educacional",
    webPreferences: {
      // IMPORTANT: webSecurity: false is intentionally set for the demo so that
      // calls to http:// endpoints on the local network (e.g. iDFace at 192.168.x.x)
      // are NOT blocked by Chromium's mixed-content / CORS policy.
      // Production hardening: replace with a dedicated IPC handler or local proxy.
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });
  if (isDev) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "bottom" });
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  win.on("closed", () => {
    win = null;
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
//# sourceMappingURL=main.js.map
