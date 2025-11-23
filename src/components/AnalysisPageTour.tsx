import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface AnalysisPageTourProps {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const AnalysisPageTour = ({ run, onComplete, onSkip }: AnalysisPageTourProps) => {
  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Welcome to Analysis Results! 🎉</h3>
          <p>Congratulations on completing your first TAT test!</p>
          <p>Let's take a quick 30-second tour to understand your psychological analysis results.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="test-card"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold">Test Cards Overview</h3>
          <p>Each card shows one completed test with your confidence score.</p>
          <p>The score indicates how well your story matched psychological patterns.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="view-analysis-button"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold">View Analysis Button</h3>
          <p>Click here to see your detailed psychological analysis.</p>
          <p>You'll get personality traits, Murray needs, and military assessments.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="confidence-score"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold">Confidence Score Explained</h3>
          <p>Higher scores (70%+) indicate strong psychological patterns detected.</p>
          <p>Lower scores may need more detailed stories in future tests.</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="gamification-panel"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold">Gamification Panel</h3>
          <p>Track your progress and earn badges as you complete more tests.</p>
          <p>Build your psychological profile over time.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">You're Ready! 🎊</h3>
          <p>You're now ready to explore your analysis!</p>
          <p>Click 'View Analysis' on any test to see detailed insights.</p>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      if (action === 'skip') {
        onSkip();
      } else {
        onComplete();
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--background))',
          textColor: 'hsl(var(--foreground))',
          zIndex: 10000,
        },
        tooltip: {
          fontSize: 14,
          borderRadius: 8,
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          borderRadius: 8,
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
      locale={{
        last: 'Finish',
        skip: 'Skip Tour',
      }}
    />
  );
};