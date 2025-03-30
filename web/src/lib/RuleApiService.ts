import { supabase } from './supabase';
import cacheService from './CacheService';

export interface Rule {
  id: string;
  badge: string;
  title: string;
  content: string;
  category: 'community' | 'roleplay';
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string;
  version: number;
  order_index: number;
}

export interface RuleChange {
  id: string;
  rule_id: string;
  previous_content: string;
  new_content: string;
  previous_title: string;
  new_title: string;
  previous_tags: string[];
  new_tags: string[];
  previous_pinned: boolean;
  new_pinned: boolean;
  changed_at: string;
  changed_by: string;
  version: number;
  change_notes: string;
}

export interface RulesResponse {
  community: Rule[];
  roleplay: Rule[];
  pinned: Rule[];
  recentlyUpdated: Rule[];
}

const RULES_CACHE_KEY = 'rules_data';
const RULE_HISTORY_CACHE_PREFIX = 'rule_history_';

export const RuleApiService = {
  invalidateAllCaches(ruleId?: string) {
    cacheService.invalidate(RULES_CACHE_KEY);
    
    const categories = ['community', 'roleplay'];
    categories.forEach(cat => {
      for (let i = 1; i <= 5; i++) {
        cacheService.invalidate(`rules_${cat}_page_${i}_limit_20`);
      }
    });
    
    if (ruleId) {
      cacheService.invalidate(`rule_content_${ruleId}`);
      cacheService.invalidate(`${RULE_HISTORY_CACHE_PREFIX}${ruleId}`);
    }
  },

  async getRulesList(): Promise<RulesResponse> {
    const cachedRules = cacheService.get<RulesResponse>(RULES_CACHE_KEY);
    if (cachedRules) {
      return cachedRules;
    }

    const { data, error } = await supabase
      .from('rules')
      .select('id, badge, title, content, category, tags, is_pinned, created_at, updated_at, updated_by, version, order_index')
      .order('order_index');

    if (error) throw error;

    if (data) {
      const communityRules = data.filter((rule) => rule.category === 'community');
      const roleplayRules = data.filter((rule) => rule.category === 'roleplay');
      const pinnedRules = data.filter((rule) => rule.is_pinned);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 14);

      const recentlyUpdated = data
        .filter((rule) => new Date(rule.updated_at) > thirtyDaysAgo)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10);

      const response: RulesResponse = {
        community: communityRules,
        roleplay: roleplayRules,
        pinned: pinnedRules,
        recentlyUpdated,
      };

      cacheService.set(RULES_CACHE_KEY, response, { expiryInMinutes: 15 });

      return response;
    }

    return {
      community: [],
      roleplay: [],
      pinned: [],
      recentlyUpdated: [],
    };
  },

  async getRuleContent(ruleId: string): Promise<string> {
    const cacheKey = `rule_content_${ruleId}`;
    const cachedContent = cacheService.get<string>(cacheKey);
    
    if (cachedContent !== null) {
      return cachedContent;
    }

    const { data, error } = await supabase
      .from('rules')
      .select('content')
      .eq('id', ruleId)
      .single();

    if (error) throw error;

    if (data) {
      cacheService.set(cacheKey, data.content, { expiryInMinutes: 60 });
      return data.content;
    }

    return '';
  },

  async getRulesByCategory(category: 'community' | 'roleplay', page: number, limit: number = 20): Promise<Rule[]> {
    const cacheKey = `rules_${category}_page_${page}_limit_${limit}`;
    const cachedRules = cacheService.get<Rule[]>(cacheKey);
    
    if (cachedRules) {
      return cachedRules;
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error } = await supabase
      .from('rules')
      .select('*')
      .eq('category', category)
      .order('order_index')
      .range(start, end);

    if (error) throw error;

    if (data) {
      cacheService.set(cacheKey, data, { expiryInMinutes: 15 });
      return data;
    }

    return [];
  },

  async updateRule(ruleId: string, updates: any, notes: string = ''): Promise<void> {
    const { data: currentRule, error: fetchError } = await supabase
      .from('rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (fetchError) throw fetchError;

    const newVersion = currentRule.version + 1;

    const { error: changeError } = await supabase.from('rule_changes').insert({
      rule_id: ruleId,
      previous_content: currentRule.content,
      new_content: updates.content || currentRule.content,
      previous_title: currentRule.title,
      new_title: updates.title || currentRule.title,
      previous_tags: currentRule.tags,
      new_tags: updates.tags || currentRule.tags,
      previous_pinned: currentRule.is_pinned,
      new_pinned: updates.is_pinned !== undefined ? updates.is_pinned : currentRule.is_pinned,
      changed_by: updates.updated_by || 'Unknown',
      version: newVersion,
      change_notes: notes,
    });

    if (changeError) throw changeError;

    const { error } = await supabase
      .from('rules')
      .update({
        ...updates,
        version: newVersion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ruleId);

    if (error) throw error;

    this.invalidateAllCaches(ruleId); 
  },

  async createRule(rule: Omit<Rule, 'id' | 'created_at' | 'updated_at' | 'version' | 'updated_by' | 'order_index'>): Promise<void> {
    const { data: maxOrderData, error: maxOrderError } = await supabase
      .from('rules')
      .select('order_index')
      .eq('category', rule.category)
      .order('order_index', { ascending: false })
      .limit(1);

    if (maxOrderError) throw maxOrderError;

    const nextOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].order_index + 1 : 0;

    const { error } = await supabase.from('rules').insert({
      ...rule,
      order_index: nextOrder,
      version: 1,
    });

    if (error) throw error;

    this.invalidateAllCaches() 
  },

  async getRuleHistory(ruleId: string): Promise<RuleChange[]> {
    const cacheKey = `${RULE_HISTORY_CACHE_PREFIX}${ruleId}`;
    const cachedHistory = cacheService.get<RuleChange[]>(cacheKey);
    
    if (cachedHistory) {
      return cachedHistory;
    }

    const { data, error } = await supabase
      .from('rule_changes')
      .select('*')
      .eq('rule_id', ruleId)
      .order('version', { ascending: false });

    if (error) throw error;

    if (data) {
      cacheService.set(cacheKey, data, { expiryInMinutes: 30 });
      return data;
    }

    return [];
  },

  async deleteRule(ruleId: string): Promise<void> {
    const { error } = await supabase
      .from('rules')
      .delete()
      .eq('id', ruleId);

    if (error) throw error;

    this.invalidateAllCaches(ruleId); 
  },
};

export default RuleApiService;