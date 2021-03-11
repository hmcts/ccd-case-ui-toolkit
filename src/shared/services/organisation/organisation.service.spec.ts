import { AbstractAppConfig } from '../../../app.config';
import { Observable } from 'rxjs';
import { OrganisationService, Organisation ,OrganisationAddress} from './organisation.service';
import { HttpService } from '../../services';
import createSpyObj = jasmine.createSpyObj;

describe('Organisation Service', () => {

    const PRD_URL = 'http://aggregated.ccd.reform/api/caseshare/orgs';

    let appConfig: any;
    let httpService: any;
    let organisationService: OrganisationService;

    let ORGANISATIONADDRESS : OrganisationAddress []= 
        [{
            addressLine1: '12',
            addressLine2: 'Nithdale Role',
            addressLine3: '',
            townCity: 'Liverpool',
            county: 'Merseyside',
            country: 'UK',
            postCode: 'L15 5AX',
            dxAddress: []
        }]
    
    let ORGANISATIONS : Organisation[] =[{
        organisationIdentifier: '0222223',
        name: 'test solicitor',
        status: 'active',
        sraId: '012345622',
        sraRegulated: true,
        companyNumber: '0987659432',
        companyUrl: 'test_url',
        superUser: {
            firstName: "test",
            lastName: 'test last',
            email: 'test@email.com',
        },
        paymentAccount: ['test'],
        contactInformation: ORGANISATIONADDRESS
    }]
   
    beforeEach(() => {
        appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getPrdUrl','getCacheTimeOut']);
        appConfig.getPrdUrl.and.returnValue(PRD_URL);

        httpService = createSpyObj<HttpService>('httpService', ['post', 'get']);
        
        organisationService = new OrganisationService(httpService, appConfig);
    });

    describe('organisation service()', () => {
        beforeEach(() => {
            httpService.get.and.returnValue(Observable.of(ORGANISATIONS));

        });
        it('should be call getActiveOrganisations() ', () => {
            let test = spyOn(organisationService, 'getActiveOrganisations');
    
            organisationService.getActiveOrganisations();
            expect(test).toHaveBeenCalled();
            expect(organisationService.getActiveOrganisations).toHaveBeenCalledWith();
    
        });

        it('should be validate oorganisaation data', () => {
            organisationService.getActiveOrganisations().subscribe(organisatuon=>{
                organisatuon.forEach(org=>{
                    expect(ORGANISATIONS[0].organisationIdentifier).toBe(org.organisationIdentifier);
                    expect(ORGANISATIONS[0].name).toBe(org.name);
                    expect(ORGANISATIONS[0].contactInformation[0].addressLine1).toBe(org.addressLine1);
                    expect(ORGANISATIONS[0].contactInformation[0].addressLine2).toBe(org.addressLine2);
                    expect(ORGANISATIONS[0].contactInformation[0].addressLine3).toBe(org.addressLine3);
                    expect(ORGANISATIONS[0].contactInformation[0].townCity).toBe(org.townCity);
                    expect(ORGANISATIONS[0].contactInformation[0].postCode).toBe(org.postCode);
                }) 
            });
    
        });

    })

    

})