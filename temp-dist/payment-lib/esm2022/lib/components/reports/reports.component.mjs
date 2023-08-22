import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { formatDate } from "@angular/common";
import { BulkScaningPaymentService } from '../../services/bulk-scaning-payment/bulk-scaning-payment.service';
import { ErrorHandlerService } from '../../services/shared/error-handler.service';
import { PaymentViewService } from '../../services/payment-view/payment-view.service';
import { XlFileService } from '../../services/xl-file/xl-file.service';
import * as i0 from "@angular/core";
import * as i1 from "../../services/xl-file/xl-file.service";
import * as i2 from "../../services/shared/error-handler.service";
import * as i3 from "@angular/forms";
import * as i4 from "../../services/bulk-scaning-payment/bulk-scaning-payment.service";
import * as i5 from "../../services/payment-view/payment-view.service";
import * as i6 from "@angular/common";
import * as i7 from "../error-banner/error-banner.component";
function ReportsComponent_ccpay_error_banner_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "ccpay-error-banner", 29);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("errorMessage", ctx_r1.errorMessage);
} }
function ReportsComponent_div_34_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 9)(1, "input", 30);
    i0.ɵɵlistener("click", function ReportsComponent_div_34_Template_input_click_1_listener() { i0.ɵɵrestoreView(_r5); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.validateDates("PAYMENT_FAILURE_EVENT")); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "label", 31);
    i0.ɵɵtext(3, "Payment failure event");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 12);
    i0.ɵɵtext(5, "Failed payment transaction details");
    i0.ɵɵelementEnd()();
} }
function ReportsComponent_p_44_span_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "Please select 'Date From' less than or equal to 'Date To'");
    i0.ɵɵelementEnd();
} }
function ReportsComponent_p_44_span_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, " Please select the date range between 7 days");
    i0.ɵɵelementEnd();
} }
function ReportsComponent_p_44_span_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, " Please select the date range between 30 days");
    i0.ɵɵelementEnd();
} }
function ReportsComponent_p_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 32);
    i0.ɵɵtemplate(1, ReportsComponent_p_44_span_1_Template, 2, 0, "span", 33);
    i0.ɵɵtemplate(2, ReportsComponent_p_44_span_2_Template, 2, 0, "span", 33);
    i0.ɵɵtemplate(3, ReportsComponent_p_44_span_3_Template, 2, 0, "span", 33);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r3.isStartDateLesthanEndDate);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r3.isDateRangeBetnWeek);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r3.isDateBetwnMonth);
} }
export class ReportsComponent {
    xlFileService;
    errorHandlerService;
    formBuilder;
    bulkScaningPaymentService;
    paymentViewService;
    ISPAYMENTSTATUSENABLED;
    fmt = 'dd/MM/yyyy';
    loc = 'en-US';
    reportsForm;
    startDate;
    endDate;
    errorMeaagse;
    ccdCaseNumber;
    isDownLoadButtondisabled = false;
    isStartDateLesthanEndDate = false;
    isDateBetwnMonth = false;
    isDateRangeBetnWeek = false;
    //errorMessage = this.errorHandlerService.getServerErrorMessage(false, false, '');
    errorMessage = null;
    paymentGroups = [];
    constructor(xlFileService, errorHandlerService, formBuilder, bulkScaningPaymentService, paymentViewService) {
        this.xlFileService = xlFileService;
        this.errorHandlerService = errorHandlerService;
        this.formBuilder = formBuilder;
        this.bulkScaningPaymentService = bulkScaningPaymentService;
        this.paymentViewService = paymentViewService;
    }
    ngOnInit() {
        this.fromValidation();
    }
    getToday() {
        return new Date().toISOString().split('T')[0];
    }
    getSelectedFromDate() {
        this.validateDates(this.reportsForm.get('selectedreport').value);
    }
    validateDates(reportName) {
        const selectedStartDate = this.tranformDate(this.reportsForm.get('startDate').value), selectedEndDate = this.tranformDate(this.reportsForm.get('endDate').value);
        const isDateRangeMoreThanWeek = (new Date(selectedStartDate) - new Date(selectedEndDate)) / (1000 * 3600 * -24) > 7;
        const isDateRangeMoreThanMonth = (new Date(selectedStartDate) - new Date(selectedEndDate)) / (1000 * 3600 * -24) > 30;
        if (new Date(selectedStartDate) > new Date(selectedEndDate) && selectedEndDate !== '') {
            this.reportsForm.get('startDate').setValue('');
            this.isDateRangeBetnWeek = false;
            this.isDateBetwnMonth = false;
            this.isStartDateLesthanEndDate = true;
        }
        else if (reportName && reportName === 'SURPLUS_AND_SHORTFALL' && isDateRangeMoreThanWeek) {
            this.isDateRangeBetnWeek = true;
            this.isDateBetwnMonth = false;
            this.isStartDateLesthanEndDate = false;
        }
        else if (reportName && reportName === 'PAYMENT_FAILURE_EVENT' && isDateRangeMoreThanMonth) {
            this.isDateRangeBetnWeek = false;
            this.isDateBetwnMonth = true;
            this.isStartDateLesthanEndDate = false;
        }
        else {
            this.isDateBetwnMonth = false;
            this.isDateRangeBetnWeek = false;
            this.isStartDateLesthanEndDate = false;
        }
    }
    fromValidation() {
        this.reportsForm = this.formBuilder.group({
            selectedreport: new FormControl(''),
            startDate: new FormControl(''),
            endDate: new FormControl('')
        });
    }
    downloadReport() {
        this.isDownLoadButtondisabled = true;
        const dataLossRptDefault = [{ loss_resp: '', payment_asset_dcn: '', env_ref: '', env_item: '', resp_service_id: '', resp_service_name: '', date_banked: '', bgc_batch: '', payment_method: '', amount: '' }], unProcessedRptDefault = [{ resp_service_id: '', resp_service_name: '', exception_ref: '', ccd_ref: '', date_banked: '', bgc_batch: '', payment_asset_dcn: '', env_ref: '', env_item: '', payment_method: '', amount: '' }], processedUnallocated = [{ resp_service_id: '', resp_service_name: '', allocation_status: '', receiving_office: '', allocation_reason: '', ccd_exception_ref: '', ccd_case_ref: '', payment_asset_dcn: '', env_ref: '', env_item: '', date_banked: '', bgc_batch: '', payment_method: '', amount: '', updated_by: '' }], shortFallsRptDefault = [{ resp_service_id: '', resp_service_name: '', surplus_shortfall: '', balance: '', payment_amount: '', ccd_case_reference: '', ccd_exception_reference: '', processed_date: '', reason: '', explanation: '', user_name: '' }], selectedReportName = this.reportsForm.get('selectedreport').value, selectedStartDate = this.tranformDate(this.reportsForm.get('startDate').value), selectedEndDate = this.tranformDate(this.reportsForm.get('endDate').value);
        if (selectedReportName === 'PROCESSED_UNALLOCATED' || selectedReportName === 'SURPLUS_AND_SHORTFALL') {
            this.paymentViewService.downloadSelectedReport(selectedReportName, selectedStartDate, selectedEndDate).subscribe(response => {
                this.errorMessage = this.errorHandlerService.getServerErrorMessage(false, false, '');
                const result = JSON.parse(response);
                let res = { data: this.applyDateFormat(result) };
                if (res['data'].length === 0 && selectedReportName === 'PROCESSED_UNALLOCATED') {
                    res.data = processedUnallocated;
                }
                else if (res['data'].length === 0 && selectedReportName === 'SURPLUS_AND_SHORTFALL') {
                    res.data = shortFallsRptDefault;
                }
                if (result['data'].length > 0) {
                    for (var i = 0; i < res['data'].length; i++) {
                        if (res['data'][i]["payment_asset_dcn"] !== undefined) {
                            res['data'][i]['env_ref'] = res['data'][i]["payment_asset_dcn"].substr(0, 13);
                            res['data'][i]['env_item'] = res['data'][i]["payment_asset_dcn"].substr(13, 21);
                        }
                        if (res['data'][i]["amount"] !== undefined) {
                            res['data'][i]['amount'] = this.convertToFloatValue(res['data'][i]['amount']);
                        }
                        if (res['data'][i]["balance"] !== undefined) {
                            res['data'][i]['balance'] = this.convertToFloatValue(res['data'][i]["balance"]);
                        }
                        let Op = res['data'][i]["surplus_shortfall"];
                        if (Op !== undefined) {
                            res['data'][i]['surplus_shortfall'] = Op == "Surplus" ? "Over payment" : "Under payment";
                        }
                        if (res['data'][i]["payment_amount"] !== undefined) {
                            res['data'][i]['payment_amount'] = this.convertToFloatValue(res['data'][i]['payment_amount']);
                        }
                    }
                }
                this.isDownLoadButtondisabled = false;
                this.xlFileService.exportAsExcelFile(res['data'], this.getFileName(this.reportsForm.get('selectedreport').value, selectedStartDate, selectedEndDate));
            }, (error) => {
                this.isDownLoadButtondisabled = false;
                this.errorMessage = this.errorHandlerService.getServerErrorMessage(true, false, '');
            });
        }
        else if (selectedReportName === 'PAYMENT_FAILURE_EVENT') {
            this.paymentViewService.downloadFailureReport(selectedStartDate, selectedEndDate).subscribe(response => {
                this.errorMessage = this.errorHandlerService.getServerErrorMessage(false, false, '');
                const result = { data: JSON.parse(response)['payment_failure_report_list'] };
                let res = { data: this.applyDateFormat(result) };
                if (result['data'].length > 0) {
                    for (var i = 0; i < res['data'].length; i++) {
                        if (res['data'][i]["disputed_amount"] !== undefined) {
                            res['data'][i]['disputed_amount'] = this.convertToFloatValue(res['data'][i]["disputed_amount"]);
                        }
                        if (res['data'][i]["representment_status"] !== undefined) {
                            res['data'][i]['representment_status'] = res['data'][i]["representment_status"].toLowerCase() === 'yes' ? 'Success' : 'Failure';
                        }
                        if (res['data'][i]['representment_status'] === undefined) {
                            res['data'][i]['representment_status'] = 'No representment received';
                        }
                        if (res['data'][i]['representment_date'] === undefined) {
                            res['data'][i]['representment_date'] = 'N/A';
                        }
                        if (res['data'][i]['refund_reference'] === undefined) {
                            res['data'][i]['refund_reference'] = 'No refund available';
                        }
                        if (res['data'][i]['refund_amount'] === undefined) {
                            res['data'][i]['refund_amount'] = 'N/A';
                        }
                        if (res['data'][i]['refund_date'] === undefined) {
                            res['data'][i]['refund_date'] = 'N/A';
                        }
                        if (res['data'][i]['document_control_number'] === undefined) {
                            res['data'][i]['document_control_number'] = 'N/A';
                        }
                    }
                }
                this.isDownLoadButtondisabled = false;
                this.xlFileService.exportAsExcelFile(res['data'], this.getFileName(this.reportsForm.get('selectedreport').value, selectedStartDate, selectedEndDate));
            }, (error) => {
                this.isDownLoadButtondisabled = false;
                const errorContent = error.replace(/[^a-zA-Z ]/g, '').trim();
                const statusCode = error.replace(/[^a-zA-Z0-9 ]/g, '').trim().split(' ')[0];
                if (statusCode === '404') {
                    this.errorMessage = this.errorHandlerService.getServerErrorMessage(true, true, errorContent);
                }
                else {
                    this.errorMessage = this.errorHandlerService.getServerErrorMessage(true, false, '');
                }
            });
        }
        else {
            this.bulkScaningPaymentService.downloadSelectedReport(selectedReportName, selectedStartDate, selectedEndDate).subscribe(response => {
                this.errorMessage = this.errorHandlerService.getServerErrorMessage(false, false, '');
                const result = JSON.parse(response);
                let res = { data: this.applyDateFormat(result) };
                if (res['data'].length === 0 && selectedReportName === 'DATA_LOSS') {
                    res.data = dataLossRptDefault;
                }
                else if (res['data'].length === 0 && selectedReportName === 'UNPROCESSED') {
                    res.data = unProcessedRptDefault;
                }
                if (result['data'].length > 0) {
                    for (var i = 0; i < res['data'].length; i++) {
                        if (res['data'][i]["amount"] !== undefined) {
                            res['data'][i]['amount'] = this.convertToFloatValue(res['data'][i]['amount']);
                        }
                        if (res['data'][i]["payment_asset_dcn"] !== undefined) {
                            res['data'][i]['env_ref'] = res['data'][i]["payment_asset_dcn"].substr(0, 13);
                            res['data'][i]['env_item'] = res['data'][i]["payment_asset_dcn"].substr(13, 21);
                        }
                    }
                }
                this.isDownLoadButtondisabled = false;
                this.xlFileService.exportAsExcelFile(res['data'], this.getFileName(this.reportsForm.get('selectedreport').value, selectedStartDate, selectedEndDate));
            }, (error) => {
                this.isDownLoadButtondisabled = false;
                this.errorMessage = this.errorHandlerService.getServerErrorMessage(true, false, '');
            });
        }
    }
    getFileName(selectedOption, startDate, endDate) {
        const loc = 'en-US', stDt = formatDate(startDate, 'ddMMyy', loc), enDt = formatDate(endDate, 'ddMMyy', loc), now = new Date(), currentDate = formatDate(now, 'ddMMyy', loc), timestamp = `${currentDate}_${this.getTwodigit(now.getHours())}${this.getTwodigit(now.getMinutes())}${this.getTwodigit(now.getSeconds())}`, selectedOptionTxt = this.getCamelCaseString(selectedOption);
        return selectedOptionTxt + '_' + stDt + '_To_' + enDt + '_Run_' + timestamp;
    }
    tranformDate(strDate) {
        let result = '';
        if (strDate) {
            let parts = strDate.split('-');
            result = `${parts[1]}/${parts[2]}/${parts[0]}`;
        }
        return result;
    }
    getTwodigit(input) {
        return ("0" + input).slice(-2);
    }
    getCamelCaseString(selectedOption) {
        let result;
        switch (selectedOption) {
            case 'UNPROCESSED': {
                result = 'Unprocessed';
                break;
            }
            case 'DATA_LOSS': {
                result = 'Data_Loss';
                break;
            }
            case 'PROCESSED_UNALLOCATED': {
                result = 'Processed_Unallocated';
                break;
            }
            case 'SURPLUS_AND_SHORTFALL': {
                result = 'Over Payment_Under Payment';
                break;
            }
            case 'PAYMENT_FAILURE_EVENT': {
                result = 'Payment failure event';
                break;
            }
            default: {
                result = selectedOption;
                break;
            }
        }
        return result;
    }
    applyDateFormat(res) {
        return res['data'].map(value => {
            if (value['date_banked']) {
                value['date_banked'] = formatDate(value['date_banked'], this.fmt, this.loc);
            }
            if (value['event_date'] && value['event_date'].indexOf(',') === -1) {
                value['event_date'] = formatDate(value['event_date'], this.fmt, this.loc);
            }
            else if (value['event_date'] && value['event_date'].indexOf(',') !== -1) {
                value['event_date'] = this.multiDateFormater(value['event_date']);
            }
            if (value['representment_date'] && value['representment_date'].indexOf(',') === -1) {
                value['representment_date'] = formatDate(value['representment_date'], this.fmt, this.loc);
            }
            else if (value['representment_date'] && value['representment_date'].indexOf(',') !== -1) {
                value['representment_date'] = this.multiDateFormater(value['representment_date']);
            }
            if (value['refund_date'] && value['refund_date'].indexOf(',') === -1) {
                value['refund_date'] = formatDate(value['refund_date'], this.fmt, this.loc);
            }
            else if (value['refund_date'] && value['refund_date'].indexOf(',') !== -1) {
                value['refund_date'] = this.multiDateFormater(value['refund_date']);
            }
            return value;
        });
    }
    multiDateFormater(dateStr) {
        return dateStr.split(',').map((date) => formatDate(date, this.fmt, this.loc)).join(',');
    }
    convertToFloatValue(amt) {
        return amt ? Number.parseFloat(amt).toFixed(2) : '0.00';
    }
    static ɵfac = function ReportsComponent_Factory(t) { return new (t || ReportsComponent)(i0.ɵɵdirectiveInject(i1.XlFileService), i0.ɵɵdirectiveInject(i2.ErrorHandlerService), i0.ɵɵdirectiveInject(i3.FormBuilder), i0.ɵɵdirectiveInject(i4.BulkScaningPaymentService), i0.ɵɵdirectiveInject(i5.PaymentViewService)); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ReportsComponent, selectors: [["ccpay-reports"]], inputs: { ISPAYMENTSTATUSENABLED: "ISPAYMENTSTATUSENABLED" }, decls: 48, vars: 7, consts: [[1, "header"], ["type", "hidden", "value", "REPORTS", 1, "iFrameDrivenImageValue"], ["myInput", ""], [3, "errorMessage", 4, "ngIf"], [1, "govuk-fieldset__legend--xl"], [1, "govuk-fieldset__heading"], [3, "formGroup"], [1, "govuk-form-group"], ["data-module", "govuk-radios", 1, "govuk-radios", "govuk-radios--conditional"], [1, "govuk-radios__item"], ["required", "", "id", "DataLoss", "formControlName", "selectedreport", "name", "selectedreport", "type", "radio", "value", "DATA_LOSS", "data-aria-controls", "DataLoss", 1, "govuk-radios__input", 3, "click"], ["for", "DataLoss", 1, "govuk-label", "govuk-radios__label", "govuk-label--m"], [1, "form-hint"], ["id", "UnprocessedTransactions", "formControlName", "selectedreport", "name", "selectedreport", "type", "radio", "value", "UNPROCESSED", "data-aria-controls", "UnprocessedTransactions", 1, "govuk-radios__input", 3, "click"], ["for", "UnprocessedTransactions", 1, "govuk-label", "govuk-radios__label", "govuk-label--m"], ["id", "ProcessedUnallocated", "formControlName", "selectedreport", "name", "selectedreport", "type", "radio", "value", "PROCESSED_UNALLOCATED", "data-aria-controls", "ProcessedUnallocated", 1, "govuk-radios__input", 3, "click"], ["for", "ProcessedUnallocated", 1, "govuk-label", "govuk-radios__label", "govuk-label--m"], ["id", "ShortfallsandSurplus", "formControlName", "selectedreport", "name", "selectedreport", "type", "radio", "value", "SURPLUS_AND_SHORTFALL", "data-aria-controls", "ShortfallsandSurplus", 1, "govuk-radios__input", 3, "click"], ["for", "ShortfallsandSurplus", 1, "govuk-label", "govuk-radios__label", "govuk-label--m"], ["class", "govuk-radios__item", 4, "ngIf"], [1, "datefrom"], ["for", "date-from", 1, "govuk-label", "govuk-radios__label", "govuk-label--m"], ["id", "date-from", "name", "date-from", "type", "date", "formControlName", "startDate", "required", "", 1, "form-control", 3, "max", "change"], [1, "dateto"], ["for", "date-to", 1, "govuk-label", "govuk-radios__label", "govuk-label--m"], ["id", "date-to", "name", "search", "type", "date", "formControlName", "endDate", "required", "", 1, "form-control", 3, "max", "change"], ["class", "inline-error-message", 4, "ngIf"], [1, "btnsubmit"], ["type", "submit", 1, "button", 3, "disabled", "click"], [3, "errorMessage"], ["id", "PaymentFailureEvent", "formControlName", "selectedreport", "name", "selectedreport", "type", "radio", "value", "PAYMENT_FAILURE_EVENT", "data-aria-controls", "PaymentFailureEvent", 1, "govuk-radios__input", 3, "click"], ["for", "PaymentFailureEvent", 1, "govuk-label", "govuk-radios__label", "govuk-label--m"], [1, "inline-error-message"], [4, "ngIf"]], template: function ReportsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵelement(1, "input", 1, 2);
            i0.ɵɵtemplate(3, ReportsComponent_ccpay_error_banner_3_Template, 1, 1, "ccpay-error-banner", 3);
            i0.ɵɵelementStart(4, "legend", 4)(5, "h1", 5);
            i0.ɵɵtext(6, " Choose the report type and date range");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(7, "form", 6)(8, "div", 7)(9, "div", 8)(10, "div", 9)(11, "input", 10);
            i0.ɵɵlistener("click", function ReportsComponent_Template_input_click_11_listener() { return ctx.validateDates("DATA_LOSS"); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "label", 11);
            i0.ɵɵtext(13, "Data loss");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "span", 12);
            i0.ɵɵtext(15, "Missing transactions where data has been received from only either of Exela or Bulk scan");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(16, "div", 9)(17, "input", 13);
            i0.ɵɵlistener("click", function ReportsComponent_Template_input_click_17_listener() { return ctx.validateDates("UNPROCESSED"); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "label", 14);
            i0.ɵɵtext(19, "Unprocessed transactions");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "span", 12);
            i0.ɵɵtext(21, "Transaction records that are still unprocessed by staff.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(22, "div", 9)(23, "input", 15);
            i0.ɵɵlistener("click", function ReportsComponent_Template_input_click_23_listener() { return ctx.validateDates("PROCESSED_UNALLOCATED"); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "label", 16);
            i0.ɵɵtext(25, "Processed unallocated");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(26, "span", 12);
            i0.ɵɵtext(27, "Payments that are marked as \u2018Unidentified\u2019 or \u2018Transferred\u2019 (Unsolicited requests)");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(28, "div", 9)(29, "input", 17);
            i0.ɵɵlistener("click", function ReportsComponent_Template_input_click_29_listener() { return ctx.validateDates("SURPLUS_AND_SHORTFALL"); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(30, "label", 18);
            i0.ɵɵtext(31, "Under payment and Over payment");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "span", 12);
            i0.ɵɵtext(33, "Requests where balances are marked as Under payment/Over payment further case management. E.g: Refund approval, Customer contact");
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(34, ReportsComponent_div_34_Template, 6, 0, "div", 19);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(35, "div", 7)(36, "div", 20)(37, "label", 21);
            i0.ɵɵtext(38, "Date from");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(39, "input", 22);
            i0.ɵɵlistener("change", function ReportsComponent_Template_input_change_39_listener() { return ctx.getSelectedFromDate(); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(40, "div", 23)(41, "label", 24);
            i0.ɵɵtext(42, "Date to");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(43, "input", 25);
            i0.ɵɵlistener("change", function ReportsComponent_Template_input_change_43_listener() { return ctx.getSelectedFromDate(); });
            i0.ɵɵelementEnd()()();
            i0.ɵɵtemplate(44, ReportsComponent_p_44_Template, 4, 3, "p", 26);
            i0.ɵɵelementStart(45, "div", 27)(46, "button", 28);
            i0.ɵɵlistener("click", function ReportsComponent_Template_button_click_46_listener() { return ctx.downloadReport(); });
            i0.ɵɵtext(47, "Download report");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngIf", ctx.errorMessage.showError);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("formGroup", ctx.reportsForm);
            i0.ɵɵadvance(27);
            i0.ɵɵproperty("ngIf", ctx.ISPAYMENTSTATUSENABLED);
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("max", ctx.getToday());
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("max", ctx.getToday());
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.isStartDateLesthanEndDate || ctx.isDateRangeBetnWeek || ctx.isDateBetwnMonth);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.reportsForm.valid || ctx.isDownLoadButtondisabled || ctx.isStartDateLesthanEndDate || ctx.isDateRangeBetnWeek);
        } }, dependencies: [i6.NgIf, i3.ɵNgNoValidate, i3.DefaultValueAccessor, i3.RadioControlValueAccessor, i3.NgControlStatus, i3.NgControlStatusGroup, i3.RequiredValidator, i3.FormGroupDirective, i3.FormControlName, i7.ErrorBannerComponent], styles: [".govuk-radios__input[_ngcontent-%COMP%]:focus + .govuk-radios__label[_ngcontent-%COMP%]:before{border-width:4px;box-shadow:0 0 0 4px #ffaf00}.datefrom[_ngcontent-%COMP%]{width:50%;float:left}.dateto[_ngcontent-%COMP%]{width:50%;float:right}.govuk-label--m[_ngcontent-%COMP%]{font-size:large}.form-hint[_ngcontent-%COMP%]{padding-left:.7em}.header[_ngcontent-%COMP%]{margin-top:10px;margin-bottom:15px}.btnsubmit[_ngcontent-%COMP%]{margin-bottom:30px}.inline-error-message[_ngcontent-%COMP%]{color:#a71414;font-weight:700;margin-top:10px}"] });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ReportsComponent, [{
        type: Component,
        args: [{ selector: 'ccpay-reports', template: "<div class=\"header\">\n      <input #myInput type='hidden' class='iFrameDrivenImageValue' value='REPORTS'>\n      <ccpay-error-banner *ngIf=\"errorMessage.showError\" [errorMessage]=\"errorMessage\"></ccpay-error-banner>\n      <legend class=\"govuk-fieldset__legend--xl\">\n         <h1 class=\"govuk-fieldset__heading\"> Choose the report type and date range</h1>\n      </legend>\n</div>\n<form [formGroup]=\"reportsForm\">\n     <div  class=\"govuk-form-group\">\n        <div class=\"govuk-radios govuk-radios--conditional\" data-module=\"govuk-radios\">\n          <div  class=\"govuk-radios__item\">\n              <input \n              required\n              id=\"DataLoss\"\n              class=\"govuk-radios__input\"\n              formControlName=\"selectedreport\"\n              (click)=\"validateDates('DATA_LOSS')\"\n              name=\"selectedreport\"\n              type=\"radio\"\n              value=\"DATA_LOSS\" \n               data-aria-controls=\"DataLoss\"/>\n              <label class=\"govuk-label govuk-radios__label govuk-label--m\" for=\"DataLoss\">Data loss</label>\n              <span class=\"form-hint\">Missing transactions where data has been received from only either of Exela or Bulk scan</span>\n          </div>\n\n         <div class=\"govuk-radios__item\">\n              <input \n              id=\"UnprocessedTransactions\"\n              class=\"govuk-radios__input\"\n              formControlName=\"selectedreport\"\n              (click)=\"validateDates('UNPROCESSED')\"\n              name=\"selectedreport\"\n              type=\"radio\"\n              value=\"UNPROCESSED\" \n              data-aria-controls=\"UnprocessedTransactions\"/>\n              <label class=\"govuk-label govuk-radios__label govuk-label--m\" for=\"UnprocessedTransactions\">Unprocessed transactions</label>\n              <span class=\"form-hint\">Transaction records that are still unprocessed by staff.</span>\n         </div>\n\n         <div class=\"govuk-radios__item\">\n            <input \n            id=\"ProcessedUnallocated\"\n            class=\"govuk-radios__input\"\n            formControlName=\"selectedreport\"\n            name=\"selectedreport\"\n            (click)=\"validateDates('PROCESSED_UNALLOCATED')\"\n            type=\"radio\"\n            value=\"PROCESSED_UNALLOCATED\" \n            data-aria-controls=\"ProcessedUnallocated\"/>\n            <label class=\"govuk-label govuk-radios__label govuk-label--m\" for=\"ProcessedUnallocated\">Processed unallocated</label>\n            <span class=\"form-hint\">Payments that are marked as \u2018Unidentified\u2019 or \u2018Transferred\u2019 (Unsolicited requests)</span>\n         </div>\n\n         <div class=\"govuk-radios__item\">\n            <input \n            id=\"ShortfallsandSurplus\"\n            class=\"govuk-radios__input\"\n            formControlName=\"selectedreport\"\n            name=\"selectedreport\"\n            (click)=\"validateDates('SURPLUS_AND_SHORTFALL')\"\n            type=\"radio\"\n            value=\"SURPLUS_AND_SHORTFALL\" \n            data-aria-controls=\"ShortfallsandSurplus\"/>\n            <label class=\"govuk-label govuk-radios__label govuk-label--m\" for=\"ShortfallsandSurplus\">Under payment and Over payment</label>\n            <span class=\"form-hint\">Requests where balances are marked as Under payment/Over payment further case management.\n               E.g: Refund approval, Customer contact</span>\n         </div>\n         <div class=\"govuk-radios__item\" *ngIf=\"ISPAYMENTSTATUSENABLED\">\n            <input \n            id=\"PaymentFailureEvent\"\n            class=\"govuk-radios__input\"\n            formControlName=\"selectedreport\"\n            name=\"selectedreport\"\n            (click)=\"validateDates('PAYMENT_FAILURE_EVENT')\"\n            type=\"radio\"\n            value=\"PAYMENT_FAILURE_EVENT\" \n            data-aria-controls=\"PaymentFailureEvent\"/>\n            <label class=\"govuk-label govuk-radios__label govuk-label--m\" for=\"PaymentFailureEvent\">Payment failure event</label>\n            <span class=\"form-hint\">Failed payment transaction details</span>\n         </div>\n       </div>\n     </div>\n     <div  class=\"govuk-form-group\">\n      <div class=\"datefrom\">\n      <label class=\"govuk-label govuk-radios__label govuk-label--m\" for=\"date-from\">Date from</label>\n      <input (change)=\"getSelectedFromDate()\" [max]=\"getToday()\" class=\"form-control\" id=\"date-from\" name=\"date-from\" type=\"date\"  formControlName=\"startDate\" required/>\n      </div>\n\n      <div class=\"dateto\">\n      <label class=\"govuk-label govuk-radios__label govuk-label--m\" for=\"date-to\">Date to</label>\n      <input (change)=\"getSelectedFromDate()\" [max]=\"getToday()\" class=\"form-control\" id=\"date-to\" name=\"search\" type=\"date\" formControlName=\"endDate\" required/>\n      </div>\n     </div>\n   <p class=\"inline-error-message\" *ngIf=\"isStartDateLesthanEndDate || isDateRangeBetnWeek || isDateBetwnMonth\">\n      <span *ngIf=\"isStartDateLesthanEndDate\">Please select 'Date From' less than or equal to 'Date To'</span>\n      <span *ngIf=\"isDateRangeBetnWeek\"> Please select the date range between 7 days</span>\n      <span *ngIf=\"isDateBetwnMonth\"> Please select the date range between 30 days</span>\n   </p>\n    <div class=\"btnsubmit\">\n     <button type=\"submit\" (click)=\"downloadReport()\" class=\"button\" [disabled]=\"!reportsForm.valid || isDownLoadButtondisabled || isStartDateLesthanEndDate || isDateRangeBetnWeek\">Download report</button>\n   </div>\n </form>\n    \n", styles: [".govuk-radios__input:focus+.govuk-radios__label:before{border-width:4px;box-shadow:0 0 0 4px #ffaf00}.datefrom{width:50%;float:left}.dateto{width:50%;float:right}.govuk-label--m{font-size:large}.form-hint{padding-left:.7em}.header{margin-top:10px;margin-bottom:15px}.btnsubmit{margin-bottom:30px}.inline-error-message{color:#a71414;font-weight:700;margin-top:10px}\n"] }]
    }], function () { return [{ type: i1.XlFileService }, { type: i2.ErrorHandlerService }, { type: i3.FormBuilder }, { type: i4.BulkScaningPaymentService }, { type: i5.PaymentViewService }]; }, { ISPAYMENTSTATUSENABLED: [{
            type: Input
        }] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0cy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wYXltZW50LWxpYi9zcmMvbGliL2NvbXBvbmVudHMvcmVwb3J0cy9yZXBvcnRzLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BheW1lbnQtbGliL3NyYy9saWIvY29tcG9uZW50cy9yZXBvcnRzL3JlcG9ydHMuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFDekQsT0FBTyxFQUFFLFdBQVcsRUFBYSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFN0MsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sa0VBQWtFLENBQUM7QUFDN0csT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDbEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDdEYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHdDQUF3QyxDQUFDOzs7Ozs7Ozs7O0lDTC9ELHlDQUFzRzs7O0lBQW5ELGtEQUE2Qjs7OztJQWlFN0UsOEJBQStELGdCQUFBO0lBTTVELDZKQUFTLGVBQUEscUJBQWMsdUJBQXVCLENBQUMsQ0FBQSxJQUFDO0lBTGhELGlCQVEwQztJQUMxQyxpQ0FBd0Y7SUFBQSxxQ0FBcUI7SUFBQSxpQkFBUTtJQUNySCxnQ0FBd0I7SUFBQSxrREFBa0M7SUFBQSxpQkFBTyxFQUFBOzs7SUFnQnZFLDRCQUF3QztJQUFBLHlFQUF5RDtJQUFBLGlCQUFPOzs7SUFDeEcsNEJBQWtDO0lBQUMsNERBQTJDO0lBQUEsaUJBQU87OztJQUNyRiw0QkFBK0I7SUFBQyw2REFBNEM7SUFB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VSx5QkFBcUIsSUFBQztZQUF2QyxpQkFBMkosRUFBQSxFQUFBO1lBRzlKLGdFQUlJO1lBQ0gsZ0NBQXVCLGtCQUFBO1lBQ0EsOEZBQVMsb0JBQWdCLElBQUM7WUFBZ0ksZ0NBQWU7WUFBQSxpQkFBUyxFQUFBLEVBQUE7O1lBakdsTCxlQUE0QjtZQUE1QixpREFBNEI7WUFLakQsZUFBeUI7WUFBekIsMkNBQXlCO1lBNERXLGdCQUE0QjtZQUE1QixpREFBNEI7WUFrQnhCLGVBQWtCO1lBQWxCLG9DQUFrQjtZQUtsQixlQUFrQjtZQUFsQixvQ0FBa0I7WUFHNUIsZUFBMEU7WUFBMUUsdUdBQTBFO1lBTXpDLGVBQStHO1lBQS9HLDZJQUErRzs7O3VGRHBGdkssZ0JBQWdCO2NBTDVCLFNBQVM7MkJBQ0UsZUFBZTtxTUFLaEIsc0JBQXNCO2tCQUE5QixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGb3JtQnVpbGRlciwgRm9ybUdyb3VwLCBGb3JtQ29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IGZvcm1hdERhdGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCI7XG5pbXBvcnQge0lQYXltZW50R3JvdXB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvSVBheW1lbnRHcm91cCc7XG5pbXBvcnQgeyBCdWxrU2NhbmluZ1BheW1lbnRTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvYnVsay1zY2FuaW5nLXBheW1lbnQvYnVsay1zY2FuaW5nLXBheW1lbnQuc2VydmljZSc7XG5pbXBvcnQgeyBFcnJvckhhbmRsZXJTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvc2hhcmVkL2Vycm9yLWhhbmRsZXIuc2VydmljZSc7XG5pbXBvcnQgeyBQYXltZW50Vmlld1NlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9wYXltZW50LXZpZXcvcGF5bWVudC12aWV3LnNlcnZpY2UnO1xuaW1wb3J0IHtYbEZpbGVTZXJ2aWNlfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy94bC1maWxlL3hsLWZpbGUuc2VydmljZSc7XG5pbXBvcnQgeyBGaW5kVmFsdWVTdWJzY3JpYmVyIH0gZnJvbSAncnhqcy9pbnRlcm5hbC9vcGVyYXRvcnMvZmluZCc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2NjcGF5LXJlcG9ydHMnLFxuICB0ZW1wbGF0ZVVybDogJy4vcmVwb3J0cy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3JlcG9ydHMuY29tcG9uZW50LnNjc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBSZXBvcnRzQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQElucHV0KCkgSVNQQVlNRU5UU1RBVFVTRU5BQkxFRDogc3RyaW5nO1xuICBmbXQgPSAnZGQvTU0veXl5eSc7XG4gIGxvYyA9ICdlbi1VUyc7XG4gIHJlcG9ydHNGb3JtOiBGb3JtR3JvdXA7XG4gIHN0YXJ0RGF0ZTogc3RyaW5nO1xuICBlbmREYXRlOiBzdHJpbmc7XG4gIGVycm9yTWVhYWdzZTogc3RyaW5nO1xuICBjY2RDYXNlTnVtYmVyOiBzdHJpbmc7XG4gIGlzRG93bkxvYWRCdXR0b25kaXNhYmxlZDpCb29sZWFuID0gZmFsc2U7XG4gIGlzU3RhcnREYXRlTGVzdGhhbkVuZERhdGU6IEJvb2xlYW4gPSBmYWxzZTtcbiAgaXNEYXRlQmV0d25Nb250aDogQm9vbGVhbiA9IGZhbHNlO1xuICBpc0RhdGVSYW5nZUJldG5XZWVrOiBCb29sZWFuID0gZmFsc2U7XG4gIC8vZXJyb3JNZXNzYWdlID0gdGhpcy5lcnJvckhhbmRsZXJTZXJ2aWNlLmdldFNlcnZlckVycm9yTWVzc2FnZShmYWxzZSwgZmFsc2UsICcnKTtcbiAgZXJyb3JNZXNzYWdlID0gbnVsbDtcbiAgcGF5bWVudEdyb3VwczogSVBheW1lbnRHcm91cFtdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSB4bEZpbGVTZXJ2aWNlOiBYbEZpbGVTZXJ2aWNlLFxuICAgIHByaXZhdGUgZXJyb3JIYW5kbGVyU2VydmljZTogRXJyb3JIYW5kbGVyU2VydmljZSxcbiAgICBwcml2YXRlIGZvcm1CdWlsZGVyOiBGb3JtQnVpbGRlcixcbiAgICBwcml2YXRlIGJ1bGtTY2FuaW5nUGF5bWVudFNlcnZpY2U6IEJ1bGtTY2FuaW5nUGF5bWVudFNlcnZpY2UsXG4gICAgcHJpdmF0ZSBwYXltZW50Vmlld1NlcnZpY2U6IFBheW1lbnRWaWV3U2VydmljZSkgeyB9XG5cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLmZyb21WYWxpZGF0aW9uKCk7XG5cbiAgIH1cblxuICBnZXRUb2RheSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXTtcbiB9XG5cbiBnZXRTZWxlY3RlZEZyb21EYXRlKCk6IHZvaWQge1xuIHRoaXMudmFsaWRhdGVEYXRlcyh0aGlzLnJlcG9ydHNGb3JtLmdldCgnc2VsZWN0ZWRyZXBvcnQnKS52YWx1ZSk7XG4gfVxuXG4gdmFsaWRhdGVEYXRlcyhyZXBvcnROYW1lKXtcbiAgY29uc3Qgc2VsZWN0ZWRTdGFydERhdGUgPSB0aGlzLnRyYW5mb3JtRGF0ZSh0aGlzLnJlcG9ydHNGb3JtLmdldCgnc3RhcnREYXRlJykudmFsdWUpLFxuICAgIHNlbGVjdGVkRW5kRGF0ZSA9IHRoaXMudHJhbmZvcm1EYXRlKHRoaXMucmVwb3J0c0Zvcm0uZ2V0KCdlbmREYXRlJykudmFsdWUpO1xuICBjb25zdCBpc0RhdGVSYW5nZU1vcmVUaGFuV2VlayA9ICg8YW55Pm5ldyBEYXRlKHNlbGVjdGVkU3RhcnREYXRlKSAtIDxhbnk+bmV3IERhdGUoc2VsZWN0ZWRFbmREYXRlKSkvKDEwMDAgKiAzNjAwICogLTI0KSA+IDc7XG4gIGNvbnN0IGlzRGF0ZVJhbmdlTW9yZVRoYW5Nb250aCA9ICg8YW55Pm5ldyBEYXRlKHNlbGVjdGVkU3RhcnREYXRlKSAtIDxhbnk+bmV3IERhdGUoc2VsZWN0ZWRFbmREYXRlKSkvKDEwMDAgKiAzNjAwICogLTI0KSA+IDMwO1xuICBpZihuZXcgRGF0ZShzZWxlY3RlZFN0YXJ0RGF0ZSkgPiBuZXcgRGF0ZShzZWxlY3RlZEVuZERhdGUpICYmIHNlbGVjdGVkRW5kRGF0ZSAhPT0gJycpe1xuICAgIHRoaXMucmVwb3J0c0Zvcm0uZ2V0KCdzdGFydERhdGUnKS5zZXRWYWx1ZSgnJyk7XG4gICAgdGhpcy5pc0RhdGVSYW5nZUJldG5XZWVrID0gZmFsc2U7XG4gICAgdGhpcy5pc0RhdGVCZXR3bk1vbnRoID0gZmFsc2U7XG4gICAgdGhpcy5pc1N0YXJ0RGF0ZUxlc3RoYW5FbmREYXRlID0gdHJ1ZTtcbiAgfSBlbHNlIGlmKHJlcG9ydE5hbWUgJiYgcmVwb3J0TmFtZSA9PT0nU1VSUExVU19BTkRfU0hPUlRGQUxMJyAmJiBpc0RhdGVSYW5nZU1vcmVUaGFuV2VlayApIHtcbiAgICB0aGlzLmlzRGF0ZVJhbmdlQmV0bldlZWsgPSB0cnVlO1xuICAgIHRoaXMuaXNEYXRlQmV0d25Nb250aCA9IGZhbHNlO1xuICAgIHRoaXMuaXNTdGFydERhdGVMZXN0aGFuRW5kRGF0ZSA9IGZhbHNlO1xuICB9IGVsc2UgaWYocmVwb3J0TmFtZSAmJiByZXBvcnROYW1lID09PSdQQVlNRU5UX0ZBSUxVUkVfRVZFTlQnICYmIGlzRGF0ZVJhbmdlTW9yZVRoYW5Nb250aCApIHtcbiAgICB0aGlzLmlzRGF0ZVJhbmdlQmV0bldlZWsgPSBmYWxzZTtcbiAgICB0aGlzLmlzRGF0ZUJldHduTW9udGggPSB0cnVlO1xuICAgIHRoaXMuaXNTdGFydERhdGVMZXN0aGFuRW5kRGF0ZSA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuaXNEYXRlQmV0d25Nb250aCA9IGZhbHNlO1xuICAgIHRoaXMuaXNEYXRlUmFuZ2VCZXRuV2VlayA9IGZhbHNlO1xuICAgIHRoaXMuaXNTdGFydERhdGVMZXN0aGFuRW5kRGF0ZSA9IGZhbHNlO1xuICB9XG5cbiB9XG5cbiAgZnJvbVZhbGlkYXRpb24oKSB7XG4gICAgdGhpcy5yZXBvcnRzRm9ybSA9IHRoaXMuZm9ybUJ1aWxkZXIuZ3JvdXAoe1xuICAgICAgc2VsZWN0ZWRyZXBvcnQ6IG5ldyBGb3JtQ29udHJvbCgnJykgLFxuICAgICAgc3RhcnREYXRlOiBuZXcgRm9ybUNvbnRyb2woJycpLFxuICAgICAgZW5kRGF0ZTogbmV3IEZvcm1Db250cm9sKCcnKVxuICAgIH0pO1xufVxuXG5kb3dubG9hZFJlcG9ydCgpe1xuICB0aGlzLmlzRG93bkxvYWRCdXR0b25kaXNhYmxlZCA9IHRydWU7XG4gIGNvbnN0IGRhdGFMb3NzUnB0RGVmYXVsdCA9IFt7bG9zc19yZXNwOicnLHBheW1lbnRfYXNzZXRfZGNuOicnLGVudl9yZWY6JycsZW52X2l0ZW06JycscmVzcF9zZXJ2aWNlX2lkOicnLHJlc3Bfc2VydmljZV9uYW1lOicnLGRhdGVfYmFua2VkOicnLGJnY19iYXRjaDonJyxwYXltZW50X21ldGhvZDonJyxhbW91bnQ6Jyd9XSxcbiAgICB1blByb2Nlc3NlZFJwdERlZmF1bHQgPSBbe3Jlc3Bfc2VydmljZV9pZDonJyxyZXNwX3NlcnZpY2VfbmFtZTonJyxleGNlcHRpb25fcmVmOicnLGNjZF9yZWY6JycsZGF0ZV9iYW5rZWQ6JycsYmdjX2JhdGNoOicnLHBheW1lbnRfYXNzZXRfZGNuOicnLGVudl9yZWY6JycsZW52X2l0ZW06JycscGF5bWVudF9tZXRob2Q6JycsYW1vdW50OicnfV0sXG4gICAgcHJvY2Vzc2VkVW5hbGxvY2F0ZWQgPVt7cmVzcF9zZXJ2aWNlX2lkOicnLHJlc3Bfc2VydmljZV9uYW1lOicnLGFsbG9jYXRpb25fc3RhdHVzOicnLHJlY2VpdmluZ19vZmZpY2U6JycsYWxsb2NhdGlvbl9yZWFzb246JycsY2NkX2V4Y2VwdGlvbl9yZWY6JycsY2NkX2Nhc2VfcmVmOicnLHBheW1lbnRfYXNzZXRfZGNuOicnLGVudl9yZWY6JycsZW52X2l0ZW06JycsZGF0ZV9iYW5rZWQ6JycsYmdjX2JhdGNoOicnLHBheW1lbnRfbWV0aG9kOicnLGFtb3VudDonJyx1cGRhdGVkX2J5OicnfV0sXG4gICAgc2hvcnRGYWxsc1JwdERlZmF1bHQgPSBbe3Jlc3Bfc2VydmljZV9pZDonJyxyZXNwX3NlcnZpY2VfbmFtZTonJyxzdXJwbHVzX3Nob3J0ZmFsbDonJyxiYWxhbmNlOicnLHBheW1lbnRfYW1vdW50OicnLGNjZF9jYXNlX3JlZmVyZW5jZTonJyxjY2RfZXhjZXB0aW9uX3JlZmVyZW5jZTonJyxwcm9jZXNzZWRfZGF0ZTonJywgcmVhc29uOicnLCBleHBsYW5hdGlvbjonJywgdXNlcl9uYW1lOicnfV0sXG4gICAgc2VsZWN0ZWRSZXBvcnROYW1lID0gdGhpcy5yZXBvcnRzRm9ybS5nZXQoJ3NlbGVjdGVkcmVwb3J0JykudmFsdWUsXG4gICAgc2VsZWN0ZWRTdGFydERhdGUgPSB0aGlzLnRyYW5mb3JtRGF0ZSh0aGlzLnJlcG9ydHNGb3JtLmdldCgnc3RhcnREYXRlJykudmFsdWUpLFxuICAgIHNlbGVjdGVkRW5kRGF0ZSA9IHRoaXMudHJhbmZvcm1EYXRlKHRoaXMucmVwb3J0c0Zvcm0uZ2V0KCdlbmREYXRlJykudmFsdWUpO1xuXG4gICAgaWYoc2VsZWN0ZWRSZXBvcnROYW1lID09PSAnUFJPQ0VTU0VEX1VOQUxMT0NBVEVEJyB8fCBzZWxlY3RlZFJlcG9ydE5hbWUgPT09ICdTVVJQTFVTX0FORF9TSE9SVEZBTEwnICl7XG4gICAgICB0aGlzLnBheW1lbnRWaWV3U2VydmljZS5kb3dubG9hZFNlbGVjdGVkUmVwb3J0KHNlbGVjdGVkUmVwb3J0TmFtZSxzZWxlY3RlZFN0YXJ0RGF0ZSxzZWxlY3RlZEVuZERhdGUpLnN1YnNjcmliZShcbiAgICAgICAgcmVzcG9uc2UgPT4gIHtcbiAgICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IHRoaXMuZXJyb3JIYW5kbGVyU2VydmljZS5nZXRTZXJ2ZXJFcnJvck1lc3NhZ2UoZmFsc2UsIGZhbHNlLCAnJyk7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZSk7XG4gICAgICAgICAgbGV0IHJlcz0ge2RhdGE6IHRoaXMuYXBwbHlEYXRlRm9ybWF0KHJlc3VsdCl9O1xuICAgICAgICAgIGlmKHJlc1snZGF0YSddLmxlbmd0aCA9PT0gMCAmJiBzZWxlY3RlZFJlcG9ydE5hbWUgPT09ICdQUk9DRVNTRURfVU5BTExPQ0FURUQnICl7XG4gICAgICAgICAgICByZXMuZGF0YT0gcHJvY2Vzc2VkVW5hbGxvY2F0ZWQ7XG4gICAgICAgICAgfSBlbHNlIGlmKHJlc1snZGF0YSddLmxlbmd0aCA9PT0gMCAmJiBzZWxlY3RlZFJlcG9ydE5hbWUgPT09ICdTVVJQTFVTX0FORF9TSE9SVEZBTEwnICkge1xuICAgICAgICAgICAgcmVzLmRhdGE9IHNob3J0RmFsbHNScHREZWZhdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihyZXN1bHRbJ2RhdGEnXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IoIHZhciBpPTA7IGk8IHJlc1snZGF0YSddLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGlmKHJlc1snZGF0YSddW2ldW1wicGF5bWVudF9hc3NldF9kY25cIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlc1snZGF0YSddW2ldWydlbnZfcmVmJ10gPSByZXNbJ2RhdGEnXVtpXVtcInBheW1lbnRfYXNzZXRfZGNuXCJdLnN1YnN0cigwLDEzKTtcbiAgICAgICAgICAgICAgICByZXNbJ2RhdGEnXVtpXVsnZW52X2l0ZW0nXSA9IHJlc1snZGF0YSddW2ldW1wicGF5bWVudF9hc3NldF9kY25cIl0uc3Vic3RyKDEzLDIxKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZihyZXNbJ2RhdGEnXVtpXVtcImFtb3VudFwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVzWydkYXRhJ11baV1bJ2Ftb3VudCddID0gdGhpcy5jb252ZXJ0VG9GbG9hdFZhbHVlKHJlc1snZGF0YSddW2ldWydhbW91bnQnXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYocmVzWydkYXRhJ11baV1bXCJiYWxhbmNlXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNbJ2RhdGEnXVtpXVsnYmFsYW5jZSddID0gdGhpcy5jb252ZXJ0VG9GbG9hdFZhbHVlKHJlc1snZGF0YSddW2ldW1wiYmFsYW5jZVwiXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbGV0IE9wID0gcmVzWydkYXRhJ11baV1bXCJzdXJwbHVzX3Nob3J0ZmFsbFwiXTtcbiAgICAgICAgICAgICAgaWYoT3AgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlc1snZGF0YSddW2ldWydzdXJwbHVzX3Nob3J0ZmFsbCddID0gT3AgPT1cIlN1cnBsdXNcIiA/IFwiT3ZlciBwYXltZW50XCI6XCJVbmRlciBwYXltZW50XCI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYocmVzWydkYXRhJ11baV1bXCJwYXltZW50X2Ftb3VudFwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVzWydkYXRhJ11baV1bJ3BheW1lbnRfYW1vdW50J10gPSB0aGlzLmNvbnZlcnRUb0Zsb2F0VmFsdWUocmVzWydkYXRhJ11baV1bJ3BheW1lbnRfYW1vdW50J10pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuaXNEb3duTG9hZEJ1dHRvbmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy54bEZpbGVTZXJ2aWNlLmV4cG9ydEFzRXhjZWxGaWxlKHJlc1snZGF0YSddLCB0aGlzLmdldEZpbGVOYW1lKHRoaXMucmVwb3J0c0Zvcm0uZ2V0KCdzZWxlY3RlZHJlcG9ydCcpLnZhbHVlLCBzZWxlY3RlZFN0YXJ0RGF0ZSwgc2VsZWN0ZWRFbmREYXRlKSk7XG4gICAgICAgIH0sXG4gICAgICAgIChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgdGhpcy5pc0Rvd25Mb2FkQnV0dG9uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IHRoaXMuZXJyb3JIYW5kbGVyU2VydmljZS5nZXRTZXJ2ZXJFcnJvck1lc3NhZ2UodHJ1ZSwgZmFsc2UsICcnKTtcbiAgICAgICAgfSlcblxuICAgIH0gZWxzZSBpZihzZWxlY3RlZFJlcG9ydE5hbWUgPT09ICdQQVlNRU5UX0ZBSUxVUkVfRVZFTlQnKSB7XG5cbiAgICAgIHRoaXMucGF5bWVudFZpZXdTZXJ2aWNlLmRvd25sb2FkRmFpbHVyZVJlcG9ydChzZWxlY3RlZFN0YXJ0RGF0ZSxzZWxlY3RlZEVuZERhdGUpLnN1YnNjcmliZShcbiAgICAgICAgcmVzcG9uc2UgPT4gIHtcbiAgICAgICAgICB0aGlzLmVycm9yTWVzc2FnZSA9IHRoaXMuZXJyb3JIYW5kbGVyU2VydmljZS5nZXRTZXJ2ZXJFcnJvck1lc3NhZ2UoZmFsc2UsIGZhbHNlLCAnJyk7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0ge2RhdGE6IEpTT04ucGFyc2UocmVzcG9uc2UpWydwYXltZW50X2ZhaWx1cmVfcmVwb3J0X2xpc3QnXX07XG4gICAgICAgICAgbGV0IHJlcyA9IHtkYXRhOiB0aGlzLmFwcGx5RGF0ZUZvcm1hdChyZXN1bHQpfTtcbiAgICAgICAgICBpZiAocmVzdWx0WydkYXRhJ10ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yICggdmFyIGk9MDsgaTwgcmVzWydkYXRhJ10ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgaWYgKHJlc1snZGF0YSddW2ldW1wiZGlzcHV0ZWRfYW1vdW50XCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNbJ2RhdGEnXVtpXVsnZGlzcHV0ZWRfYW1vdW50J10gPSB0aGlzLmNvbnZlcnRUb0Zsb2F0VmFsdWUocmVzWydkYXRhJ11baV1bXCJkaXNwdXRlZF9hbW91bnRcIl0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChyZXNbJ2RhdGEnXVtpXVtcInJlcHJlc2VudG1lbnRfc3RhdHVzXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNbJ2RhdGEnXVtpXVsncmVwcmVzZW50bWVudF9zdGF0dXMnXSA9IHJlc1snZGF0YSddW2ldW1wicmVwcmVzZW50bWVudF9zdGF0dXNcIl0udG9Mb3dlckNhc2UoKSA9PT0gJ3llcycgPyAnU3VjY2VzcycgOiAnRmFpbHVyZSc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHJlc1snZGF0YSddW2ldWydyZXByZXNlbnRtZW50X3N0YXR1cyddID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNbJ2RhdGEnXVtpXVsncmVwcmVzZW50bWVudF9zdGF0dXMnXSA9ICdObyByZXByZXNlbnRtZW50IHJlY2VpdmVkJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAocmVzWydkYXRhJ11baV1bJ3JlcHJlc2VudG1lbnRfZGF0ZSddID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNbJ2RhdGEnXVtpXVsncmVwcmVzZW50bWVudF9kYXRlJ10gPSAnTi9BJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAocmVzWydkYXRhJ11baV1bJ3JlZnVuZF9yZWZlcmVuY2UnXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVzWydkYXRhJ11baV1bJ3JlZnVuZF9yZWZlcmVuY2UnXSA9ICdObyByZWZ1bmQgYXZhaWxhYmxlJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAocmVzWydkYXRhJ11baV1bJ3JlZnVuZF9hbW91bnQnXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVzWydkYXRhJ11baV1bJ3JlZnVuZF9hbW91bnQnXSA9ICdOL0EnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChyZXNbJ2RhdGEnXVtpXVsncmVmdW5kX2RhdGUnXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVzWydkYXRhJ11baV1bJ3JlZnVuZF9kYXRlJ10gPSAnTi9BJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAocmVzWydkYXRhJ11baV1bJ2RvY3VtZW50X2NvbnRyb2xfbnVtYmVyJ10gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlc1snZGF0YSddW2ldWydkb2N1bWVudF9jb250cm9sX251bWJlciddID0gJ04vQSc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5pc0Rvd25Mb2FkQnV0dG9uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLnhsRmlsZVNlcnZpY2UuZXhwb3J0QXNFeGNlbEZpbGUocmVzWydkYXRhJ10sIHRoaXMuZ2V0RmlsZU5hbWUodGhpcy5yZXBvcnRzRm9ybS5nZXQoJ3NlbGVjdGVkcmVwb3J0JykudmFsdWUsIHNlbGVjdGVkU3RhcnREYXRlLCBzZWxlY3RlZEVuZERhdGUgKSk7XG5cbiAgICAgICAgfSxcbiAgICAgICAgKGVycm9yOiBhbnkpID0+IHtcbiAgICAgICAgICB0aGlzLmlzRG93bkxvYWRCdXR0b25kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgIGNvbnN0IGVycm9yQ29udGVudCA9IGVycm9yLnJlcGxhY2UoL1teYS16QS1aIF0vZywgJycpLnRyaW0oKTtcbiAgICAgICAgICBjb25zdCBzdGF0dXNDb2RlID0gZXJyb3IucmVwbGFjZSgvW15hLXpBLVowLTkgXS9nLCAnJykudHJpbSgpLnNwbGl0KCcgJylbMF07XG4gICAgICAgICAgaWYoc3RhdHVzQ29kZSA9PT0gJzQwNCcpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JNZXNzYWdlID0gdGhpcy5lcnJvckhhbmRsZXJTZXJ2aWNlLmdldFNlcnZlckVycm9yTWVzc2FnZSh0cnVlLCB0cnVlLCBlcnJvckNvbnRlbnQpO1xuICAgICAgICAgIH1lbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JNZXNzYWdlID0gdGhpcy5lcnJvckhhbmRsZXJTZXJ2aWNlLmdldFNlcnZlckVycm9yTWVzc2FnZSh0cnVlLCBmYWxzZSwgJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1bGtTY2FuaW5nUGF5bWVudFNlcnZpY2UuZG93bmxvYWRTZWxlY3RlZFJlcG9ydChzZWxlY3RlZFJlcG9ydE5hbWUsc2VsZWN0ZWRTdGFydERhdGUsc2VsZWN0ZWRFbmREYXRlKS5zdWJzY3JpYmUoXG4gICAgICAgIHJlc3BvbnNlID0+ICB7XG4gICAgICAgICAgdGhpcy5lcnJvck1lc3NhZ2UgPSB0aGlzLmVycm9ySGFuZGxlclNlcnZpY2UuZ2V0U2VydmVyRXJyb3JNZXNzYWdlKGZhbHNlLCBmYWxzZSwgJycpO1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xuICAgICAgICAgIGxldCByZXMgPSB7ZGF0YTogdGhpcy5hcHBseURhdGVGb3JtYXQocmVzdWx0KX07XG4gICAgICAgICAgaWYocmVzWydkYXRhJ10ubGVuZ3RoID09PSAwICYmIHNlbGVjdGVkUmVwb3J0TmFtZSA9PT0gJ0RBVEFfTE9TUycgKXtcbiAgICAgICAgICAgIHJlcy5kYXRhPSBkYXRhTG9zc1JwdERlZmF1bHQ7XG4gICAgICAgICAgfSBlbHNlIGlmKHJlc1snZGF0YSddLmxlbmd0aCA9PT0gMCAmJiBzZWxlY3RlZFJlcG9ydE5hbWUgPT09ICdVTlBST0NFU1NFRCcpe1xuICAgICAgICAgICAgcmVzLmRhdGEgPSB1blByb2Nlc3NlZFJwdERlZmF1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKHJlc3VsdFsnZGF0YSddLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBmb3IoIHZhciBpPTA7IGk8IHJlc1snZGF0YSddLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZihyZXNbJ2RhdGEnXVtpXVtcImFtb3VudFwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHJlc1snZGF0YSddW2ldWydhbW91bnQnXSA9IHRoaXMuY29udmVydFRvRmxvYXRWYWx1ZShyZXNbJ2RhdGEnXVtpXVsnYW1vdW50J10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocmVzWydkYXRhJ11baV1bXCJwYXltZW50X2Fzc2V0X2RjblwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXNbJ2RhdGEnXVtpXVsnZW52X3JlZiddID0gcmVzWydkYXRhJ11baV1bXCJwYXltZW50X2Fzc2V0X2RjblwiXS5zdWJzdHIoMCwxMyk7XG4gICAgICAgICAgICByZXNbJ2RhdGEnXVtpXVsnZW52X2l0ZW0nXSA9IHJlc1snZGF0YSddW2ldW1wicGF5bWVudF9hc3NldF9kY25cIl0uc3Vic3RyKDEzLDIxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAgIHRoaXMuaXNEb3duTG9hZEJ1dHRvbmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy54bEZpbGVTZXJ2aWNlLmV4cG9ydEFzRXhjZWxGaWxlKHJlc1snZGF0YSddLCB0aGlzLmdldEZpbGVOYW1lKHRoaXMucmVwb3J0c0Zvcm0uZ2V0KCdzZWxlY3RlZHJlcG9ydCcpLnZhbHVlLCBzZWxlY3RlZFN0YXJ0RGF0ZSwgc2VsZWN0ZWRFbmREYXRlICkpO1xuICAgICAgICB9LFxuICAgICAgICAoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgIHRoaXMuaXNEb3duTG9hZEJ1dHRvbmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5lcnJvck1lc3NhZ2UgPSB0aGlzLmVycm9ySGFuZGxlclNlcnZpY2UuZ2V0U2VydmVyRXJyb3JNZXNzYWdlKHRydWUsIGZhbHNlLCAnJyk7XG4gICAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZ2V0RmlsZU5hbWUoc2VsZWN0ZWRPcHRpb246IHN0cmluZywgc3RhcnREYXRlOiBzdHJpbmcsIGVuZERhdGU6IHN0cmluZyApIHtcbiAgICBjb25zdCBsb2MgPSAnZW4tVVMnLFxuICAgICAgc3REdCA9IGZvcm1hdERhdGUoc3RhcnREYXRlLCAnZGRNTXl5JywgbG9jKSxcbiAgICAgIGVuRHQgPSBmb3JtYXREYXRlKGVuZERhdGUsICdkZE1NeXknLCBsb2MpLFxuICAgICAgbm93ID0gbmV3IERhdGUoKSxcbiAgICAgIGN1cnJlbnREYXRlID0gZm9ybWF0RGF0ZShub3csICdkZE1NeXknLCBsb2MpLFxuICAgICAgdGltZXN0YW1wID0gYCR7Y3VycmVudERhdGV9XyR7dGhpcy5nZXRUd29kaWdpdChub3cuZ2V0SG91cnMoKSl9JHt0aGlzLmdldFR3b2RpZ2l0KG5vdy5nZXRNaW51dGVzKCkpfSR7dGhpcy5nZXRUd29kaWdpdChub3cuZ2V0U2Vjb25kcygpKX1gLFxuICAgICAgc2VsZWN0ZWRPcHRpb25UeHQgPSB0aGlzLmdldENhbWVsQ2FzZVN0cmluZyhzZWxlY3RlZE9wdGlvbik7XG5cbiAgICAgIHJldHVybiBzZWxlY3RlZE9wdGlvblR4dCsnXycrc3REdCsnX1RvXycrZW5EdCsnX1J1bl8nKyB0aW1lc3RhbXA7XG4gIH1cbiAgdHJhbmZvcm1EYXRlKHN0ckRhdGU6IHN0cmluZykge1xuICAgIGxldCByZXN1bHQgPSAnJztcbiAgICBpZiAoc3RyRGF0ZSkge1xuICAgICAgbGV0IHBhcnRzID0gc3RyRGF0ZS5zcGxpdCgnLScpO1xuICAgICAgcmVzdWx0ID0gYCR7cGFydHNbMV19LyR7cGFydHNbMl19LyR7cGFydHNbMF19YDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBnZXRUd29kaWdpdChpbnB1dDogbnVtYmVyKXtcbiAgICByZXR1cm4gKFwiMFwiICsgaW5wdXQpLnNsaWNlKC0yKTtcbiAgfVxuICBnZXRDYW1lbENhc2VTdHJpbmcoc2VsZWN0ZWRPcHRpb24pIHtcbiAgICBsZXQgcmVzdWx0O1xuICAgIHN3aXRjaChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgY2FzZSAnVU5QUk9DRVNTRUQnOiB7XG4gICAgICAgIHJlc3VsdCA9ICdVbnByb2Nlc3NlZCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnREFUQV9MT1NTJzoge1xuICAgICAgICByZXN1bHQgPSAnRGF0YV9Mb3NzJztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdQUk9DRVNTRURfVU5BTExPQ0FURUQnOiB7XG4gICAgICAgIHJlc3VsdCA9ICdQcm9jZXNzZWRfVW5hbGxvY2F0ZWQnO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ1NVUlBMVVNfQU5EX1NIT1JURkFMTCc6IHtcbiAgICAgICAgcmVzdWx0ID0gJ092ZXIgUGF5bWVudF9VbmRlciBQYXltZW50JztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdQQVlNRU5UX0ZBSUxVUkVfRVZFTlQnOiB7XG4gICAgICAgIHJlc3VsdCA9ICdQYXltZW50IGZhaWx1cmUgZXZlbnQnO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgcmVzdWx0ID0gc2VsZWN0ZWRPcHRpb247XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgfVxuICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBhcHBseURhdGVGb3JtYXQocmVzKSB7XG4gICAgcmV0dXJuIHJlc1snZGF0YSddLm1hcCh2YWx1ZSA9PiB7XG4gICAgICBpZiAodmFsdWVbJ2RhdGVfYmFua2VkJ10pIHtcbiAgICAgICAgdmFsdWVbJ2RhdGVfYmFua2VkJ10gPSBmb3JtYXREYXRlKHZhbHVlWydkYXRlX2JhbmtlZCddLCB0aGlzLmZtdCwgdGhpcy5sb2MpO1xuICAgICAgfVxuICAgICAgaWYgKHZhbHVlWydldmVudF9kYXRlJ10gJiYgdmFsdWVbJ2V2ZW50X2RhdGUnXS5pbmRleE9mKCcsJykgPT09IC0xKSB7XG4gICAgICAgIHZhbHVlWydldmVudF9kYXRlJ10gPSBmb3JtYXREYXRlKHZhbHVlWydldmVudF9kYXRlJ10sIHRoaXMuZm10LCB0aGlzLmxvYyk7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlWydldmVudF9kYXRlJ10gJiYgdmFsdWVbJ2V2ZW50X2RhdGUnXS5pbmRleE9mKCcsJykgIT09IC0xKSB7XG4gICAgICAgIHZhbHVlWydldmVudF9kYXRlJ10gPSB0aGlzLm11bHRpRGF0ZUZvcm1hdGVyKHZhbHVlWydldmVudF9kYXRlJ10pXG4gICAgICB9XG5cbiAgICAgIGlmICh2YWx1ZVsncmVwcmVzZW50bWVudF9kYXRlJ10gJiYgdmFsdWVbJ3JlcHJlc2VudG1lbnRfZGF0ZSddLmluZGV4T2YoJywnKSA9PT0gLTEpIHtcbiAgICAgICAgdmFsdWVbJ3JlcHJlc2VudG1lbnRfZGF0ZSddID0gZm9ybWF0RGF0ZSh2YWx1ZVsncmVwcmVzZW50bWVudF9kYXRlJ10sIHRoaXMuZm10LCB0aGlzLmxvYyk7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlWydyZXByZXNlbnRtZW50X2RhdGUnXSAmJiB2YWx1ZVsncmVwcmVzZW50bWVudF9kYXRlJ10uaW5kZXhPZignLCcpICE9PSAtMSkge1xuICAgICAgICB2YWx1ZVsncmVwcmVzZW50bWVudF9kYXRlJ10gPSB0aGlzLm11bHRpRGF0ZUZvcm1hdGVyKHZhbHVlWydyZXByZXNlbnRtZW50X2RhdGUnXSlcbiAgICAgIH1cblxuICAgICAgaWYgKHZhbHVlWydyZWZ1bmRfZGF0ZSddICYmIHZhbHVlWydyZWZ1bmRfZGF0ZSddLmluZGV4T2YoJywnKSA9PT0gLTEpIHtcbiAgICAgICAgdmFsdWVbJ3JlZnVuZF9kYXRlJ10gPSBmb3JtYXREYXRlKHZhbHVlWydyZWZ1bmRfZGF0ZSddLCB0aGlzLmZtdCwgdGhpcy5sb2MpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZVsncmVmdW5kX2RhdGUnXSAmJiB2YWx1ZVsncmVmdW5kX2RhdGUnXS5pbmRleE9mKCcsJykgIT09IC0xKSB7XG4gICAgICAgIHZhbHVlWydyZWZ1bmRfZGF0ZSddID0gdGhpcy5tdWx0aURhdGVGb3JtYXRlcih2YWx1ZVsncmVmdW5kX2RhdGUnXSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KTtcbiAgfVxuICBtdWx0aURhdGVGb3JtYXRlcihkYXRlU3RyKSB7XG4gICByZXR1cm4gZGF0ZVN0ci5zcGxpdCgnLCcpLm1hcCgoZGF0ZSkgPT4gZm9ybWF0RGF0ZShkYXRlLCB0aGlzLmZtdCwgdGhpcy5sb2MpKS5qb2luKCcsJyk7XG4gIH1cblxuICBjb252ZXJ0VG9GbG9hdFZhbHVlKGFtdCkge1xuICAgIHJldHVybiBhbXQgPyBOdW1iZXIucGFyc2VGbG9hdChhbXQpLnRvRml4ZWQoMik6ICcwLjAwJztcbiAgfVxufVxuIiwiPGRpdiBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgPGlucHV0ICNteUlucHV0IHR5cGU9J2hpZGRlbicgY2xhc3M9J2lGcmFtZURyaXZlbkltYWdlVmFsdWUnIHZhbHVlPSdSRVBPUlRTJz5cbiAgICAgIDxjY3BheS1lcnJvci1iYW5uZXIgKm5nSWY9XCJlcnJvck1lc3NhZ2Uuc2hvd0Vycm9yXCIgW2Vycm9yTWVzc2FnZV09XCJlcnJvck1lc3NhZ2VcIj48L2NjcGF5LWVycm9yLWJhbm5lcj5cbiAgICAgIDxsZWdlbmQgY2xhc3M9XCJnb3Z1ay1maWVsZHNldF9fbGVnZW5kLS14bFwiPlxuICAgICAgICAgPGgxIGNsYXNzPVwiZ292dWstZmllbGRzZXRfX2hlYWRpbmdcIj4gQ2hvb3NlIHRoZSByZXBvcnQgdHlwZSBhbmQgZGF0ZSByYW5nZTwvaDE+XG4gICAgICA8L2xlZ2VuZD5cbjwvZGl2PlxuPGZvcm0gW2Zvcm1Hcm91cF09XCJyZXBvcnRzRm9ybVwiPlxuICAgICA8ZGl2ICBjbGFzcz1cImdvdnVrLWZvcm0tZ3JvdXBcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImdvdnVrLXJhZGlvcyBnb3Z1ay1yYWRpb3MtLWNvbmRpdGlvbmFsXCIgZGF0YS1tb2R1bGU9XCJnb3Z1ay1yYWRpb3NcIj5cbiAgICAgICAgICA8ZGl2ICBjbGFzcz1cImdvdnVrLXJhZGlvc19faXRlbVwiPlxuICAgICAgICAgICAgICA8aW5wdXQgXG4gICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgIGlkPVwiRGF0YUxvc3NcIlxuICAgICAgICAgICAgICBjbGFzcz1cImdvdnVrLXJhZGlvc19faW5wdXRcIlxuICAgICAgICAgICAgICBmb3JtQ29udHJvbE5hbWU9XCJzZWxlY3RlZHJlcG9ydFwiXG4gICAgICAgICAgICAgIChjbGljayk9XCJ2YWxpZGF0ZURhdGVzKCdEQVRBX0xPU1MnKVwiXG4gICAgICAgICAgICAgIG5hbWU9XCJzZWxlY3RlZHJlcG9ydFwiXG4gICAgICAgICAgICAgIHR5cGU9XCJyYWRpb1wiXG4gICAgICAgICAgICAgIHZhbHVlPVwiREFUQV9MT1NTXCIgXG4gICAgICAgICAgICAgICBkYXRhLWFyaWEtY29udHJvbHM9XCJEYXRhTG9zc1wiLz5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwiZ292dWstbGFiZWwgZ292dWstcmFkaW9zX19sYWJlbCBnb3Z1ay1sYWJlbC0tbVwiIGZvcj1cIkRhdGFMb3NzXCI+RGF0YSBsb3NzPC9sYWJlbD5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLWhpbnRcIj5NaXNzaW5nIHRyYW5zYWN0aW9ucyB3aGVyZSBkYXRhIGhhcyBiZWVuIHJlY2VpdmVkIGZyb20gb25seSBlaXRoZXIgb2YgRXhlbGEgb3IgQnVsayBzY2FuPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICA8ZGl2IGNsYXNzPVwiZ292dWstcmFkaW9zX19pdGVtXCI+XG4gICAgICAgICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgICAgaWQ9XCJVbnByb2Nlc3NlZFRyYW5zYWN0aW9uc1wiXG4gICAgICAgICAgICAgIGNsYXNzPVwiZ292dWstcmFkaW9zX19pbnB1dFwiXG4gICAgICAgICAgICAgIGZvcm1Db250cm9sTmFtZT1cInNlbGVjdGVkcmVwb3J0XCJcbiAgICAgICAgICAgICAgKGNsaWNrKT1cInZhbGlkYXRlRGF0ZXMoJ1VOUFJPQ0VTU0VEJylcIlxuICAgICAgICAgICAgICBuYW1lPVwic2VsZWN0ZWRyZXBvcnRcIlxuICAgICAgICAgICAgICB0eXBlPVwicmFkaW9cIlxuICAgICAgICAgICAgICB2YWx1ZT1cIlVOUFJPQ0VTU0VEXCIgXG4gICAgICAgICAgICAgIGRhdGEtYXJpYS1jb250cm9scz1cIlVucHJvY2Vzc2VkVHJhbnNhY3Rpb25zXCIvPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJnb3Z1ay1sYWJlbCBnb3Z1ay1yYWRpb3NfX2xhYmVsIGdvdnVrLWxhYmVsLS1tXCIgZm9yPVwiVW5wcm9jZXNzZWRUcmFuc2FjdGlvbnNcIj5VbnByb2Nlc3NlZCB0cmFuc2FjdGlvbnM8L2xhYmVsPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0taGludFwiPlRyYW5zYWN0aW9uIHJlY29yZHMgdGhhdCBhcmUgc3RpbGwgdW5wcm9jZXNzZWQgYnkgc3RhZmYuPC9zcGFuPlxuICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgIDxkaXYgY2xhc3M9XCJnb3Z1ay1yYWRpb3NfX2l0ZW1cIj5cbiAgICAgICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgIGlkPVwiUHJvY2Vzc2VkVW5hbGxvY2F0ZWRcIlxuICAgICAgICAgICAgY2xhc3M9XCJnb3Z1ay1yYWRpb3NfX2lucHV0XCJcbiAgICAgICAgICAgIGZvcm1Db250cm9sTmFtZT1cInNlbGVjdGVkcmVwb3J0XCJcbiAgICAgICAgICAgIG5hbWU9XCJzZWxlY3RlZHJlcG9ydFwiXG4gICAgICAgICAgICAoY2xpY2spPVwidmFsaWRhdGVEYXRlcygnUFJPQ0VTU0VEX1VOQUxMT0NBVEVEJylcIlxuICAgICAgICAgICAgdHlwZT1cInJhZGlvXCJcbiAgICAgICAgICAgIHZhbHVlPVwiUFJPQ0VTU0VEX1VOQUxMT0NBVEVEXCIgXG4gICAgICAgICAgICBkYXRhLWFyaWEtY29udHJvbHM9XCJQcm9jZXNzZWRVbmFsbG9jYXRlZFwiLz5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImdvdnVrLWxhYmVsIGdvdnVrLXJhZGlvc19fbGFiZWwgZ292dWstbGFiZWwtLW1cIiBmb3I9XCJQcm9jZXNzZWRVbmFsbG9jYXRlZFwiPlByb2Nlc3NlZCB1bmFsbG9jYXRlZDwvbGFiZWw+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0taGludFwiPlBheW1lbnRzIHRoYXQgYXJlIG1hcmtlZCBhcyDigJhVbmlkZW50aWZpZWTigJkgb3Ig4oCYVHJhbnNmZXJyZWTigJkgKFVuc29saWNpdGVkIHJlcXVlc3RzKTwvc3Bhbj5cbiAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICA8ZGl2IGNsYXNzPVwiZ292dWstcmFkaW9zX19pdGVtXCI+XG4gICAgICAgICAgICA8aW5wdXQgXG4gICAgICAgICAgICBpZD1cIlNob3J0ZmFsbHNhbmRTdXJwbHVzXCJcbiAgICAgICAgICAgIGNsYXNzPVwiZ292dWstcmFkaW9zX19pbnB1dFwiXG4gICAgICAgICAgICBmb3JtQ29udHJvbE5hbWU9XCJzZWxlY3RlZHJlcG9ydFwiXG4gICAgICAgICAgICBuYW1lPVwic2VsZWN0ZWRyZXBvcnRcIlxuICAgICAgICAgICAgKGNsaWNrKT1cInZhbGlkYXRlRGF0ZXMoJ1NVUlBMVVNfQU5EX1NIT1JURkFMTCcpXCJcbiAgICAgICAgICAgIHR5cGU9XCJyYWRpb1wiXG4gICAgICAgICAgICB2YWx1ZT1cIlNVUlBMVVNfQU5EX1NIT1JURkFMTFwiIFxuICAgICAgICAgICAgZGF0YS1hcmlhLWNvbnRyb2xzPVwiU2hvcnRmYWxsc2FuZFN1cnBsdXNcIi8+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJnb3Z1ay1sYWJlbCBnb3Z1ay1yYWRpb3NfX2xhYmVsIGdvdnVrLWxhYmVsLS1tXCIgZm9yPVwiU2hvcnRmYWxsc2FuZFN1cnBsdXNcIj5VbmRlciBwYXltZW50IGFuZCBPdmVyIHBheW1lbnQ8L2xhYmVsPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb3JtLWhpbnRcIj5SZXF1ZXN0cyB3aGVyZSBiYWxhbmNlcyBhcmUgbWFya2VkIGFzIFVuZGVyIHBheW1lbnQvT3ZlciBwYXltZW50IGZ1cnRoZXIgY2FzZSBtYW5hZ2VtZW50LlxuICAgICAgICAgICAgICAgRS5nOiBSZWZ1bmQgYXBwcm92YWwsIEN1c3RvbWVyIGNvbnRhY3Q8L3NwYW4+XG4gICAgICAgICA8L2Rpdj5cbiAgICAgICAgIDxkaXYgY2xhc3M9XCJnb3Z1ay1yYWRpb3NfX2l0ZW1cIiAqbmdJZj1cIklTUEFZTUVOVFNUQVRVU0VOQUJMRURcIj5cbiAgICAgICAgICAgIDxpbnB1dCBcbiAgICAgICAgICAgIGlkPVwiUGF5bWVudEZhaWx1cmVFdmVudFwiXG4gICAgICAgICAgICBjbGFzcz1cImdvdnVrLXJhZGlvc19faW5wdXRcIlxuICAgICAgICAgICAgZm9ybUNvbnRyb2xOYW1lPVwic2VsZWN0ZWRyZXBvcnRcIlxuICAgICAgICAgICAgbmFtZT1cInNlbGVjdGVkcmVwb3J0XCJcbiAgICAgICAgICAgIChjbGljayk9XCJ2YWxpZGF0ZURhdGVzKCdQQVlNRU5UX0ZBSUxVUkVfRVZFTlQnKVwiXG4gICAgICAgICAgICB0eXBlPVwicmFkaW9cIlxuICAgICAgICAgICAgdmFsdWU9XCJQQVlNRU5UX0ZBSUxVUkVfRVZFTlRcIiBcbiAgICAgICAgICAgIGRhdGEtYXJpYS1jb250cm9scz1cIlBheW1lbnRGYWlsdXJlRXZlbnRcIi8+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJnb3Z1ay1sYWJlbCBnb3Z1ay1yYWRpb3NfX2xhYmVsIGdvdnVrLWxhYmVsLS1tXCIgZm9yPVwiUGF5bWVudEZhaWx1cmVFdmVudFwiPlBheW1lbnQgZmFpbHVyZSBldmVudDwvbGFiZWw+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvcm0taGludFwiPkZhaWxlZCBwYXltZW50IHRyYW5zYWN0aW9uIGRldGFpbHM8L3NwYW4+XG4gICAgICAgICA8L2Rpdj5cbiAgICAgICA8L2Rpdj5cbiAgICAgPC9kaXY+XG4gICAgIDxkaXYgIGNsYXNzPVwiZ292dWstZm9ybS1ncm91cFwiPlxuICAgICAgPGRpdiBjbGFzcz1cImRhdGVmcm9tXCI+XG4gICAgICA8bGFiZWwgY2xhc3M9XCJnb3Z1ay1sYWJlbCBnb3Z1ay1yYWRpb3NfX2xhYmVsIGdvdnVrLWxhYmVsLS1tXCIgZm9yPVwiZGF0ZS1mcm9tXCI+RGF0ZSBmcm9tPC9sYWJlbD5cbiAgICAgIDxpbnB1dCAoY2hhbmdlKT1cImdldFNlbGVjdGVkRnJvbURhdGUoKVwiIFttYXhdPVwiZ2V0VG9kYXkoKVwiIGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJkYXRlLWZyb21cIiBuYW1lPVwiZGF0ZS1mcm9tXCIgdHlwZT1cImRhdGVcIiAgZm9ybUNvbnRyb2xOYW1lPVwic3RhcnREYXRlXCIgcmVxdWlyZWQvPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9XCJkYXRldG9cIj5cbiAgICAgIDxsYWJlbCBjbGFzcz1cImdvdnVrLWxhYmVsIGdvdnVrLXJhZGlvc19fbGFiZWwgZ292dWstbGFiZWwtLW1cIiBmb3I9XCJkYXRlLXRvXCI+RGF0ZSB0bzwvbGFiZWw+XG4gICAgICA8aW5wdXQgKGNoYW5nZSk9XCJnZXRTZWxlY3RlZEZyb21EYXRlKClcIiBbbWF4XT1cImdldFRvZGF5KClcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZGF0ZS10b1wiIG5hbWU9XCJzZWFyY2hcIiB0eXBlPVwiZGF0ZVwiIGZvcm1Db250cm9sTmFtZT1cImVuZERhdGVcIiByZXF1aXJlZC8+XG4gICAgICA8L2Rpdj5cbiAgICAgPC9kaXY+XG4gICA8cCBjbGFzcz1cImlubGluZS1lcnJvci1tZXNzYWdlXCIgKm5nSWY9XCJpc1N0YXJ0RGF0ZUxlc3RoYW5FbmREYXRlIHx8IGlzRGF0ZVJhbmdlQmV0bldlZWsgfHwgaXNEYXRlQmV0d25Nb250aFwiPlxuICAgICAgPHNwYW4gKm5nSWY9XCJpc1N0YXJ0RGF0ZUxlc3RoYW5FbmREYXRlXCI+UGxlYXNlIHNlbGVjdCAnRGF0ZSBGcm9tJyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gJ0RhdGUgVG8nPC9zcGFuPlxuICAgICAgPHNwYW4gKm5nSWY9XCJpc0RhdGVSYW5nZUJldG5XZWVrXCI+IFBsZWFzZSBzZWxlY3QgdGhlIGRhdGUgcmFuZ2UgYmV0d2VlbiA3IGRheXM8L3NwYW4+XG4gICAgICA8c3BhbiAqbmdJZj1cImlzRGF0ZUJldHduTW9udGhcIj4gUGxlYXNlIHNlbGVjdCB0aGUgZGF0ZSByYW5nZSBiZXR3ZWVuIDMwIGRheXM8L3NwYW4+XG4gICA8L3A+XG4gICAgPGRpdiBjbGFzcz1cImJ0bnN1Ym1pdFwiPlxuICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiAoY2xpY2spPVwiZG93bmxvYWRSZXBvcnQoKVwiIGNsYXNzPVwiYnV0dG9uXCIgW2Rpc2FibGVkXT1cIiFyZXBvcnRzRm9ybS52YWxpZCB8fCBpc0Rvd25Mb2FkQnV0dG9uZGlzYWJsZWQgfHwgaXNTdGFydERhdGVMZXN0aGFuRW5kRGF0ZSB8fCBpc0RhdGVSYW5nZUJldG5XZWVrXCI+RG93bmxvYWQgcmVwb3J0PC9idXR0b24+XG4gICA8L2Rpdj5cbiA8L2Zvcm0+XG4gICAgXG4iXX0=