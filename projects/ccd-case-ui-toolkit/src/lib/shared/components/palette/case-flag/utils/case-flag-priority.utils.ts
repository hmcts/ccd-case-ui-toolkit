import moment from 'moment';
import { FlagDetail, FlagsWithFormGroupPath } from '../domain';
import { CaseFlagStatus } from '../enums';

export const PVP_FLAG_CODE = 'PF0021';
export const PVP_DISPLAY_TEXT = 'POTENTIALLY VIOLENT PERSON';

export function isPvpFlag(flagDetail: FlagDetail): boolean {
  return flagDetail?.flagCode === PVP_FLAG_CODE;
}

export function hasPvpFlag(flagsWithFormGroupPath: FlagsWithFormGroupPath): boolean {
  return !!flagsWithFormGroupPath?.flags?.details?.some(isPvpFlag);
}

export function isActivePvpFlag(flagDetail: FlagDetail): boolean {
  return isPvpFlag(flagDetail) && flagDetail?.status === CaseFlagStatus.ACTIVE;
}

export function hasActivePvpFlag(flagsWithFormGroupPath: FlagsWithFormGroupPath): boolean {
  return !!flagsWithFormGroupPath?.flags?.details?.some(isActivePvpFlag);
}

function getFlagCreationTime(flagDetail: FlagDetail): number {
  const createdDateValue = flagDetail?.dateTimeCreated;

  const createdMoment = createdDateValue instanceof Date
    ? moment(createdDateValue)
    : moment(createdDateValue, moment.ISO_8601, true);

  return createdMoment.valueOf();
}

function compareByCreationDateDesc(flagA: FlagDetail, flagB: FlagDetail): number {
  return getFlagCreationTime(flagB) - getFlagCreationTime(flagA);
}

export function prioritisePvpFlags(flagDetails: FlagDetail[] = []): FlagDetail[] {
  const activePvpFlags: FlagDetail[] = [];
  const remainingFlags: FlagDetail[] = [];

  flagDetails.forEach((flagDetail) => {
    if (isActivePvpFlag(flagDetail)) {
      activePvpFlags.push(flagDetail);
    } else {
      remainingFlags.push(flagDetail);
    }
  });

  remainingFlags.sort(compareByCreationDateDesc);

  return [...activePvpFlags, ...remainingFlags];
}

export function prioritisePvpParties(partyFlagsData: FlagsWithFormGroupPath[] = []): FlagsWithFormGroupPath[] {
  const pvpParties: FlagsWithFormGroupPath[] = [];
  const nonPvpParties: FlagsWithFormGroupPath[] = [];

  partyFlagsData.forEach((partyFlags) => {
    const prioritisedPartyFlags: FlagsWithFormGroupPath = {
      ...partyFlags,
      flags: {
        ...partyFlags.flags,
        details: partyFlags?.flags?.details ? prioritisePvpFlags(partyFlags.flags.details) : partyFlags?.flags?.details
      }
    };

    if (hasActivePvpFlag(prioritisedPartyFlags)) {
      pvpParties.push(prioritisedPartyFlags);
    } else {
      nonPvpParties.push(prioritisedPartyFlags);
    }
  });

  return [...pvpParties, ...nonPvpParties];
}
