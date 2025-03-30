import { useState, useEffect } from 'react';
import { Rule } from '../lib/RuleApiService';

type ContentState = Record<string, { content: string | null; loading: boolean }>;

export function useRuleContent(activeRuleId: string | null, rules: Rule[]) {
  const [ruleContents, setRuleContents] = useState<ContentState>({});

  useEffect(() => {
    if (activeRuleId && !ruleContents[activeRuleId]) {
      setRuleContents((prev) => ({
        ...prev,
        [activeRuleId]: { content: null, loading: true },
      }));

      const loadContent = async () => {
        try {
          const activeRule = rules.find((r) => r.id === activeRuleId);
          const content = activeRule?.content || 'Content could not be loaded.';

            setRuleContents((prev) => ({
              ...prev,
              [activeRuleId as string]: { content, loading: false },
            }));
        } catch (error) {
          console.error('Error loading rule content:', error);
          setRuleContents((prev) => ({
            ...prev,
            [activeRuleId as string]: { content: null, loading: false },
          }));
        }
      };

      loadContent();
    }
  }, [activeRuleId, ruleContents, rules]);

  const getContent = (ruleId: string) => {
    return ruleContents[ruleId]?.content || null;
  };
  
  const isLoading = (ruleId: string) => {
    return ruleContents[ruleId]?.loading || false;
  };

  return {
    ruleContents,
    getContent,
    isLoading
  };
}