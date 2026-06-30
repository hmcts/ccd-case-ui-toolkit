import { ChallengedAccessRequest } from '../../../domain/case-view/challenged-access-request.model';
import { RoleCategory, RoleGrantTypeCategory, RoleRequestPayload } from '../../../domain/case-view/role-request.model';
import { SpecificAccessRequest } from '../../../domain/case-view/specific-access-request.model';

export class CaseAccessUtils {
    // User role mapping
    public static readonly JUDGE_ROLE = 'judge';
    public static readonly JUDGE_ROLE_NAME = 'judiciary';
    public static readonly ADMIN_ROLE = 'admin';
    public static readonly ADMIN_ROLE_NAME = 'admin';
    public static readonly PROFESSIONAL_ROLE = 'solicitor';
    public static readonly PROFESSIONAL_ROLE_NAME = 'professional';
    public static readonly LEGAL_OPERATIONS_ROLE = 'caseworker';
    public static readonly LEGAL_OPERATIONS_ROLE_NAME = 'legal-ops';
    public static readonly CITIZEN_ROLE = 'citizen';
    public static readonly CITIZEN_ROLE_NAME = 'citizen';
    public static readonly CTSC_ROLE = 'ctsc';
    public static readonly CTSC_ROLE_NAME = 'ctsc';

    public getMappedRoleCategory(roles: string[] = [], roleCategories: string[] = []): RoleCategory {

        const roleKeywords: string[] = roles.join().split('-').join().split(',');

        if (this.roleOrCategoryExists(CaseAccessUtils.JUDGE_ROLE, RoleCategory.JUDICIAL, roleKeywords, roleCategories)) {
            return RoleCategory.JUDICIAL;
        } else if (this.roleOrCategoryExists(CaseAccessUtils.PROFESSIONAL_ROLE,
            RoleCategory.PROFESSIONAL, roleKeywords, roleCategories)) {
            return RoleCategory.PROFESSIONAL;
        } else if (this.roleOrCategoryExists(CaseAccessUtils.CITIZEN_ROLE,
            RoleCategory.CITIZEN, roleKeywords, roleCategories)) {
            return RoleCategory.CITIZEN;
        } else if (this.roleOrCategoryExists(CaseAccessUtils.ADMIN_ROLE,
            RoleCategory.ADMIN, roleKeywords, roleCategories)) {
            return RoleCategory.ADMIN;
        } else if (this.roleOrCategoryExists(CaseAccessUtils.CTSC_ROLE,
            RoleCategory.CTSC, roleKeywords, roleCategories)) {
            return RoleCategory.CTSC;
        } else {
            return RoleCategory.LEGAL_OPERATIONS;
        }

    }

    public roleOrCategoryExists(roleKeyword: string, roleCategory: string, roleKeywords: string[], roleCategories: string[]): boolean {
        const categoryExists = roleCategories.indexOf(roleCategory) > -1;
        const keywordExists = roleKeywords.indexOf(roleKeyword) > -1;
        return categoryExists ? categoryExists : keywordExists;
    }

    public getAMRoleName(accessType: string, aMRole: RoleCategory): string {

        let roleName = '';

        switch (aMRole) {
            case RoleCategory.JUDICIAL:
                roleName = `${accessType}-access-${CaseAccessUtils.JUDGE_ROLE_NAME}`;
                break;
            case RoleCategory.PROFESSIONAL:
                roleName = `${accessType}-access-${CaseAccessUtils.PROFESSIONAL_ROLE_NAME}`;
                break;
            case RoleCategory.CITIZEN:
                roleName = `${accessType}-access-${CaseAccessUtils.CITIZEN_ROLE_NAME}`;
                break;
            case RoleCategory.ADMIN:
                roleName = `${accessType}-access-${CaseAccessUtils.ADMIN_ROLE_NAME}`;
                break;
            case RoleCategory.CTSC:
                roleName = `${accessType}-access-${CaseAccessUtils.CTSC_ROLE_NAME}`;
                break;
            default:
                roleName = `${accessType}-access-${CaseAccessUtils.LEGAL_OPERATIONS_ROLE_NAME}`;
                break;
        }

        return roleName;

    }

    public getAMPayload(
        assignerId: string,
        actorId: string,
        roleName: string,
        roleCategory: RoleCategory,
        grantType: RoleGrantTypeCategory,
        caseId: string,
        details: ChallengedAccessRequest | SpecificAccessRequest,
        beginTime: Date = null,
        endTime: Date = null,
        isNew = false,
    ): RoleRequestPayload {
        const process =  (details as ChallengedAccessRequest).caseReference !== undefined ? 'challenged-access' : 'specific-access';

        const payload: RoleRequestPayload = {
            roleRequest: {
                assignerId,
                process,
                reference: `${caseId}/${roleName}/${actorId}`,
                replaceExisting: true
            },
            requestedRoles: [{
                actorIdType: 'IDAM',
                actorId,
                roleType: 'CASE',
                roleName,
                classification: 'PUBLIC',
                roleCategory,
                grantType,
                beginTime,
                endTime,
                attributes: {
                  caseId,
                  isNew,
                  accessReason: JSON.stringify(details),
                },
                notes: [{
                  userId: assignerId,
                  time: new Date(),
                  comment: JSON.stringify(details)
                }]
            }]
        };

        return payload;
    }
}
