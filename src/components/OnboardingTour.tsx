import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface OnboardingTourProps {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour = ({ run, onComplete, onSkip }: OnboardingTourProps) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Welcome to TAT Test Platform! 🎉</h2>
          <p className="text-muted-foreground">
            Take a quick tour to discover how to use the platform effectively. 
            This will only take about 30 seconds.
          </p>
          <p className="text-sm text-muted-foreground">
            You can skip this tour anytime or replay it later from Settings.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="credit-balance"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Your Credit Balance</h3>
          <p className="text-sm text-muted-foreground">
            This shows your current credits. Each test requires 100 credits to analyze. 
            You can purchase more credits anytime by clicking the button next to your balance.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="pending-tab"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Available Tests</h3>
          <p className="text-sm text-muted-foreground">
            Find all available tests here. Each test shows an image prompt - write a creative story 
            based on what you see. You'll have 5 minutes to complete each story.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="start-test-button"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Start Your First Test</h3>
          <p className="text-sm text-muted-foreground">
            Click here to begin a test. Remember: be creative, include details about characters, 
            their thoughts, feelings, and what might happen next.
          </p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '[data-tour="results-tab"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">View Your Results</h3>
          <p className="text-sm text-muted-foreground">
            After completing tests, check here for detailed psychological analysis reports 
            including insights on your personality traits and behavioral patterns.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">You're All Set! 🎊</h2>
          <p className="text-muted-foreground">
            You're ready to start your psychological assessment journey. 
            Click "Finish" to begin, or you can replay this tour anytime from Settings → Help.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      if (status === STATUS.SKIPPED) {
        onSkip();
      } else {
        onComplete();
      }
      setStepIndex(0);
    } else if (type === 'step:after') {
      setStepIndex(index + (action === 'prev' ? -1 : 1));
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--background))',
          arrowColor: 'hsl(var(--background))',
          overlayColor: 'hsla(0, 0%, 0%, 0.5)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: 'var(--radius)',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: '0.5rem',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
        spotlight: {
          borderRadius: 'var(--radius)',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};
