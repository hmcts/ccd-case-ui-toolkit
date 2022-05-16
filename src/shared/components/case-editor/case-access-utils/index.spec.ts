import { CaseAccessUtils } from '.';

describe('CaseAccessUtils', () => {
    const camUtils: CaseAccessUtils = new CaseAccessUtils();

    describe('getMappedRoleCategory', () => {

        it('should return a role category when role category is present', () => {
            const roles = [
                'caseworker-something',
                'role22'
            ];
            const roleCategories = ['JUDICIAL'];
            const response = camUtils.getMappedRoleCategory(roles, roleCategories);
            expect(response).toEqual('JUDICIAL');
        });

        it('should return a role category when role category is not present', () => {
            const roles = [
                'caseworker-solicitor',
                'role22'
            ];
            const roleCategories = [];
            const response = camUtils.getMappedRoleCategory(roles, roleCategories);
            expect(response).toEqual('PROFESSIONAL');
        });

        it('should return LEGAL_OPERATIONS as default', () => {
            const roles = [
                'caseworker-something',
                'role22'
            ];
            const roleCategories = [];
            const response = camUtils.getMappedRoleCategory(roles, roleCategories);
            expect(response).toEqual('LEGAL_OPERATIONS');
        });

        it('should return ADMIN as response', () => {
            const roles = [
                'caseworker-admin',
                'role22'
            ];
            const roleCategories = [];
            const response = camUtils.getMappedRoleCategory(roles, roleCategories);
            expect(response).toEqual('ADMIN');
        });

        it('should return CITIZEN as response', () => {
            const roles = [
                'caseworker-citizen',
                'role22'
            ];
            const roleCategories = [];
            const response = camUtils.getMappedRoleCategory(roles, roleCategories);
            expect(response).toEqual('CITIZEN');
        });
    });

    describe('roleOrCategoryExists', () => {

        it('should return true when category exists', () => {
            const response = camUtils.roleOrCategoryExists('dummy', 'JUDICIAL', [], ['JUDICIAL']);
            expect(response).toBeTruthy();
        });

        it('should return true when role exists', () => {
            const response = camUtils.roleOrCategoryExists('solicitor', 'dummy', ['solicitor'], ['JUDICIAL']);
            expect(response).toBeTruthy();
        });

        it('should return false', () => {
            const response = camUtils.roleOrCategoryExists('dummy', 'JUDICIAL', [], []);
            expect(response).toBeFalsy();
        });
    });

    describe('getAMRoleName', () => {

        it('should return judicial role name', () => {
            const response = camUtils.getAMRoleName('dummy', 'JUDICIAL');
            expect(response).toEqual('dummy-access-judicial');
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
                {reason: 3435, caseReference: '234', 'otherReason': ''},
                dateValue,
                null
            );
            expect(response.requestedRoles[0].beginTime).toEqual(dateValue);
        });
    });

});
