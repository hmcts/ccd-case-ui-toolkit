import { CaseAccessUtils } from '.';
import { RoleCategory } from '../../../domain/case-view/role-request.model';


describe('CaseAccessUtils', () => {
    const camUtils: CaseAccessUtils = new CaseAccessUtils();

    describe('getAMPayload', () => {

        it('should render payload', () => {
            const dateValue = new Date();
            const response = camUtils.getAMPayload(
                'dummy',
                'dummy',
                'dummy',
                RoleCategory.ADMIN,
                'BASIC',
                'dummy',
                {reason: 3435, caseReference: '234', otherReason: ''},
                dateValue,
                null
            );
            expect(response.requestedRoles[0].beginTime).toEqual(dateValue);
        });
    });

});
