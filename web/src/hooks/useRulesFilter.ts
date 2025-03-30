import { useState, useEffect, useMemo } from 'react';
import { Rule } from '../lib/RuleApiService';

export function useRulesFilter(rules: {
  community: Rule[];
  roleplay: Rule[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [filteredRules, setFilteredRules] = useState<{
    community: Rule[];
    roleplay: Rule[];
  }>({
    community: [],
    roleplay: [],
  });

  useEffect(() => {
    if (!rules) return;

    const filterRulesByQuery = (rulesArray: Rule[], query: string) => {
      if (query.trim() === '') return rulesArray;

      const lowerCaseQuery = query.toLowerCase();
      return rulesArray.filter(
        (rule) => 
          rule.title.toLowerCase().includes(lowerCaseQuery) || 
          (rule.content && rule.content.toLowerCase().includes(lowerCaseQuery)) ||
          rule.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery)) ||
          rule.badge.toLowerCase().includes(lowerCaseQuery)
      );
    };

    setFilteredRules({
      community: filterRulesByQuery(rules.community, searchQuery),
      roleplay: filterRulesByQuery(rules.roleplay, searchQuery),
    });
  }, [searchQuery, rules]);

  const displayRules = useMemo(() => {
    const displayCommunityRules = activeTab === 'all' || activeTab === 'community';
    const displayRoleplayRules = activeTab === 'all' || activeTab === 'roleplay';

    return {
      displayCommunityRules,
      displayRoleplayRules,
      community: displayCommunityRules ? filteredRules.community : [],
      roleplay: displayRoleplayRules ? filteredRules.roleplay : []
    };
  }, [activeTab, filteredRules]);

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredRules,
    displayRules
  };
}