import { FlagDetail, FlagsWithFormGroupPath } from '../domain';
import { CaseFlagStatus } from '../enums';
import { CaseField } from '../../../../domain/definition';
import { FieldsUtils } from '../../../../services/fields';

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

export function hasActivePvpFlagInCaseFields(caseFields: CaseField[] = []): boolean {
  return caseFields
    .filter((caseField) => !FieldsUtils.isFlagLauncherCaseField(caseField) && caseField.value)
    .some((caseField) => hasActivePvpFlagInCaseField(caseField));
}

function hasActivePvpFlagInCaseField(caseField: CaseField, currentValue?: any): boolean {
  const fieldType = caseField?.field_type;
  const value = caseField?.value ? caseField.value : currentValue;

  if (fieldType?.type === 'Complex') {
    return hasActivePvpFlagInComplexField(caseField, value);
  }

  if (fieldType?.type === 'Collection') {
    return hasActivePvpFlagInCollectionField(caseField, value);
  }

  return false;
}

function hasActivePvpFlagInComplexField(caseField: CaseField, value: any): boolean {
  if (FieldsUtils.isFlagsCaseField(caseField)) {
    return hasActivePvpFlagInFlagsValue(value);
  }

  const complexFields = caseField?.field_type?.complex_fields;
  if (!complexFields || !value || !FieldsUtils.isNonEmptyObject(value)) {
    return false;
  }

  return complexFields.some((subField) =>
    hasActivePvpFlagInCaseField(subField, value[subField.id])
  );
}

function hasActivePvpFlagInCollectionField(caseField: CaseField, value: any): boolean {
  if (!value || !Array.isArray(value)) {
    return false;
  }

  const collectionFieldType = caseField?.field_type?.collection_field_type;
  if (FieldsUtils.isFlagsFieldType(collectionFieldType)) {
    return value.some((item: any) => hasActivePvpFlagInFlagsValue(item?.value));
  }

  if (collectionFieldType?.type !== 'Complex' || !collectionFieldType.complex_fields) {
    return false;
  }

  return value.some((item: any) =>
    collectionFieldType.complex_fields.some((subField) =>
      hasActivePvpFlagInCaseField(subField, item?.value?.[subField.id])
    )
  );
}

function hasActivePvpFlagInFlagsValue(value: any): boolean {
  if (!value || !FieldsUtils.isNonEmptyObject(value) || !value.details || !Array.isArray(value.details)) {
    return false;
  }

  return value.details.some((detail) => isActivePvpFlag(detail?.value ?? detail));
}
