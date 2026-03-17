import { CaseField } from '../../../../domain/definition';
import { FlagDetail, FlagsWithFormGroupPath } from './../domain';
import { CaseFlagStatus } from './../enums';
import {
  PVP_FLAG_CODE,
  hasActivePvpFlag,
  hasPvpFlag,
  isActivePvpFlag,
  isPvpFlag,
  prioritisePvpFlags,
  prioritisePvpParties
} from './case-flag-priority.utils';

describe('CaseFlagPriorityUtils', () => {
  const createFlag = (id: string, flagCode: string, status: string = CaseFlagStatus.ACTIVE): FlagDetail => ({
    id,
    name: id,
    dateTimeCreated: new Date(),
    path: [],
    hearingRelevant: false,
    flagCode,
    status
  });

  const createPartyFlags = (id: string, details?: FlagDetail[]): FlagsWithFormGroupPath => ({
    flags: {
      flagsCaseFieldId: id,
      partyName: id,
      details
    },
    pathToFlagsFormGroup: id,
    caseField: { id } as CaseField
  });

  it('should place active PVP flags first within a single party', () => {
    const party = createPartyFlags('PartyA', [
      createFlag('NON_PVP_1', 'FL1'),
      createFlag('PVP_1', PVP_FLAG_CODE),
      createFlag('NON_PVP_2', 'FL2')
    ]);

    const result = prioritisePvpParties([party]);

    expect(result[0].flags.details.map((flag) => flag.id)).toEqual(['PVP_1', 'NON_PVP_1', 'NON_PVP_2']);
  });

  it('should place the only active PVP party before non-PVP parties', () => {
    const result = prioritisePvpParties([
      createPartyFlags('PartyA', [createFlag('A1', 'FL1')]),
      createPartyFlags('PartyB', [createFlag('B1', 'FL2'), createFlag('B2', PVP_FLAG_CODE)]),
      createPartyFlags('PartyC', [createFlag('C1', 'FL3')])
    ]);

    expect(result.map((party) => party.flags.partyName)).toEqual(['PartyB', 'PartyA', 'PartyC']);
    expect(result[0].flags.details.map((flag) => flag.id)).toEqual(['B2', 'B1']);
  });

  it('should keep stable order among multiple active PVP parties and among non-PVP parties', () => {
    const result = prioritisePvpParties([
      createPartyFlags('PartyA', [createFlag('A1', PVP_FLAG_CODE), createFlag('A2', 'FL1')]),
      createPartyFlags('PartyB', [createFlag('B1', 'FL2')]),
      createPartyFlags('PartyC', [createFlag('C1', 'FL3'), createFlag('C2', PVP_FLAG_CODE)]),
      createPartyFlags('PartyD', [createFlag('D1', 'FL4')])
    ]);

    expect(result.map((party) => party.flags.partyName)).toEqual(['PartyA', 'PartyC', 'PartyB', 'PartyD']);
    expect(result[1].flags.details.map((flag) => flag.id)).toEqual(['C2', 'C1']);
  });

  it('should not prioritise inactive PVP flags within a party', () => {
    const party = createPartyFlags('PartyA', [
      createFlag('N1', 'FL1'),
      createFlag('P_INACTIVE', PVP_FLAG_CODE, CaseFlagStatus.INACTIVE),
      createFlag('N2', 'FL2')
    ]);

    const result = prioritisePvpParties([party]);

    expect(result[0].flags.details.map((flag) => flag.id)).toEqual(['N1', 'P_INACTIVE', 'N2']);
  });

  it('should prioritise parties with active PVP over parties with only inactive PVP', () => {
    const result = prioritisePvpParties([
      createPartyFlags('viv frauto', [
        createFlag('V1', PVP_FLAG_CODE, CaseFlagStatus.INACTIVE),
        createFlag('V2', 'FL1', CaseFlagStatus.ACTIVE)
      ]),
      createPartyFlags('kiv resp', [
        createFlag('K1', PVP_FLAG_CODE, CaseFlagStatus.ACTIVE),
        createFlag('K2', PVP_FLAG_CODE, CaseFlagStatus.INACTIVE)
      ])
    ]);

    expect(result.map((party) => party.flags.partyName)).toEqual(['kiv resp', 'viv frauto']);
    expect(result[0].flags.details.map((flag) => flag.id)).toEqual(['K1', 'K2']);
  });

  it('should keep single-party no-flags scenario unchanged', () => {
    const party = createPartyFlags('PartyA', []);
    const result = prioritisePvpParties([party]);

    expect(result.length).toBe(1);
    expect(result[0].flags.partyName).toBe('PartyA');
    expect(result[0].flags.details).toEqual([]);
  });

  it('should keep multi-party no-flags scenarios unchanged', () => {
    const result = prioritisePvpParties([
      createPartyFlags('PartyA', []),
      createPartyFlags('PartyB'),
      createPartyFlags('PartyC', [])
    ]);

    expect(result.map((party) => party.flags.partyName)).toEqual(['PartyA', 'PartyB', 'PartyC']);
    expect(result[0].flags.details).toEqual([]);
    expect(result[1].flags.details).toBeUndefined();
    expect(result[2].flags.details).toEqual([]);
  });

  it('should keep single-party non-PVP flag ordering unchanged', () => {
    const party = createPartyFlags('PartyA', [
      createFlag('A1', 'FL1'),
      createFlag('A2', 'FL2'),
      createFlag('A3', 'FL3')
    ]);

    const result = prioritisePvpParties([party]);

    expect(result[0].flags.details.map((flag) => flag.id)).toEqual(['A1', 'A2', 'A3']);
  });

  it('should keep multi-party non-PVP ordering unchanged', () => {
    const result = prioritisePvpParties([
      createPartyFlags('PartyA', [createFlag('A1', 'FL1'), createFlag('A2', 'FL2')]),
      createPartyFlags('PartyB', [createFlag('B1', 'FL3')]),
      createPartyFlags('PartyC', [createFlag('C1', 'FL4'), createFlag('C2', 'FL5')])
    ]);

    expect(result.map((party) => party.flags.partyName)).toEqual(['PartyA', 'PartyB', 'PartyC']);
    expect(result[0].flags.details.map((flag) => flag.id)).toEqual(['A1', 'A2']);
    expect(result[2].flags.details.map((flag) => flag.id)).toEqual(['C1', 'C2']);
  });

  it('should preserve non-priority order stability when moving active PVP flags to the front', () => {
    const details = [
      createFlag('N1', 'FL1'),
      createFlag('P1', PVP_FLAG_CODE),
      createFlag('N2', 'FL2'),
      createFlag('P2_INACTIVE', PVP_FLAG_CODE, CaseFlagStatus.INACTIVE),
      createFlag('N3', 'FL3')
    ];

    const result = prioritisePvpFlags(details);

    expect(result.map((flag) => flag.id)).toEqual(['P1', 'N1', 'N2', 'P2_INACTIVE', 'N3']);
  });

  it('should treat PF0021 as the only PVP source-of-truth flagCode and active status as the priority condition', () => {
    expect(isPvpFlag(createFlag('P1', PVP_FLAG_CODE))).toBe(true);
    expect(isPvpFlag(createFlag('N1', 'PF0022'))).toBe(false);
    expect(hasPvpFlag(createPartyFlags('PartyA', [createFlag('N1', 'FL1'), createFlag('P1', PVP_FLAG_CODE)]))).toBe(true);
    expect(hasPvpFlag(createPartyFlags('PartyB', [createFlag('N1', 'FL1')]))).toBe(false);
    expect(isActivePvpFlag(createFlag('P1', PVP_FLAG_CODE, CaseFlagStatus.ACTIVE))).toBe(true);
    expect(isActivePvpFlag(createFlag('P2', PVP_FLAG_CODE, CaseFlagStatus.INACTIVE))).toBe(false);
    expect(hasActivePvpFlag(createPartyFlags('PartyA', [createFlag('P1', PVP_FLAG_CODE, CaseFlagStatus.ACTIVE)]))).toBe(true);
    expect(hasActivePvpFlag(createPartyFlags('PartyB', [createFlag('P2', PVP_FLAG_CODE, CaseFlagStatus.INACTIVE)]))).toBe(false);
  });
});
