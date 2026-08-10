import {
  StaffCacheRoleCategory,
  StaffUserRoleCategory,
  StaffUserSearchConfiguration
} from './staff-user.model';

const STAFF_CACHE_ROLE_CATEGORIES: StaffCacheRoleCategory[] = [
  'ADMIN',
  'CTSC',
  'LEGAL_OPERATIONS'
];

const SUPPORTED_ROLE_CATEGORIES: StaffUserRoleCategory[] = [
  ...STAFF_CACHE_ROLE_CATEGORIES,
  'JUDICIAL'
];

export type StaffUserSearchConfigurationResult =
  | { valid: true; configuration: StaffUserSearchConfiguration }
  | { valid: false; error: 'INVALID_ROLE_CATEGORIES' };

export function parseStaffUserSearchConfiguration(roleCategories?: string): StaffUserSearchConfigurationResult {
  if (!roleCategories) {
    return invalidConfiguration();
  }

  const categories = roleCategories.split(',').map(category => category.trim());
  if (categories.some(category => !category)) {
    return invalidConfiguration();
  }

  const uniqueCategories = categories.filter((category, index) => categories.indexOf(category) === index);
  if (!uniqueCategories.every(isStaffUserRoleCategory)) {
    return invalidConfiguration();
  }

  const selectedCategories = uniqueCategories as StaffUserRoleCategory[];
  return {
    valid: true,
    configuration: {
      roleCategories: selectedCategories,
      staffRoleCategories: selectedCategories.filter(isStaffCacheRoleCategory),
      includesJudicial: selectedCategories.includes('JUDICIAL')
    }
  };
}

function isStaffUserRoleCategory(category: string): category is StaffUserRoleCategory {
  return SUPPORTED_ROLE_CATEGORIES.includes(category as StaffUserRoleCategory);
}

function isStaffCacheRoleCategory(category: StaffUserRoleCategory): category is StaffCacheRoleCategory {
  return STAFF_CACHE_ROLE_CATEGORIES.includes(category as StaffCacheRoleCategory);
}

function invalidConfiguration(): StaffUserSearchConfigurationResult {
  return { valid: false, error: 'INVALID_ROLE_CATEGORIES' };
}
