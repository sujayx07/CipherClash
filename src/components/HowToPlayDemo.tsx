'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

// Demo sequence: secret is 4831
const DEMO_SECRET = '4831';
const DEMO_STEPS = [
  { guess: '4271', exact: 2, numbers: 2, label: '2 correct numbers, 2 digits in the right position' },
  { guess: '4851', exact: 3, numbers: 3, label: '3 correct numbers, 3 digits in the right position' },
  { guess: '4831', exact: 4, numbers: 4, label: '4 correct numbers, 4 digits in the right position, BINGO' },
];

export default function HowToPlayDemo() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [digitReveals, setDigitReveals] = useState<boolean[]>([false, false, false, false]);
  const [showResult, setShowResult] = useState(false);
  const [showBreach, setShowBreach] = useState(false);
  const [secretVisible, setSecretVisible] = useState(true);

  const resetDemo = useCallback(() => {
    setCurrentStep(-1);
    setDigitReveals([false, false, false, false]);
    setShowResult(false);
    setShowBreach(false);
    setSecretVisible(true);
  }, []);

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    const runSequence = () => {
      timeouts.push(setTimeout(() => setSecretVisible(false), 1500));

      let delay = 2500;
      DEMO_STEPS.forEach((step, stepIdx) => {
        timeouts.push(setTimeout(() => {
          setCurrentStep(stepIdx);
          setDigitReveals([false, false, false, false]);
          setShowResult(false);
          setShowBreach(false);
        }, delay));

        for (let d = 0; d < 4; d++) {
          timeouts.push(setTimeout(() => {
            setDigitReveals(prev => {
              const next = [...prev];
              next[d] = true;
              return next;
            });
          }, delay + 600 + d * 400));
        }

        timeouts.push(setTimeout(() => setShowResult(true), delay + 2400));

        if (stepIdx === DEMO_STEPS.length - 1) {
          timeouts.push(setTimeout(() => setShowBreach(true), delay + 3200));
          timeouts.push(setTimeout(() => {
            resetDemo();
            runSequence();
          }, delay + 6500));
        }

        delay += 3800;
      });
    };

    runSequence();
    return () => timeouts.forEach(clearTimeout);
  }, [resetDemo]);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Secret display */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span
          className="text-xs uppercase tracking-widest opacity-50"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
        >
          Secret:
        </span>
        <div className="flex gap-2">
          {DEMO_SECRET.split('').map((d, i) => (
            <motion.div
              key={i}
              className="w-10 h-11 flex items-center justify-center rounded text-lg font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                background: secretVisible ? 'rgba(0,245,255,0.08)' : 'rgba(30,30,50,0.3)',
                border: `1px solid ${secretVisible ? 'rgba(0,245,255,0.3)' : 'rgba(74,85,104,0.2)'}`,
                color: secretVisible ? 'var(--accent-cyan)' : 'var(--text-dim)',
              }}
            >
              {secretVisible ? d : '?'}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Guess sequence */}
      <div className="flex flex-col gap-3">
        {DEMO_STEPS.map((step, stepIdx) => {
          const isActive = stepIdx <= currentStep;
          const isCurrent = stepIdx === currentStep;

          return (
            <AnimatePresence key={stepIdx}>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className="glass-panel px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {step.guess.split('').map((digit, dIdx) => {
                          const revealed = isCurrent ? digitReveals[dIdx] : true;

                          return (
                            <motion.div
                              key={dIdx}
                              animate={
                                isCurrent && digitReveals[dIdx]
                                  ? { rotateX: [0, 90, 0] }
                                  : {}
                              }
                              transition={{ duration: 0.4 }}
                              className="w-10 h-10 flex items-center justify-center rounded text-lg font-bold"
                              style={{
                                fontFamily: 'var(--font-display)',
                                background: revealed ? 'rgba(0,245,255,0.08)' : 'rgba(30,30,50,0.3)',
                                border: `1px solid ${revealed ? 'rgba(0,245,255,0.25)' : 'rgba(74,85,104,0.2)'}`,
                                color: revealed ? 'var(--accent-cyan)' : 'var(--text-dim)',
                              }}
                            >
                              {digit}
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Result badge */}
                      <AnimatePresence>
                        {((isCurrent && showResult) || (!isCurrent)) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex gap-1.5"
                          >
                            <span
                              className="px-2 py-1 rounded text-xs font-semibold"
                              style={{
                                fontFamily: 'var(--font-display)',
                                background: 'rgba(0,255,136,0.12)',
                                color: 'var(--accent-green)',
                                border: '1px solid rgba(0,255,136,0.3)',
                              }}
                            >
                              {step.exact} POS
                            </span>
                            <span
                              className="px-2 py-1 rounded text-xs font-semibold"
                              style={{
                                fontFamily: 'var(--font-display)',
                                background: 'rgba(255,215,0,0.12)',
                                color: 'var(--accent-yellow)',
                                border: '1px solid rgba(255,215,0,0.3)',
                              }}
                            >
                              {step.numbers} NUM
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Label */}
                    {isCurrent && showResult && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        className="text-xs mt-2"
                        style={{ fontFamily: 'var(--font-body)', color: 'var(--text-dim)' }}
                      >
                        {step.label}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>

      {/* SYSTEM BREACHED */}
      <AnimatePresence>
        {showBreach && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center py-4 rounded-lg"
            style={{
              background: 'rgba(0,255,136,0.08)',
              border: '1px solid rgba(0,255,136,0.3)',
            }}
          >
            <p
              className="text-xl font-black text-glow-green"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-green)' }}
            >
              SYSTEM BREACHED
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-6">
        {[
          { label: 'POS — correct position', color: 'var(--accent-green)' },
          { label: 'NUM — right digit, wrong place', color: 'var(--accent-yellow)' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: color, opacity: 0.7 }} />
            <span className="text-xs opacity-50" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
