import { CaseAccessUtils } from ".";

describe('CaseAccessUtils', () => {
    const camUtils = new CaseAccessUtils();

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
    });

    describe('roleOrCategoryExists', () => {

        it('should return true when category exists', () => {
            const response = camUtils.roleOrCategoryExists('dummy', 'JUDICIAL', [], ['JUDICIAL']);
            expect(response).toEqual(true);
        });

        it('should return true when role exists', () => {
            const response = camUtils.roleOrCategoryExists('solicitor', 'dummy', ['solicitor'], ['JUDICIAL']);
            expect(response).toEqual(true);
        });

        it('should return false', () => {
            const response = camUtils.roleOrCategoryExists('dummy', 'JUDICIAL', [], []);
            expect(response).toEqual(false);
        });
    });

    describe('getAMRoleName', () => {

        it('should return a role name', () => {
            const response = camUtils.getAMRoleName('dummy', 'JUDICIAL');
            expect(response).toEqual('dummy-access-judicial');
        });
    });

});