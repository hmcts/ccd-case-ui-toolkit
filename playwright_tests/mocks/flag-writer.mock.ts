import { FlagType } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/domain/case-flag';

export const flagWriterSelection = {
  flagDetailDisplay: { visibility: 'External', partyName: 'Applicant', flagDetail: {
    name: 'Step-free access', status: 'Requested', flagComment: 'Needs step-free access', flagUpdateComment: '',
    hearingRelevant: 'Yes', path: [], dateTimeCreated: '2025-01-01T00:00:00.000'
  } }
};
export const flagWriterTypes = [Object.assign(new FlagType(), {
  name: 'Party', childFlags: [Object.assign(new FlagType(), {
    name: 'Step-free access', flagCode: 'RA0001', Path: ['Party', 'Step-free access'],
    childFlags: [], flagComment: false, defaultStatus: 'Requested', isParent: false, externallyAvailable: true
  }), Object.assign(new FlagType(), {
    name: 'Other', flagCode: 'OT0001', Path: ['Party', 'Other'], childFlags: [], flagComment: true,
    defaultStatus: 'Requested', isParent: false, externallyAvailable: false
  })]
})];
