import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader2, RefreshCw, Recycle, X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Types ─────────────────────────────────────────────────────────────────────
interface WasteResult {
  category: 'GREEN_BIN' | 'BLUE_BIN' | 'RED_BIN';
  confidence: number;
  label: string;
  emoji: string;
  reason: string;
  color: string;
  bgColor: string;
}

const BIN_META = {
  GREEN_BIN: {
    label: 'Green Bin',
    emoji: '🟢',
    reason: 'Organic / Biodegradable waste — food scraps, leaves, biological material',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20 border-green-500/30',
  },
  BLUE_BIN: {
    label: 'Blue Bin',
    emoji: '🔵',
    reason: 'Recyclable material — plastic, glass, metal, paper, cardboard',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20 border-blue-500/30',
  },
  RED_BIN: {
    label: 'Red Bin',
    emoji: '🔴',
    reason: 'Hazardous waste — batteries, chemicals, non-recyclable trash',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20 border-red-500/30',
  },
};

// ── Model URL (update after training) ────────────────────────────────────────
const MODEL_URL = '/tfjs_model/model.json';
const CLASSES: Array<'GREEN_BIN' | 'BLUE_BIN' | 'RED_BIN'> = ['GREEN_BIN', 'BLUE_BIN', 'RED_BIN'];
const IMG_SIZE = 300;

export default function AIDetectPage() {
  const [mode, setMode] = useState<'idle' | 'upload' | 'camera'>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [result, setResult] = useState<WasteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── Load TF.js + Model on mount ──────────────────────────────────────────
  useEffect(() => {
    const loadModel = async () => {
      setModelLoading(true);
      try {
        // Dynamically import TF.js to avoid build issues
        const tf = await import('@tensorflow/tfjs');
        await import('@tensorflow/tfjs-backend-webgl');
        await tf.ready();

        // Try to load trained model; fall back to simulation if missing
        try {
          const model = await tf.loadLayersModel(MODEL_URL);
          modelRef.current = { tf, model, real: true };
          setModelReady(true);
          console.log('✅ Real TF.js model loaded!');
        } catch {
          // Trained model not found yet — use simulation mode
          modelRef.current = { tf, model: null, real: false };
          setModelReady(true);
          console.warn('⚠️ Model not found, running in demo mode.');
        }
      } catch (e) {
        // TF.js not installed — pure simulation fallback
        modelRef.current = { tf: null, model: null, real: false };
        setModelReady(true);
      }
      setModelLoading(false);
    };
    loadModel();
    return () => stopCamera();
  }, []);

  // ── Run Inference ─────────────────────────────────────────────────────────
  const runInference = useCallback(async (imageSrc: string): Promise<WasteResult> => {
    const { tf, model, real } = modelRef.current || {};

    if (real && model && tf) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = async () => {
          const tensor = tf.browser.fromPixels(img)
            .resizeBilinear([IMG_SIZE, IMG_SIZE])
            .expandDims(0)
            .cast('float32');

          const preds = await model.predict(tensor) as any;
          const values: number[] = await preds.data();
          tensor.dispose(); preds.dispose();

          const maxIdx = values.indexOf(Math.max(...values));
          const category = CLASSES[maxIdx];
          const confidence = Math.round(values[maxIdx] * 100);
          resolve({ category, confidence, ...BIN_META[category] });
        };
        img.src = imageSrc;
      });
    }

    // Demo mode simulation
    await new Promise(r => setTimeout(r, 1800));
    const demo = ['GREEN_BIN', 'BLUE_BIN', 'RED_BIN'][Math.floor(Math.random() * 3)] as 'GREEN_BIN' | 'BLUE_BIN' | 'RED_BIN';
    return { category: demo, confidence: Math.floor(Math.random() * 15) + 82, ...BIN_META[demo] };
  }, []);

  const analyze = async (src: string) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await runInference(src);
      setResult(res);
    } catch {
      setError('Analysis failed. Please try again with a clearer image.');
    }
    setLoading(false);
    setFeedbackSent(false);
  };

  const handleFeedback = async (correctLabel: string) => {
    if (!result) return;
    try {
      await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: correctLabel,
          originalLabel: result.category,
          confidence: result.confidence,
          imageData: preview,
          userId: JSON.parse(localStorage.getItem('user') || '{}')._id
        }),
      });
      setFeedbackSent(true);
    } catch (e) {
      console.error('Feedback failed', e);
    }
  };

  // ── File Upload ───────────────────────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setPreview(src);
      setResult(null);
      setMode('upload');
      analyze(src);
    };
    reader.readAsDataURL(file);
  };

  // ── Camera ────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
      setMode('camera');
      setResult(null);
      setPreview(null);
    } catch {
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const src = canvas.toDataURL('image/jpeg', 0.9);
    setPreview(src);
    stopCamera();
    setMode('upload');
    analyze(src);
  };

  const reset = () => {
    stopCamera();
    setPreview(null);
    setResult(null);
    setError(null);
    setMode('idle');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-10">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display flex items-center gap-2">
          <Recycle className="w-6 h-6 text-primary" />
          AI Waste Classifier
        </h2>
        <p className="text-muted-foreground mt-1">
          Upload a photo or use your camera to classify waste
          {modelLoading && <span className="ml-2 text-yellow-400 text-xs">⏳ Loading AI model...</span>}
          {modelReady && !modelLoading && modelRef.current?.real &&
            <span className="ml-2 text-green-400 text-xs">✅ AI Model Ready</span>}
          {modelReady && !modelLoading && !modelRef.current?.real &&
            <span className="ml-2 text-yellow-400 text-xs">⚡ Demo Mode (train model to enable AI)</span>}
        </p>
      </div>

      {/* Action Buttons */}
      {mode === 'idle' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4">
          <button onClick={() => fileRef.current?.click()}
            className="h-40 rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary/60 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group">
            <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium">Upload Image</span>
            <span className="text-xs text-muted-foreground">JPG, PNG up to 10MB</span>
          </button>

          <button onClick={startCamera}
            className="h-40 rounded-2xl border-2 border-dashed border-border bg-card hover:border-blue-500/60 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-3 group">
            <Camera className="w-10 h-10 text-muted-foreground group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-medium">Use Camera</span>
            <span className="text-xs text-muted-foreground">Point & classify live</span>
          </button>
        </motion.div>
      )}

      {/* Live Camera View */}
      <AnimatePresence>
        {mode === 'camera' && cameraOn && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="bg-card rounded-2xl overflow-hidden shadow-card">
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full rounded-t-2xl" style={{ maxHeight: '360px', objectFit: 'cover' }} />
              <div className="absolute inset-0 border-4 border-transparent pointer-events-none"
                style={{ boxShadow: 'inset 0 0 0 2px rgba(99,102,241,0.5)', borderRadius: '1rem' }} />
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Video className="w-3 h-3" /> LIVE
              </div>
            </div>
            <div className="p-4 flex gap-3">
              <Button onClick={capturePhoto} className="gradient-primary text-primary-foreground flex-1 text-base py-6">
                <Camera className="w-5 h-5 mr-2" /> Capture & Analyze
              </Button>
              <Button variant="outline" onClick={reset}><X className="w-4 h-4" /></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {/* Image Preview */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-card rounded-2xl overflow-hidden shadow-card">
            <img src={preview} alt="Waste preview" className="w-full object-cover" style={{ maxHeight: '300px' }} />
            <div className="p-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={reset}>
                <RefreshCw className="w-4 h-4 mr-2" /> Try Another
              </Button>
              {!loading && !result && (
                <Button className="gradient-primary text-primary-foreground flex-1" onClick={() => analyze(preview!)}>
                  <Recycle className="w-4 h-4 mr-2" /> Re-Analyze
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyzing Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-card rounded-2xl p-8 shadow-card flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">AI is analyzing your waste...</p>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full gradient-primary rounded-full"
                animate={{ width: ['0%', '90%'] }}
                transition={{ duration: 1.5, ease: 'easeInOut' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-destructive/10 border border-destructive/30 text-destructive rounded-2xl p-4 text-sm">
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Card */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-2xl p-6 border shadow-card space-y-4 ${result.bgColor}`}>
            
            {/* Bin Label */}
            <div className="flex items-center gap-3">
              <span className="text-5xl">{result.emoji}</span>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Dispose in</p>
                <h3 className={`text-2xl font-bold font-display ${result.color}`}>{result.label}</h3>
              </div>
            </div>

            {/* Confidence Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">AI Confidence</span>
                <span className={`font-bold ${result.color}`}>{result.confidence}%</span>
              </div>
              <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ backgroundColor: result.category === 'GREEN_BIN' ? '#22c55e' : result.category === 'BLUE_BIN' ? '#3b82f6' : '#ef4444' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }} />
              </div>
            </div>

            {/* Reason */}
            <p className="text-sm text-muted-foreground bg-black/10 rounded-xl p-3">
              💡 {result.reason}
            </p>

            <Button variant="outline" className="w-full" onClick={reset}>
              <RefreshCw className="w-4 h-4 mr-2" /> Classify Another Item
            </Button>

            {/* Feedback Section */}
            {!feedbackSent ? (
              <div className="pt-4 border-t border-black/10 mt-4 text-center">
                <p className="text-xs text-muted-foreground mb-3">Was this classification correct?</p>
                <div className="flex gap-2 justify-center">
                   <Button size="sm" variant="ghost" onClick={() => handleFeedback(result.category)} className="bg-white/10 hover:bg-white/20 text-xs">
                     Yes, it's correct!
                   </Button>
                   <div className="flex gap-1 overflow-x-auto">
                     {CLASSES.filter(c => c !== result.category).map(c => (
                       <Button key={c} size="sm" variant="ghost" onClick={() => handleFeedback(c)} className="bg-black/10 hover:bg-black/20 text-[10px] px-2">
                         No, it's {BIN_META[c].label}
                       </Button>
                     ))}
                   </div>
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="pt-4 border-t border-black/10 mt-4 text-center text-xs font-medium text-primary">
                ✨ Thank you! This data will be used to enhance the model automatically.
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
