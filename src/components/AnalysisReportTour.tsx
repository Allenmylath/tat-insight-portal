import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface AnalysisReportTourProps {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
  isMobile: boolean;
}

export const AnalysisReportTour = ({ run, onComplete, onSkip, isMobile }: AnalysisReportTourProps) => {
  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Welcome to Your Detailed Report! 🎓</h3>
          <p>Welcome to your comprehensive psychological analysis!</p>
          <p>Let's take a quick tour to understand each section of your report.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="score-hero"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold">Score Hero Section</h3>
          <p>This is your overall assessment score with key highlights.</p>
          <p>Higher scores indicate stronger psychological patterns detected.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: isMobile ? '[data-tour="nav-cards"]' : '[data-tour="tabs"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold">Tab Navigation</h3>
          <p>Your analysis is organized into 5 specialized sections.</p>
          <p>Each section provides unique insights into your personality.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="traditional-tab"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold">Traditional Analysis</h3>
          <p>Shows personality traits, emotions, and clinical insights.</p>
          <p>Based on classical psychological assessment methods.</p>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right',
    },
    {
      target: '[data-tour="murray-tab"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold">Murray TAT</h3>
          <p>Reveals your psychological needs, environmental pressures, and inner states.</p>
          <p>Named after Henry Murray's Thematic Apperception Test methodology.</p>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right',
    },
    {
      target: '[data-tour="military-tab"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold">Military Assessment</h3>
          <p>Evaluates leadership, stress tolerance, and officer qualities.</p>
          <p>Specifically designed for defense force selection processes.</p>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right',
    },
    {
      target: '[data-tour="recommendation-tab"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold">Recommendations</h3>
          <p>Get personalized selection recommendations, strengths, and development areas.</p>
          <p>Includes role suitability analysis and action plans.</p>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right',
    },
    {
      target: '[data-tour="ssb-tab"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold">SSB Interview Prep 🌟</h3>
          <p>Pro feature: Get personalized SSB interview questions based on your analysis!</p>
          <p>Practice with AI-generated questions tailored to your psychological profile.</p>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right',
    },
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h3 className="text-lg font-bold">You're Ready! 🎊</h3>
          <p>You're now ready to explore your analysis!</p>
          <p>Take your time reviewing each section. You can always come back later.</p>
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