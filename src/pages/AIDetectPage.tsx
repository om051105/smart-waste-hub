import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader2, CheckCircle, XCircle, Recycle } from 'lucide-react';
import { simulateAI, AIResult } from '@/lib/mockData';
import { Button } from '@/components/ui/button';

const categoryColors: Record<string, string> = {
  organic: 'bg-success/20 text-success',
  plastic: 'bg-warning/20 text-warning',
  metal: 'bg-info/20 text-info',
  glass: 'bg-accent/20 text-accent-foreground',
  hazardous: 'bg-destructive/20 text-destructive',
};

export default function AIDetectPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setPreview(reader.result as string); setResult(null); };
    reader.readAsDataURL(file);
  };

  const analyze = () => {
    setLoading(true);
    setTimeout(() => {
      setResult(simulateAI());
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-display flex items-center gap-2"><Camera className="w-6 h-6 text-primary" /> AI Waste Detection</h2>
        <p className="text-muted-foreground">Upload an image to classify waste type</p>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-card">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        
        {!preview ? (
          <button onClick={() => fileRef.current?.click()}
            className="w-full h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors">
            <Upload className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload waste image</p>
            <p className="text-xs text-muted-foreground">JPG, PNG up to 10MB</p>
          </button>
        ) : (
          <div className="space-y-4">
            <img src={preview} alt="Waste" className="w-full h-64 object-cover rounded-xl" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setPreview(null); setResult(null); }}>Change Image</Button>
              <Button className="gradient-primary text-primary-foreground flex-1" onClick={analyze} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing...</> : <><Recycle className="w-4 h-4 mr-2" /> Analyze Waste</>}
              </Button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-semibold">Analysis Result</h3>
            
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-xl text-sm font-bold uppercase ${categoryColors[result.category] || 'bg-muted'}`}>
                {result.category}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>Confidence</span>
                  <span className="font-bold">{result.confidence}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${result.confidence}%` }} />
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-xl ${result.isCorrectlySegregated ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
              {result.isCorrectlySegregated ? (
                <><CheckCircle className="w-6 h-6 text-success" /><div><p className="font-medium text-success">Correctly Segregated!</p><p className="text-xs text-muted-foreground">+10 compliance points earned</p></div></>
              ) : (
                <><XCircle className="w-6 h-6 text-destructive" /><div><p className="font-medium text-destructive">Incorrect Segregation</p><p className="text-xs text-muted-foreground">Please sort this waste properly</p></div></>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
