import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { HelpCircle, CheckCircle2, XCircle, Award, Sparkles, RefreshCw } from 'lucide-react';
import { QuizQuestion } from '../types';

interface MiniQuizProps {
  questions?: QuizQuestion[] | null;
  recipientName: string;
}

export const MiniQuiz: React.FC<MiniQuizProps> = ({ questions, recipientName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const qList: QuizQuestion[] = questions && questions.length > 0 ? questions : [
    {
      id: 'q1',
      question: `What is ${recipientName}'s absolute favorite comfort food?`,
      options: ['Biryani with extra Aloo', 'Cheesy Pepperoni Pizza', 'Hot Chocolate Brownie', 'Street style Pani Puri'],
      correctIndex: 0,
      explanation: 'Biryani always wins her heart no matter what time of day!'
    },
    {
      id: 'q2',
      question: 'Where was our most unforgettable vacation together?',
      options: ['Manali Snow Trip', 'Goa Beach Sunrise', 'Kerala Backwaters', 'Ooty Lake Ride'],
      correctIndex: 1,
      explanation: 'Goa beach sunrise with morning tea was magical!'
    },
    {
      id: 'q3',
      question: 'What is her funny habit when she gets super excited?',
      options: ['Claps like a baby', 'Starts speaking 100mph', 'Does a mini happy dance', 'All of the above!'],
      correctIndex: 3,
      explanation: 'She definitely does all three together every single time!'
    }
  ];

  const currentQ = qList[currentIndex];

  const playPopSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    playPopSound();

    if (index === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentIndex + 1 < qList.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowExplanation(false);
    setQuizCompleted(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 sm:p-8 rounded-3xl border border-white/10 glow-pink space-y-5"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-widest font-mono">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Mini Memory Quiz 🧠 ("How Well Do You Know Us?")</span>
        </div>
        {!quizCompleted && (
          <span className="text-xs font-mono text-pink-300 bg-pink-500/20 px-2.5 py-1 rounded-full border border-pink-500/30">
            Q {currentIndex + 1} / {qList.length}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!quizCompleted ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg sm:text-xl font-serif font-semibold text-white leading-snug">
              {currentQ.question}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;
                let btnStyle = 'bg-black/40 border-white/10 hover:border-pink-400/50 text-white';

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-lg';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                  } else {
                    btnStyle = 'bg-black/20 border-white/5 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-2xl border text-left font-medium text-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {selectedOption !== null && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {selectedOption !== null && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-violet-900/30 border border-violet-500/30 rounded-2xl text-xs sm:text-sm text-violet-200 flex items-start gap-2.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block mb-0.5">Secret Note:</strong>
                  {currentQ.explanation || 'That was a great memory!'}
                </div>
              </motion.div>
            )}

            {selectedOption !== null && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-semibold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                  {currentIndex + 1 < qList.length ? 'Next Question →' : 'See Score Card 🎉'}
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/40">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">Quiz Completed! 🏆</h3>
            <p className="text-sm text-white/80">
              You scored <span className="text-amber-300 font-bold font-mono text-lg">{score} / {qList.length}</span>! You know {recipientName} inside out!
            </p>
            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
