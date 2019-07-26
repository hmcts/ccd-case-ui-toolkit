import { Injectable } from '@angular/core';
import { CaseField } from '../../../domain/definition';
import { Profile } from '../../../domain/profile';

@Injectable()
export class CollectionCreateCheckerService {

  public setDisplayContextForChildren(caseField: CaseField, profile: Profile) {
    let children = this.getCaseFieldChildren(caseField);

    if (children && children.length > 0) {
      children.forEach(child => {
        if (!!profile.user.idam.roles.find(role => this.hasCreateAccess(child, role))) {
          child.display_context = caseField.display_context;
        }
        if (this.isCollection(child) || this.isComplex(child)) {
          this.setDisplayContextForChildren(child, profile)
        }
      });
    }
  }

  private getCaseFieldChildren(caseField: CaseField): CaseField[] {
    let childrenCaseFields = [];
    if (this.isCollection(caseField)) {
      childrenCaseFields = caseField.field_type.collection_field_type.complex_fields || [];
    } else if (this.isComplex(caseField)) {
      childrenCaseFields = caseField.field_type.complex_fields || [];
    }
    return childrenCaseFields;
  }

  private isComplex(case_field: CaseField) {
    return case_field.field_type.type === 'Complex';
  }

  private isCollection(case_field: CaseField) {
    return case_field.field_type.type === 'Collection';
  }

  private hasCreateAccess(caseField: CaseField, role: any) {
    return !!caseField.acls.find( acl => acl.role === role && acl.create === true);
  }
}
