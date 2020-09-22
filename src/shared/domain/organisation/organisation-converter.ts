import { Injectable } from '@angular/core';
import { SimpleOrganisationModel } from './simple-organisation.model';
import { OrganisationVm } from '../../services/organisation';

@Injectable()
export class OrganisationConverter {

  private static toSimpleAddress(organisationModel: OrganisationVm): string {
    let simpleAddress = '';
    if (organisationModel.addressLine1) { simpleAddress += organisationModel.addressLine1 + '<br>' }
    if (organisationModel.addressLine2) { simpleAddress += organisationModel.addressLine2 + '<br>' }
    if (organisationModel.addressLine3) { simpleAddress += organisationModel.addressLine3 + '<br>' }
    if (organisationModel.townCity) { simpleAddress += organisationModel.townCity + '<br>' }
    if (organisationModel.county) { simpleAddress += organisationModel.county + '<br>' }
    if (organisationModel.country) { simpleAddress += organisationModel.country + '<br>' }
    if (organisationModel.postCode) { simpleAddress += organisationModel.postCode + '<br>' }
    return simpleAddress;
  }

  public toSimpleOrganisationModel(organisationModel: OrganisationVm): SimpleOrganisationModel {
    return {
      organisationIdentifier: organisationModel.organisationIdentifier,
      name: organisationModel.name,
      address: OrganisationConverter.toSimpleAddress(organisationModel)
    }
  }
}
