import { Fee } from './fee.model';
import { Link } from './link.model';

export class Payment {
    public date: string;
    public payer: string;
    public amount: number;
    public description: string;
    public reference: string;
    public currency: string;
    public ccd_case_number: string;
    public case_reference: string;
    public channel: string;
    public method: string;
    public external_provider: string;
    public status: string;
    public external_reference: string;
    public site_id: string;
    public service_name: string;
    public fees: Fee[];
    public _links: Link;
}
