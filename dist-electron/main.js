import { app as o, BrowserWindow as n } from "electron";
import i from "path";
import { fileURLToPath as l } from "url";
const r = i.dirname(l(import.meta.url)), a = process.env.NODE_ENV !== "production", s = process.env.VITE_DEV_SERVER_URL ?? "http://localhost:8080";
let e = null;
function t() {
  e = new n({
    width: 1280,
    height: 900,
    title: "Lucena Educacional",
    webPreferences: {
      // IMPORTANT: webSecurity: false is intentionally set for the demo so that
      // calls to http:// endpoints on the local network (e.g. iDFace at 192.168.x.x)
      // are NOT blocked by Chromium's mixed-content / CORS policy.
      // Production hardening: replace with a dedicated IPC handler or local proxy.
      nodeIntegration: !0,
      contextIsolation: !1,
      webSecurity: !1
    }
  }), a ? (e.loadURL(s), e.webContents.openDevTools({ mode: "bottom" })) : e.loadFile(i.join(r, "../dist/index.html")), e.on("closed", () => {
    e = null;
  });
}
o.whenReady().then(() => {
  t(), o.on("activate", () => {
    n.getAllWindows().length === 0 && t();
  });
});
o.on("window-all-closed", () => {
  process.platform !== "darwin" && o.quit();
});
