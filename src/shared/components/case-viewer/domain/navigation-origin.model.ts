export type NavigationOriginEnum =
    'DRAFT_DELETED'
    | 'ERROR_DELETING_DRAFT'
    | 'DRAFT_RESUMED'
    | 'EVENT_TRIGGERED';

export const DRAFT_DELETED: NavigationOriginEnum = 'DRAFT_DELETED';
export const ERROR_DELETING_DRAFT: NavigationOriginEnum = 'ERROR_DELETING_DRAFT';
export const DRAFT_RESUMED: NavigationOriginEnum = 'DRAFT_RESUMED';
export const EVENT_TRIGGERED: NavigationOriginEnum = 'EVENT_TRIGGERED';
