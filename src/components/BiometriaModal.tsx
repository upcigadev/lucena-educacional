import { useRef, useState, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Camera, Upload, ShieldCheck, Loader2, CheckCircle2, X, Wifi, Fingerprint, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cadastrarUsuarioNoAparelho, iniciarCapturaFacial, uuidToNumericId } from '@/services/controlIdService';

interface BiometriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunoId: string;
  nomeAluno: string;
  /** Callback para atualizar o estado do componente pai */
  onSuccess?: () => void;
}

type CaptureMode = 'webcam' | 'upload';

export function BiometriaModal({
  open,
  onOpenChange,
  alunoId,
  nomeAluno,
  onSuccess,
}: BiometriaModalProps) {
  // LGPD consent
  const [lgpdAceito, setLgpdAceito] = useState(false);

  // Capture mode
  const [mode, setMode] = useState<CaptureMode>('webcam');

  // iDFace IP (persisted in localStorage)
  const LS_KEY = 'idface_ip';
  const [ipAparelho, setIpAparelho] = useState<string>(
    () => localStorage.getItem(LS_KEY) ?? '192.168.0.50',
  );
  const [idFaceLoading, setIdFaceLoading] = useState(false);

  const handleIpChange = (v: string) => {
    setIpAparelho(v);
    localStorage.setItem(LS_KEY, v);
  };

  // Webcam state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamAtivo, setStreamAtivo] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Upload state
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [previewUpload, setPreviewUpload] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  // Save state
  const [salvando, setSalvando] = useState(false);

  // ── Webcam helpers ──────────────────────────────────────────

  const iniciarCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;
      setStreamAtivo(true);
      setPhotoDataUrl(null);
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      toast.error('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
  }, []);

  const pararCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreamAtivo(false);
  }, []);

  const capturarFoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    canvasRef.current.width = videoRef.current.videoWidth || 640;
    canvasRef.current.height = videoRef.current.videoHeight || 480;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
    setPhotoDataUrl(dataUrl);
    pararCamera();
  }, [pararCamera]);

  const retirarFoto = useCallback(() => {
    setPhotoDataUrl(null);
    iniciarCamera();
  }, [iniciarCamera]);

  // ── Upload helpers ──────────────────────────────────────────

  const handleArquivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem (JPG, PNG, etc.).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5 MB.');
      return;
    }
    setArquivoSelecionado(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUpload(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Convert data URL to Blob for upload
  function dataUrlToBlob(dataUrl: string): Blob {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new Blob([array], { type: mime });
  }

  // ── Which image is ready ────────────────────────────────────

  const imagemPronta = mode === 'webcam' ? photoDataUrl !== null : arquivoSelecionado !== null;
  const podeSalvar = lgpdAceito && imagemPronta;

  // ── Save ────────────────────────────────────────────────────

  const handleSalvar = async () => {
    if (!podeSalvar) return;
    setSalvando(true);

    try {
      let blob: Blob;
      let fileName: string;

      if (mode === 'webcam' && photoDataUrl) {
        blob = dataUrlToBlob(photoDataUrl);
        fileName = `${alunoId}/webcam_${Date.now()}.jpg`;
      } else if (mode === 'upload' && arquivoSelecionado) {
        blob = arquivoSelecionado;
        const ext = arquivoSelecionado.name.split('.').pop() ?? 'jpg';
        fileName = `${alunoId}/upload_${Date.now()}.${ext}`;
      } else {
        toast.error('Nenhuma imagem selecionada.');
        setSalvando(false);
        return;
      }

      // Upload to Supabase Storage (bucket: biometrias)
      const { error: uploadError } = await supabase.storage
        .from('biometrias')
        .upload(fileName, blob, { upsert: true, contentType: blob.type });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast.error(`Erro ao salvar imagem: ${uploadError.message}`);
        setSalvando(false);
        return;
      }

      // Mark biometria as registered in DB
      const { error: updateError } = await supabase
        .from('alunos')
        .update({ biometria_cadastrada: true })
        .eq('id', alunoId);

      if (updateError) {
        console.error('Erro ao atualizar aluno:', updateError);
        toast.error(`Erro ao registrar biometria: ${updateError.message}`);
        setSalvando(false);
        return;
      }

      toast.success('Biometria cadastrada com sucesso!');
      onSuccess?.();
      handleFechar();
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast.error('Erro inesperado ao salvar biometria.');
    } finally {
      setSalvando(false);
    }
  };

  // ── iDFace device activation ────────────────────────────────

  const handleAtivarIdFace = useCallback(async () => {
    if (!ipAparelho.trim()) {
      toast.error('Informe o IP do aparelho iDFace.');
      return;
    }
    setIdFaceLoading(true);
    const idNumerico = uuidToNumericId(alunoId);
    try {
      await cadastrarUsuarioNoAparelho(ipAparelho.trim(), idNumerico, nomeAluno);
      await iniciarCapturaFacial(ipAparelho.trim(), idNumerico);

      // Save idface_user_id and set biometria_cadastrada
      const { error } = await supabase
        .from('alunos')
        .update({ idface_user_id: idNumerico, biometria_cadastrada: true })
        .eq('id', alunoId);

      if (error) {
        toast.error(`Supabase: ${error.message}`);
      } else {
        toast.success(
          'Comando enviado! Posicione o aluno em frente ao iDFace.',
          { duration: 6000 },
        );
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('[iDFace]', err);
      toast.error(`Erro ao comunicar com o iDFace: ${err?.message ?? err}`);
    } finally {
      setIdFaceLoading(false);
    }
  }, [ipAparelho, alunoId, nomeAluno, onSuccess]);

  // ── Close / cleanup ─────────────────────────────────────────

  const handleFechar = () => {
    pararCamera();
    setPhotoDataUrl(null);
    setArquivoSelecionado(null);
    setPreviewUpload(null);
    setLgpdAceito(false);
    setMode('webcam');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleFechar(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Gerenciar Biometria
          </DialogTitle>
          <DialogDescription>
            Cadastro facial de <strong>{nomeAluno}</strong> para o sistema iDFace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
        {/* iDFace Network Section */}
          <div className="rounded-lg border p-4 space-y-3 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Aparelho iDFace (Rede Local)
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="idface-ip" className="text-xs text-muted-foreground mb-1 block">
                  IP do Aparelho na Rede Local
                </Label>
                <Input
                  id="idface-ip"
                  placeholder="192.168.0.50"
                  value={ipAparelho}
                  onChange={(e) => handleIpChange(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
              onClick={handleAtivarIdFace}
              disabled={idFaceLoading || !ipAparelho.trim()}
            >
              {idFaceLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enviando comando...</>
              ) : (
                <><Fingerprint className="w-4 h-4" /> Ativar Câmera do iDFace</>
              )}
            </Button>
            <p className="text-xs text-muted-foreground flex items-start gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
              Requer Electron instalado localmente. O IP é salvo automaticamente para a próxima vez.
            </p>
          </div>

          {/* Capture mode tabs */}
          <Tabs value={mode} onValueChange={(v) => {
            pararCamera();
            setPhotoDataUrl(null);
            setArquivoSelecionado(null);
            setPreviewUpload(null);
            setMode(v as CaptureMode);
          }}>
            <TabsList className="w-full">
              <TabsTrigger value="webcam" className="flex-1 flex items-center gap-1">
                <Camera className="w-4 h-4" /> Câmera
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex-1 flex items-center gap-1">
                <Upload className="w-4 h-4" /> Upload de Foto
              </TabsTrigger>
            </TabsList>

            {/* WEBCAM */}
            <TabsContent value="webcam" className="mt-4 space-y-3">
              <div className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                {photoDataUrl ? (
                  <img
                    src={photoDataUrl}
                    alt="Foto capturada"
                    className="w-full h-full object-cover"
                  />
                ) : streamAtivo ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Camera className="w-10 h-10 opacity-40" />
                    <p className="text-sm">Clique em "Ativar Câmera" para começar</p>
                  </div>
                )}
                {photoDataUrl && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>
              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-2">
                {!streamAtivo && !photoDataUrl && (
                  <Button type="button" variant="outline" className="flex-1" onClick={iniciarCamera}>
                    <Camera className="w-4 h-4" /> Ativar Câmera
                  </Button>
                )}
                {streamAtivo && (
                  <Button type="button" className="flex-1" onClick={capturarFoto}>
                    <Camera className="w-4 h-4" /> Capturar Foto
                  </Button>
                )}
                {photoDataUrl && (
                  <Button type="button" variant="outline" className="flex-1" onClick={retirarFoto}>
                    <X className="w-4 h-4" /> Refazer
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* UPLOAD */}
            <TabsContent value="upload" className="mt-4 space-y-3">
              <div
                className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => inputFileRef.current?.click()}
              >
                {previewUpload ? (
                  <>
                    <img src={previewUpload} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Upload className="w-10 h-10 opacity-40" />
                    <p className="text-sm text-center">
                      Clique para selecionar uma foto<br />
                      <span className="text-xs">(JPG, PNG, WebP – máx. 5 MB)</span>
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={inputFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleArquivoChange}
              />
              {previewUpload && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setArquivoSelecionado(null);
                    setPreviewUpload(null);
                    if (inputFileRef.current) inputFileRef.current.value = '';
                  }}
                >
                  <X className="w-4 h-4" /> Remover foto
                </Button>
              )}
            </TabsContent>
          </Tabs>

          {/* LGPD Consent */}
          <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Consentimento LGPD Obrigatório
              </p>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="lgpd-consent"
                  checked={lgpdAceito}
                  onCheckedChange={(v) => setLgpdAceito(v === true)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="lgpd-consent"
                  className="text-sm text-amber-700 dark:text-amber-400 cursor-pointer leading-relaxed"
                >
                  Confirmo que <strong>possuo o termo de consentimento assinado</strong> pelos
                  responsáveis legais para coleta e tratamento de dados biométricos deste aluno,
                  conforme a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSalvar}
            disabled={!podeSalvar || salvando}
            className="min-w-[120px]"
          >
            {salvando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Salvar Biometria
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
