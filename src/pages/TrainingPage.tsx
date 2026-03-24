import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Play, CheckCircle, Award, Lock } from 'lucide-react';
import { mockTrainings } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function TrainingPage() {
  const [trainings, setTrainings] = useState(mockTrainings);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const { toast } = useToast();
  const completed = trainings.filter(t => t.completed).length;

  const questions = [
    { q: 'Which bin should organic waste go in?', options: ['Red', 'Green', 'Blue', 'Yellow'], correct: 1 },
    { q: 'Is plastic recyclable?', options: ['Always', 'Never', 'Most types', 'Only bottles'], correct: 2 },
  ];

  const handleComplete = (id: string) => {
    const score = quizAnswer === questions[0].correct ? 100 : 60;
    setTrainings(prev => prev.map(t => t.id === id ? { ...t, completed: true, score, completedAt: new Date().toISOString() } : t));
    setActiveQuiz(null);
    setQuizAnswer(null);
    toast({ title: `Training completed! Score: ${score}%` });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-display flex items-center gap-2"><GraduationCap className="w-6 h-6 text-primary" /> Training Center</h2>
        <p className="text-muted-foreground">Complete training modules to earn rewards</p>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-bold">{completed}/{trainings.length} completed</span>
        </div>
        <Progress value={(completed / trainings.length) * 100} className="h-3" />
      </div>

      <div className="space-y-4">
        {trainings.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.completed ? 'bg-success/20 text-success' : 'bg-secondary text-primary'}`}>
                {t.completed ? <CheckCircle className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold">{t.title}</h3>
                {t.completed ? (
                  <p className="text-sm text-success flex items-center gap-1"><Award className="w-3 h-3" /> Completed · Score: {t.score}%</p>
                ) : (
                  <p className="text-sm text-muted-foreground">10 min module + quiz</p>
                )}
              </div>
              {!t.completed && (
                <Button className="gradient-primary text-primary-foreground" onClick={() => setActiveQuiz(t.id)}>
                  Start
                </Button>
              )}
            </div>

            {activeQuiz === t.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-border">
                <p className="font-medium text-sm mb-3">{questions[0].q}</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {questions[0].options.map((opt, oi) => (
                    <button key={oi} onClick={() => setQuizAnswer(oi)}
                      className={`px-3 py-2 rounded-lg text-sm border transition-all ${quizAnswer === oi ? 'border-primary bg-secondary text-primary font-medium' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
                <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => handleComplete(t.id)} disabled={quizAnswer === null}>
                  Submit Quiz
                </Button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
