import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger?: boolean;
  occasionType?: 'birthday' | 'wedding' | 'anniversary';
}

export const fireConfetti = (occasionType: 'birthday' | 'wedding' | 'anniversary' = 'birthday') => {
  const duration = 4 * 1000;
  const animationEnd = Date.now() + duration;

  let colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#6366f1', '#3b82f6', '#10b981', '#f59e0b'];
  if (occasionType === 'wedding') {
    colors = ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#e11d48', '#ffffff'];
  } else if (occasionType === 'anniversary') {
    colors = ['#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#c084fc', '#e879f9'];
  }

  // Initial big burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors
  });

  // Secondary continuous fireworks cannon
  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Left cannon
    confetti({
      particleCount,
      startVelocity: 30,
      spread: 60,
      origin: { x: 0.1, y: 0.7 },
      colors
    });

    // Right cannon
    confetti({
      particleCount,
      startVelocity: 30,
      spread: 60,
      origin: { x: 0.9, y: 0.7 },
      colors
    });
  }, 250);
};

export const ConfettiEffect: React.FC<ConfettiProps> = ({ trigger = false, occasionType = 'birthday' }) => {
  useEffect(() => {
    if (trigger) {
      fireConfetti(occasionType as 'birthday' | 'wedding' | 'anniversary');
    }
  }, [trigger, occasionType]);

  return null;
};

export default ConfettiEffect;
