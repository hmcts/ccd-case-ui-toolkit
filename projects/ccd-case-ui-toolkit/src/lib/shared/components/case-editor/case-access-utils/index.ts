import { ChallengedAccessRequest } from '../../../domain/case-view/challenged-access-request.model';
import { RoleCategory, RoleGrantTypeCategory, RoleRequestPayload } from '../../../domain/case-view/role-request.model';
import { SpecificAccessRequest } from '../../../domain/case-view/specific-access-request.model';

export class CaseAccessUtils {

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
