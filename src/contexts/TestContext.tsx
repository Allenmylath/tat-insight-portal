import { createContext, useContext, useState, ReactNode } from "react";

interface TestContextType {
  activeTest: {
    id: string;
    title: string;
    description?: string;
    image_url: string;
    prompt_text: string;
  } | null;
  setActiveTest: (test: TestContextType['activeTest']) => void;
  isTestActive: boolean;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider = ({ children }: { children: ReactNode }) => {
  const [activeTest, setActiveTest] = useState<TestContextType['activeTest']>(null);

  return (
    <TestContext.Provider value={{
      activeTest,
      setActiveTest,
      isTestActive: activeTest !== null
    }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTestContext = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTestContext must be used within a TestProvider');
  }
  return context;
};