import { ChallengedAccessRequest } from "../../../domain/case-view/challenged-access-request.model";
import { RoleCategory, RoleGrantTypeCategory, RoleRequestPayload } from "../../../domain/case-view/role-request.model";
import { SpecificAccessRequest } from "../../../domain/case-view/specific-access-request.model";

export class CaseAccessUtils {
    // User role mapping
    public static readonly JUDGE_ROLE = 'judge';
    public static readonly JUDGE_ROLE_CATEGORY = 'JUDICIAL';
    public static readonly JUDGE_ROLE_NAME = 'judicial';
    public static readonly ADMIN_ROLE = 'admin';
    public static readonly ADMIN_ROLE_CATEGORY = 'ADMIN';
    public static readonly ADMIN_ROLE_NAME = 'admin';
    public static readonly PROFESSIONAL_ROLE = 'solicitor';
    public static readonly PROFESSIONAL_ROLE_CATEGORY = 'PROFESSIONAL';
    public static readonly PROFESSIONAL_ROLE_NAME = 'professional';
    public static readonly LEGAL_OPERATIONS_ROLE = 'caseworker';
    public static readonly LEGAL_OPERATIONS_ROLE_CATEGORY = 'LEGAL_OPERATIONS';
    public static readonly LEGAL_OPERATIONS_ROLE_NAME = 'legal-ops';
    public static readonly CITIZEN_ROLE = 'citizen';
    public static readonly CITIZEN_ROLE_CATEGORY = 'CITIZEN';
    public static readonly CITIZEN_ROLE_NAME = 'citizen';

    public getMappedRoleCategory(roles: string[] = [], roleCategories: string[] = []): RoleCategory {

        const roleKeywords: string[] = roles.join().split('-').join().split(',');

        if (this.roleOrCategoryExists(CaseAccessUtils.JUDGE_ROLE, CaseAccessUtils.JUDGE_ROLE_CATEGORY, roleKeywords, roleCategories)) {
            return CaseAccessUtils.JUDGE_ROLE_CATEGORY;
        } else if (this.roleOrCategoryExists(CaseAccessUtils.PROFESSIONAL_ROLE,
                    CaseAccessUtils.PROFESSIONAL_ROLE_CATEGORY, roleKeywords, roleCategories)) {
            return CaseAccessUtils.PROFESSIONAL_ROLE_CATEGORY;
        } else if (this.roleOrCategoryExists(CaseAccessUtils.CITIZEN_ROLE,
                    CaseAccessUtils.CITIZEN_ROLE_CATEGORY, roleKeywords, roleCategories)) {
            return CaseAccessUtils.CITIZEN_ROLE_CATEGORY;
        } else if (this.roleOrCategoryExists(CaseAccessUtils.ADMIN_ROLE,
                    CaseAccessUtils.ADMIN_ROLE_CATEGORY, roleKeywords, roleCategories)) {
            return CaseAccessUtils.ADMIN_ROLE_CATEGORY;
        } else {
            return CaseAccessUtils.LEGAL_OPERATIONS_ROLE_CATEGORY;
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
            case CaseAccessUtils.JUDGE_ROLE_CATEGORY:
                roleName = `${accessType}-access-${CaseAccessUtils.JUDGE_ROLE_NAME}`;
                break;
            case CaseAccessUtils.PROFESSIONAL_ROLE_CATEGORY:
                roleName = `${accessType}-access-${CaseAccessUtils.PROFESSIONAL_ROLE_NAME}`;
                break;
            case CaseAccessUtils.CITIZEN_ROLE_CATEGORY:
                roleName = `${accessType}-access-${CaseAccessUtils.CITIZEN_ROLE_NAME}`;
                break;
            case CaseAccessUtils.ADMIN_ROLE_CATEGORY:
                roleName = `${accessType}-access-${CaseAccessUtils.ADMIN_ROLE_NAME}`;
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
        endTime: Date = null
    ): RoleRequestPayload {
        const process =  (details as ChallengedAccessRequest).caseReference !== undefined ? 'challenged-access' : 'specific-access';
        const payload: RoleRequestPayload = {
            roleRequest: {
                assignerId,
                process,
                reference:  `${caseId}/${roleName}/${actorId}`,
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
                    caseId
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
