import {
  StaffCacheRoleCategory,
  StaffUserRoleCategory,
  StaffUserSearchConfiguration
} from './staff-user.model';

const STAFF_CACHE_ROLE_CATEGORIES = new Set<StaffCacheRoleCategory>([
  'ADMIN',
  'CTSC',
  'LEGAL_OPERATIONS'
]);

const SUPPORTED_ROLE_CATEGORIES = new Set<StaffUserRoleCategory>([
  ...STAFF_CACHE_ROLE_CATEGORIES,
  'JUDICIAL',
]);

// Aliases allow the definition to use the shorter, hyphenated form within #ARGUMENT(...)
const ROLE_CATEGORY_ALIASES: { [alias: string]: StaffUserRoleCategory } = {
  LEGAL_OPS: 'LEGAL_OPERATIONS'
};

const ARGUMENT_REGEX = /#ARGUMENT\(([^)]*)\)/;
const CATEGORY_PREFIX = 'CATEGORY-';
const REGION_PREFIX = 'REGION-';

export type StaffUserSearchConfigurationResult =
  | { valid: true; configuration: StaffUserSearchConfiguration }
  | { valid: false; error: 'INVALID_ROLE_CATEGORIES' };

/**
 * Parses the `display_context_parameter` of a StaffUser field to determine the filters to apply
 * when searching reference data.
 *
 * Expected format: `#ARGUMENT(CATEGORY-LEGAL-OPS,CATEGORY-ADMIN,REGION-1235)`
 */
export function parseStaffUserSearchConfiguration(displayContextParameter?: string): StaffUserSearchConfigurationResult {
  if (!displayContextParameter) {
    return invalidConfiguration();
  }

  const match = ARGUMENT_REGEX.exec(displayContextParameter);

  if (!match || !match[1]) {
    return invalidConfiguration();
  }

  const tokens = match[1].split(',').map(token => token.trim());
  if (tokens.some(token => !token)) {
    return invalidConfiguration();
  }

  const roleCategories: StaffUserRoleCategory[] = [];

  for (const token of tokens) {
    if (token.startsWith(CATEGORY_PREFIX)) {
      const category = normaliseRoleCategory(token.substring(CATEGORY_PREFIX.length));
      if (!isStaffUserRoleCategory(category)) {
        return invalidConfiguration();
      }
      if (!roleCategories.includes(category)) {
        roleCategories.push(category);
      }
    } else if (token.startsWith(REGION_PREFIX)) {
      // Region filtering is not supported in this version; REGION- tokens are silently ignored
    } else {
      return invalidConfiguration();
    }
  }

  if (!roleCategories.length) {
    return invalidConfiguration();
  }

  return {
    valid: true,
    configuration: {
      roleCategories,
      staffRoleCategories: roleCategories.filter(isStaffCacheRoleCategory),
      includesJudicial: roleCategories.includes('JUDICIAL')
    }
  };
}

function normaliseRoleCategory(category: string): string {
  const normalised = category.replaceAll('-', '_');
  return ROLE_CATEGORY_ALIASES[normalised] || normalised;
}

function isStaffUserRoleCategory(category: string): category is StaffUserRoleCategory {
  return SUPPORTED_ROLE_CATEGORIES.has(category as StaffUserRoleCategory);
}

function isStaffCacheRoleCategory(category: StaffUserRoleCategory): category is StaffCacheRoleCategory {
  return STAFF_CACHE_ROLE_CATEGORIES.has(category as StaffCacheRoleCategory);
}

function invalidConfiguration(): StaffUserSearchConfigurationResult {
  return { valid: false, error: 'INVALID_ROLE_CATEGORIES' };
}
