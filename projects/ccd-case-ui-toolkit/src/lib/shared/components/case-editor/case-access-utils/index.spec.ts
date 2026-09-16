import { CaseAccessUtils } from '.';

describe('CaseAccessUtils', () => {
    const camUtils: CaseAccessUtils = new CaseAccessUtils();

    describe('getMappedRoleCategories', () => {

        it('should return a role category when role category is present', () => {
            const roles = [
                'caseworker-something',
                'role22'
            ];
            const response = camUtils.getMappedRoleCategories(roles);
            expect(response).toEqual(['LEGAL_OPERATIONS']);
        });

        it('should return a role category when role category is not present', () => {
            const roles = [
                'solicitor',
                'role22'
            ];
            const response = camUtils.getMappedRoleCategories(roles);
            expect(response).toEqual(['PROFESSIONAL']);
        });

        it('should return LEGAL_OPERATIONS as default', () => {
            const roles = [
                'caseworker-something',
                'role22'
            ];
            const response = camUtils.getMappedRoleCategories(roles);
            expect(response).toEqual(['LEGAL_OPERATIONS']);
        });

        it('should return ADMIN as response', () => {
            const roles = [
                'caseworker-admin',
                'role22'
            ];
            const response = camUtils.getMappedRoleCategories(roles);
            expect(response).toEqual(['ADMIN', 'LEGAL_OPERATIONS']);
        });

        it('should return CITIZEN as response', () => {
            const roles = [
                'citizen',
                'role22'
            ];
            const response = camUtils.getMappedRoleCategories(roles);
            expect(response).toEqual(['CITIZEN']);
        });

        it('should return CTSC as response', () => {
            const roles = [
                'ctsc',
                'role22'
            ];
            const response = camUtils.getMappedRoleCategories(roles);
            expect(response).toEqual(['CTSC']);
        });

        it('should return multiple categories as response', () => {
            const roles = [
                'ctsc',
                'citizen',
                'judge'
            ];
            const response = camUtils.getMappedRoleCategories(roles);
            expect(response).toEqual(['JUDICIAL', 'CITIZEN', 'CTSC']);
        });
    });

    describe('roleHasKeyword', () => {

        it('should return true when role exists', () => {
            const response = camUtils.roleHasKeyword('solicitor', ['solicitor']);
            expect(response).toBeTruthy();
        });

        it('should return false', () => {
            const response = camUtils.roleHasKeyword('dummy', []);
            expect(response).toBeFalsy();
        });
    });

    describe('getAMRoleName', () => {

        it('should return judicial role name', () => {
            const response = camUtils.getAMRoleName('dummy', 'JUDICIAL');
            expect(response).toEqual('dummy-access-judiciary');
        });

        it('should return citizen role name', () => {
            const response = camUtils.getAMRoleName('dummy', 'CITIZEN');
            expect(response).toEqual('dummy-access-citizen');
        });

        it('should return professional role name', () => {
            const response = camUtils.getAMRoleName('dummy', 'PROFESSIONAL');
            expect(response).toEqual('dummy-access-professional');
        });

        it('should return legal-ops role name', () => {
            const response = camUtils.getAMRoleName('dummy', 'LEGAL_OPERATIONS');
            expect(response).toEqual('dummy-access-legal-ops');
        });

        it('should return admin role name', () => {
            const response = camUtils.getAMRoleName('dummy', 'ADMIN');
            expect(response).toEqual('dummy-access-admin');
        });

        it('should return ctsc role name', () => {
            const response = camUtils.getAMRoleName('dummy', 'CTSC');
            expect(response).toEqual('dummy-access-ctsc');
        });
    });

    describe('getAMPayload', () => {

        it('should render payload', () => {
            const dateValue = new Date();
            const response = camUtils.getAMPayload(
                'dummy',
                'dummy',
                'dummy',
                'ADMIN',
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
