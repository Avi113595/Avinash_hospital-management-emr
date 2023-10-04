import { ChangeDetectorRef, Component } from "@angular/core";
import { AccountingBLService } from "../../../../accounting/shared/accounting.bl.service";
import { AccountingService } from "../../../../accounting/shared/accounting.service";
import { SubLedger_DTO } from "../../../../accounting/transactions/shared/DTOs/subledger-dto";
import { CoreService } from "../../../../core/shared/core.service";
import { SecurityService } from "../../../../security/shared/security.service";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { ENUM_ACC_ADDLedgerLedgerType, ENUM_DanpheHTTPResponses, ENUM_Data_Type, ENUM_MessageBox_Status } from "../../../../shared/shared-enums";
import { AccountingSettingsBLService } from "../../shared/accounting-settings.bl.service";
import { LedgerModel } from "../../shared/ledger.model";
import { ledgerGroupModel } from "../../shared/ledgerGroup.model";


@Component({
    selector: 'consultant-ledger-mapping',
    templateUrl: "./consultant-ledger-mapping.component.html"
})

export class ConsultantLedgerMappingComponent {

    public loading: boolean = false;

    public CurrentLedger: LedgerModel;
    public CurrentLedgerGroup: ledgerGroupModel;
    public selLedgerGroup: any;
    public showAddLedgerGroupPopUp: boolean = false;
    public selLedger: Array<LedgerModel> = new Array<LedgerModel>();
    public completeledgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public ledgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public NewledgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public primaryGroupList: any[];
    public coaList: any[];
    public ledgergroupList: Array<LedgerModel> = new Array<LedgerModel>();
    public sourceLedGroupList: Array<LedgerModel> = new Array<LedgerModel>();
    public sourceLedgerList: Array<LedgerModel> = new Array<LedgerModel>();

    public Dr: boolean;
    public Cr: boolean;

    public ledgerMappingList: any;

    // for sub-navigation data info
    public isSelectAll: boolean = false;
    public ledgerTypeParamter: any;
    public selectedLedgerCount: number = 0;
    public selectedLedgerData: any;
    public totalLedger: number;
    public mappedLedger: number;
    public notmappedLedger: number;
    public ledgerListAutoComplete: Array<LedgerModel> = new Array<LedgerModel>();


    // START: Consultant Ledger   
    public showEmpAllLedgers: boolean = false;
    public employeeList: any;
    public empLed = [];
    public NewEmpledgerList: Array<LedgerModel> = new Array<LedgerModel>();
    // END: Consultant Ledger   

    public provisionalLedgerCode: number = 0;

    public ConsultantfilterType: string = "all";
    public disabledRow: boolean = true;
    public allcoaList: any[];
    public selectedSubLedger: Array<any> = [];
    public subLedgerConsultant: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
    public subLedgerMaster: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
    public subLedgerAndCostCenterSetting = {
        "EnableSubLedger": false,
        "EnableCostCenter": false
    };
    public consultantLedgerParam = {
        LedgergroupUniqueName: "",
        LedgerType: "",
        COA: "",
        LedgerName: ""
    }

    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService,
        public accountingBLService: AccountingBLService,
        public coreService: CoreService,
        public accountingService: AccountingService) {
        this.subLedgerMaster = this.accountingService.accCacheData.SubLedgerAll ? this.accountingService.accCacheData.SubLedgerAll : [];
        //this.GetProvisionalLedgerCode();
        this.GetLedgerGroup();
        this.getLedgerList();
        this.Getledgers();
        this.GetLedgerMapping();
        this.getPrimaryGroupList();
        this.getCoaList();
    }

    public getCoaList() {
        if (!!this.accountingService.accCacheData.COA && this.accountingService.accCacheData.COA.length > 0) { //mumbai-team-june2021-danphe-accounting-cache-change
            this.allcoaList = this.accountingService.accCacheData.COA; //mumbai-team-june2021-danphe-accounting-cache-change
            this.allcoaList = this.allcoaList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }
    public getPrimaryGroupList() {
        if (!!this.accountingService.accCacheData.PrimaryGroup && this.accountingService.accCacheData.PrimaryGroup.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
            this.primaryGroupList = this.accountingService.accCacheData.PrimaryGroup;//mumbai-team-june2021-danphe-accounting-cache-change
            this.primaryGroupList = this.primaryGroupList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }
    public Getledgers() {
        try {
            let ledgers = this.coreService.Parameters.filter(p => p.ParameterGroupName == "Accounting" && p.ParameterName == "LedgerGroupMapping");
            if (ledgers.length > 0) {
                this.ledgerTypeParamter = JSON.parse(ledgers[0].ParameterValue);
                this.consultantLedgerParam = this.ledgerTypeParamter.find(a => a.LedgerType === ENUM_ACC_ADDLedgerLedgerType.Consultant);
            } else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Ledgers type not found.']);
            }

            let subLedgerParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Accounting" && a.ParameterName === "SubLedgerAndCostCenter");
            if (subLedgerParam) {
                this.subLedgerAndCostCenterSetting = JSON.parse(subLedgerParam.ParameterValue);
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    ngOnInit() {
        this.NewledgerList = new Array<LedgerModel>();
        this.Cr = this.Dr = null;
        this.loading = false;
        this.CurrentLedger = new LedgerModel();
        this.CurrentLedgerGroup = new ledgerGroupModel();
        this.CurrentLedger.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.SetConsultantData();
    }
    GetLedgerGroup() {
        if (!!this.accountingService.accCacheData.LedgerGroups && this.accountingService.accCacheData.LedgerGroups.length > 0) { //mumbai-team-june2021-danphe-accounting-cache-change
            this.CallBackLedgerGroup(this.accountingService.accCacheData.LedgerGroups);//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }

    CallBackLedgerGroup(res) {
        this.sourceLedGroupList = new Array<LedgerModel>();
        this.sourceLedGroupList = res;
        this.sourceLedGroupList = this.sourceLedGroupList.slice();
        this.ledgergroupList = [];
        this.coaList = [];
        this.ledgerList = new Array<LedgerModel>();
    }
    //adding new Ledger
    AddLedger() {

        this.NewledgerList = this.employeeList.filter(a => a.IsSelected == true);
        this.NewledgerList.forEach(emp => {
            var empData = this.ledgerListAutoComplete.filter(l => l.LedgerName == emp.LedgerName);
            if (empData.length == 0) {
                emp.Code = "";
                emp.LedgerId = 0;
            }
        });

        //this.CheckDrCrValidation();
        if (this.CurrentLedger.LedgerGroupId == 0 || this.CurrentLedger.LedgerGroupId == null) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please select ledger group"]);
        }
        else {
            let ledgerValidation = false;
            //for checking validations, marking all the fields as dirty and checking the validity.
            for (var ledger of this.NewledgerList) {
                for (var b in ledger.LedgerValidator.controls) {
                    ledger.LedgerValidator.controls[b].markAsDirty();
                    ledger.LedgerValidator.controls[b].updateValueAndValidity();
                }
                if (ledger.IsValidCheck(undefined, undefined)) {
                    ledgerValidation = true;
                }
                else {
                    ledgerValidation = false;
                }
                if (ledger.SubLedgerName.trim() === "") {
                    ledgerValidation = false;
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, [`Please Select SubLedger Or Give SubLedgerName.`]);
                    break;
                }
            };
            if (ledgerValidation) {
                this.loading = true;
                ///During First Time Add Current Balance and Opening Balance is Equal                 
                this.accountingSettingsBLService.AddLedgerList(this.NewledgerList)
                    .subscribe(
                        res => {
                            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Ledgers Added"]);
                                // this.CurrentLedger
                                this.CallBackAddLedger(res);
                                //this.GetProvisionalLedgerCode();
                                this.loading = false;
                            }
                            else {
                                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Duplicate ledger not allowed"]);
                                this.loading = false;
                            }
                        },
                        err => {
                            this.logError(err);
                            this.loading = false;
                        });
            } else {
                this.loading = false;
            }
        }
    }

    //after adding Ledger is succesfully added  then this function is called.
    CallBackAddLedger(res) {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results != null) {
            res.Results.forEach(ledger => {//mumbai-team-june2021-danphe-accounting-cache-change
                ledger.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
                ledger.COA = this.CurrentLedger.COA;
                ledger.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
                ledger.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
                this.getLedgerList();
                this.sourceLedgerList.push(ledger);
                this.accountingService.accCacheData.LedgersALL.push(ledger);//mumbai-team-june2021-danphe-accounting-cache-change
            });
        }
        else if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results == null) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Ledger under LedgerGroup already exist.Please deactivate the previous ledger to add a new one with same name"]);
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Check log for details"]);
            console.log(res.ErrorMessage);
        }
    }
    logError(err: any) {
        console.log(err);
    }
    CheckProperSelectedLedger(selLedgerGroup) {
        try {
            for (var i = 0; i < this.ledgergroupList.length; i++) {
                if (this.ledgergroupList[i].LedgerGroupId == selLedgerGroup.LedgerGroupId) {
                    this.CurrentLedger.checkSelectedLedger = false;
                    break;
                }
                else {
                    ////if LedgerGroupId is Undefined meanse Wrong Ledger Is Selected
                    if (selLedgerGroup.LedgerGroupId == undefined) {
                        this.CurrentLedger.checkSelectedLedger = true;
                        break;
                    }
                }
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
    public AssignSelectedLedgerGroup() {
        if (this.CurrentLedger.LedgerGroupName) {
            let AllowToCreateLedgers = JSON.parse(this.coreService.Parameters.filter(p => p.ParameterGroupName == "Accounting" && p.ParameterName == "AllowToCreateAllLedgersFromDefaultTab")[0].ParameterValue);
            this.selLedgerGroup = this.ledgergroupList.filter(s => s.LedgerGroupName == this.CurrentLedger.LedgerGroupName)[0];

            if (!AllowToCreateLedgers) {
                let ledgerGroupUnqName = this.ledgerTypeParamter.filter(l => l.LedgergroupUniqueName == this.selLedgerGroup.Name);
                if (ledgerGroupUnqName.length > 0) {
                    this.disabledRow = false;
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Create ledger for this ledgerGroup from respective tab']);
                }
                else {
                    this.disabledRow = true;
                }
            }

            if ((this.selLedgerGroup.LedgerGroupId != 0) && (this.selLedgerGroup.LedgerGroupId != null)) {
                this.CurrentLedger.LedgerGroupId = this.selLedgerGroup.LedgerGroupId;
                this.CurrentLedger.LedgerGroupName = this.selLedgerGroup.LedgerGroupName;
                this.ledgerList = this.sourceLedgerList.filter(a => a.LedgerGroupName == this.CurrentLedger.LedgerGroupName);
            }
            this.NewledgerList.forEach(a => {
                a.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
                a.COA = this.CurrentLedger.COA;
                a.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
                a.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
                a.CreatedBy = this.CurrentLedger.CreatedBy;
            });

        }
    }
    public PrimaryGroupChanged() {
        this.coaList = [];
        this.ledgergroupList = [];
        this.selLedgerGroup = null;
        this.CurrentLedger.LedgerGroupName = null;
        let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == this.CurrentLedger.PrimaryGroup)[0].PrimaryGroupId;
        this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);
        this.CurrentLedger.COA = this.coaList[0].ChartOfAccountName;
        this.COAChanged();
    }
    public COAChanged() {
        if (this.CurrentLedger.COA) {
            this.ledgergroupList = [];
            this.selLedgerGroup = null;
            this.CurrentLedger.LedgerGroupName = null;
            this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == this.CurrentLedger.COA);
        }
    }
    //on default ledger creation time
    public CheckDuplicateLedger(index: number) {
        if (this.NewledgerList[index].LedgerName) {
            this.changeDetector.detectChanges();
            let count = this.sourceLedgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;
            let check = this.NewledgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;

            if (count > 0 || check > 1) {
                this.NewledgerList[index].LedgerName = null;
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['duplicate ledger not allowed']);
                this.loading = false;
            }

        }
    }
    public getLedgerList() {
        if (!!this.accountingService.accCacheData.LedgersALL && this.accountingService.accCacheData.LedgersALL.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
            this.sourceLedgerList = this.accountingService.accCacheData.LedgersALL;//mumbai-team-june2021-danphe-accounting-cache-change
            this.sourceLedgerList = this.sourceLedgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }
    LedgerGroupListFormatter(data: any): string {
        return data["LedgerGroupName"];
    }
    LedgerListFormatter(data: any): string {
        //return data["LedgerName"];
        return data["Code"] + "-" + data["LedgerName"] + " | " + data["PrimaryGroup"] + " -> " + data["LedgerGroupName"];
    }
    LedgerListFormatter2(data: any): string {

        return data["EmployeeName"];;
    }
    ChangeOpeningBalType(e, index: number) {
        this.loading = false;
        if (e.target.name == "Dr") {
            if (e.target.checked) {
                this.employeeList[index].DrCr = true;
                this.employeeList[index].Cr = false;
                this.employeeList[index].Dr = true;
            }
        }
        if (e.target.name == "Cr") {
            if (e.target.checked) {
                this.employeeList[index].DrCr = false;
                this.employeeList[index].Dr = false;
                this.employeeList[index].Cr = true;
            }
        }
    }
    CheckDrCrValidation() {
        if (this.NewledgerList.length > 0) {
            this.NewledgerList.forEach(itm => {
                if (itm.OpeningBalance > 0) {
                    //set validator on
                    itm.UpdateValidator("on", "Dr", "required");
                    itm.UpdateValidator("on", "Cr", "required");
                }
                else {
                    //set validator off
                    itm.UpdateValidator("off", "Dr", "required");
                    itm.UpdateValidator("off", "Cr", "required");
                }
            })
        }
    }

    GetLedgerMapping() {
        this.accountingBLService.GetLedgerMappingDetails()
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.ledgerMappingList = res.Results;
                }
            });
    }

    DeleteLedgerRow(index: number) {
        try {
            if (this.NewledgerList.length > 1) {
                this.NewledgerList.splice(index, 1);
                this.selLedger.splice(index, 1);
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    // START: Consultant Ledger   
    SetConsultantData() {
        this.selectedLedgerCount = 0;
        this.changeDetector.detectChanges();
        this.getEmpList();
        this.CurrentLedger = new LedgerModel();
        let LedgerGroupName = this.ledgerTypeParamter.find(a => a.LedgerType == ENUM_ACC_ADDLedgerLedgerType.Consultant).LedgergroupUniqueName;
        let consultLedger = this.sourceLedGroupList.find(a => a.Name == LedgerGroupName); // 'LCL_CONSULTANT(CREDIT_A/C)'

        if (consultLedger != null || consultLedger != undefined) {
            // let selectedPrimaryGroupList = this.sourceLedGroupList.filter(a => a.PrimaryGroup == consultLedger.PrimaryGroup);
            // this.coaList = Array.from([new Set(selectedPrimaryGroupList.map(i => i.COA))][0]);
            let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == consultLedger.PrimaryGroup)[0].PrimaryGroupId;
            this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);

            this.CurrentLedger.PrimaryGroup = consultLedger.PrimaryGroup;
            this.CurrentLedger.COA = consultLedger.COA;
            this.CurrentLedger.LedgerGroupName = consultLedger.LedgerGroupName;
            this.CurrentLedger.LedgerGroupId = consultLedger.LedgerGroupId;
            this.ledgerListAutoComplete = this.sourceLedgerList.filter(emp => emp.LedgerGroupId == this.CurrentLedger.LedgerGroupId && emp.LedgerName != "");
            this.subLedgerConsultant = this.subLedgerMaster.filter(a => this.ledgerListAutoComplete.some(b => a.LedgerId === b.LedgerId));
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Please first create ledger group for Consultant(Credit A/C)']);
        }

    }
    getEmpList() {

        this.accountingSettingsBLService.GetEmployeeList()
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.NewEmpledgerList = new Array<LedgerModel>();
                    let data = res.Results;
                    data.forEach((emp, index) => {
                        var led = new LedgerModel();
                        led = Object.assign(led, emp);
                        led.LedgerId = (emp.LedgerId != null) ? emp.LedgerId : 0,
                            led.LedgerGroupId = (emp.LedgerGroupId != null) ? emp.LedgerGroupId : this.CurrentLedger.LedgerGroupId,
                            led.LedgerName = (emp.LedgerName != null) ? emp.LedgerName : "",
                            led.LedgerReferenceId = (emp.LedgerReferenceId != null) ? emp.LedgerReferenceId : emp.EmployeeId,
                            led.IsActive = (emp.IsActive != null) ? emp.IsActive : false,
                            led.Dr = (emp.DrCr == true) ? emp.DrCr : null;
                        led.Cr = (emp.DrCr == false) ? true : null;
                        led.LedgerType = ENUM_ACC_ADDLedgerLedgerType.Consultant,
                            led.LedgerValidator.get("COA").setValue(this.CurrentLedger.COA);
                        led.LedgerValidator.get("PrimaryGroup").setValue(this.CurrentLedger.PrimaryGroup);
                        led.LedgerValidator.get("LedgerGroupName").setValue(this.CurrentLedger.LedgerGroupName);
                        if (!led.IsSelected)
                            led.LedgerValidator.get("LedgerName").disable();
                        led.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
                        this.NewEmpledgerList.push(led);
                        this.selectedSubLedger[index] = emp.SubLedgerName;
                    });
                    this.employeeList = this.NewEmpledgerList;
                    this.totalLedger = this.employeeList.length;
                    this.mappedLedger = this.employeeList.filter(l => l.IsMapped == true).length;
                    this.notmappedLedger = this.employeeList.filter(l => l.IsMapped == false).length;
                    // this.typeConsultant = true;
                }
            });
    }

    //sud:1June'20- implementaiton changed after Searchbox is  replaced by Textbox for Searching
    public ledgerSearchKey: string = null;
    filterSelectedLedger(searchKey: string) {
        try {
            if (searchKey && searchKey.trim()) {

                if (this.ConsultantfilterType == 'withacchead') {
                    let consultantData = this.employeeList.filter(l => (l.LedgerId > 0));
                    this.employeeList = consultantData.filter(l => l.EmployeeName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId > 0);
                }
                else if (this.ConsultantfilterType == 'withoutacchead') {
                    let consultantData = this.employeeList.filter(l => (l.LedgerId > 0));
                    this.employeeList = consultantData.filter(l => l.EmployeeName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId == 0);
                }
                else {
                    this.employeeList = this.NewEmpledgerList.filter(l => l.EmployeeName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1);
                }
            }
            else {
                if (this.ConsultantfilterType == 'withacchead') {
                    this.employeeList = this.NewEmpledgerList.filter(l => l.LedgerId > 0);
                }
                else if (this.ConsultantfilterType == 'withoutacchead') {
                    this.employeeList = this.NewEmpledgerList.filter(l => l.LedgerId == 0);
                }
                else {
                    this.employeeList = this.NewEmpledgerList;
                }
            }
        }
        catch (ex) {

        }
    }

    AssignSelectedLedger(index) {
        try {
            let oldLedgerId = this.employeeList[index] ? this.employeeList[index].LedgerId : 0;
            var ledgerNameSelected = (typeof (this.employeeList[index].LedgerName) == 'object') ? this.employeeList[index].LedgerName.LedgerName.trim().toLowerCase() : this.employeeList[index].LedgerName.trim().toLowerCase();
            var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName.trim().toLowerCase() == ledgerNameSelected);
            //var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName.trim().toLowerCase() == this.employeeList[index].LedgerName.trim().toLowerCase() );
            if (ledger.length > 0) {
                this.employeeList[index].Code = ledger[0].Code;
                this.employeeList[index].LedgerId = ledger[0].LedgerId;
                this.employeeList[index].LedgerName = ledger[0].LedgerName;
            } else {
                this.employeeList[index].Code = "";
                this.employeeList[index].LedgerId = 0;
            }
            if (oldLedgerId !== this.employeeList[index].LedgerId) {
                this.employeeList[index].SubLedgerName = "";
                this.employeeList[index].SubLedgerId = 0;
                this.selectedSubLedger[index] = new SubLedger_DTO();
            }

        }
        catch (ex) {

        }
    }
    SelectAllChkOnChange() {
        if (this.isSelectAll) {
            let ledgerObj = this.ledgerListAutoComplete.find(a => a.Name === this.consultantLedgerParam.LedgerName)
            // if (this.typeConsultant) {
            this.employeeList.forEach((a, index) => {
                a.IsSelected = true;
                a.IsActive = true;
                if (a.IsSelected) {
                    if (a.IsMapped == false) {
                        a.LedgerName = this.subLedgerAndCostCenterSetting.EnableSubLedger ? (ledgerObj.LedgerName) : a.EmployeeName;
                        a.Code = this.subLedgerAndCostCenterSetting.EnableSubLedger ? (ledgerObj ? ledgerObj.Code : "") : "";
                        a.LedgerId = this.subLedgerAndCostCenterSetting.EnableSubLedger ? (ledgerObj ? ledgerObj.LedgerId : 0) : 0;
                        a.SubLedgerName = a.EmployeeName;
                        this.selectedSubLedger[index] = a.EmployeeName;
                    }
                }
                a.LedgerValidator.get("LedgerName").enable();
            });
        }
        else {
            this.employeeList.forEach((a, index) => {
                if (a.IsMapped == false) {
                    a.LedgerName = "";
                    a.Code = "";
                    a.LedgerId = 0;
                    a.SubLedgerName = "";
                    this.selectedSubLedger[index] = "";
                }
                else {
                    var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == a.LedgerName);
                    if (ledger.length == 0) {
                        let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == a.LedgerId);
                        a.Code = data[0].Code;
                        a.LedgerId = data[0].LedgerId;
                        a.LedgerName = data[0].LedgerName;
                    }
                }
                a.IsSelected = false;
                a.LedgerValidator.get("LedgerName").disable();
            });
        }
        this.ShowSaveButtonOnCkboxChange();
    }

    SingleCkboxChange(index) {

        this.selectedLedgerCount = this.employeeList.filter(a => a.IsSelected == true).length;

        if (this.employeeList[index].IsSelected) {
            if (this.employeeList[index].IsMapped == false) {
                //NBB- we will keep empty ledgername so, user will type username and he can find existing ledger from autocomplete        
                this.employeeList[index].LedgerName = ""//this.employeeList[index].EmployeeName;
                this.employeeList[index].Code = "";
                this.employeeList[index].LedgerId = 0;
            }
            this.employeeList[index].LedgerValidator.get("LedgerName").enable();
        }
        else if ((this.employeeList[index].IsSelected == false)) {
            if (this.employeeList[index].IsMapped == false) {
                this.employeeList[index].LedgerName = "";
                this.employeeList[index].Code = "";
                this.employeeList[index].LedgerId = 0;
                this.employeeList[index].SubLedgerId = 0;
                this.employeeList[index].SubLedgerName = "";
                this.selectedSubLedger[index] = "";

            }
            else {
                var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == this.employeeList[index].LedgerName);
                if (ledger.length == 0) {
                    let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == this.employeeList[index].LedgerId);
                    if (data.length > 0) {
                        this.employeeList[index].Code = data[0].Code;
                        this.employeeList[index].LedgerId = data[0].LedgerId;
                        this.employeeList[index].LedgerName = data[0].LedgerName;
                    }
                }
            }
            this.employeeList[index].LedgerValidator.get("LedgerName").disable();
        }
    }

    ShowSaveButtonOnCkboxChange() {
        this.isSelectAll = this.employeeList.every(a => a.IsSelected == true);
        this.selectedLedgerCount = this.employeeList.filter(a => a.IsSelected == true).length;
    }


    public SubLedgerListFormatter(subLedger: SubLedger_DTO): string {
        return `${subLedger["SubLedgerName"]} (${subLedger["LedgerName"]})`;
    }

    ToggleEmpLedger(mapped) {
        if (mapped == 'true') {
            this.ConsultantfilterType = 'withacchead';
            this.employeeList = this.NewEmpledgerList.filter(emp => emp.LedgerId > 0);
            this.selectedLedgerData = null;
        }
        else if (mapped == 'false') {
            this.ConsultantfilterType = 'withoutacchead';
            this.employeeList = this.NewEmpledgerList.filter(emp => emp.LedgerId == 0);
            this.selectedLedgerData = null;
        }
        else {
            this.ConsultantfilterType = 'all';
            this.employeeList = this.NewEmpledgerList;
            this.selectedLedgerData = null;
        }

    }
    // END: Consultant Ledger   

    //Get Provisional Ledger code , this code used for show for new ledger before ledger creation
    //provisional ledger code is not final may be it will different than showed 
    GetProvisionalLedgerCode() {
        try {
            this.accountingSettingsBLService.GetProvisionalLedgerCode()
                .subscribe(res => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.provisionalLedgerCode = parseInt(res.Results);
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
                    }
                },
                    err => {
                        this.ShowCatchErrMessage(err);
                    });
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    AssignSelectedSubLedger(index) {
        if (typeof this.selectedSubLedger[index] === ENUM_Data_Type.Object && this.selectedSubLedger[index].SubLedgerId > 0) {
            this.employeeList[index].Code = this.selectedSubLedger[index].SubLedgerCode
            this.employeeList[index].LedgerId = this.selectedSubLedger[index].LedgerId;
            this.employeeList[index].SubLedgerName = this.selectedSubLedger[index].SubLedgerName;
            this.employeeList[index].SubLedgerId = this.selectedSubLedger[index].SubLedgerId;
            var Ledger = this.ledgerListAutoComplete.find(a => a.LedgerId === this.selectedSubLedger[index].LedgerId);
            if (Ledger) {
                this.employeeList[index].LedgerName = Ledger.LedgerName;
            }
        }
        else {
            if (this.selectedSubLedger[index].trim() === "") {
                this.employeeList[index].LedgerId = 0;
                this.employeeList[index].SubLedgerId = 0;
                this.employeeList[index].LedgerName = "";
                this.employeeList[index].SubLedgerName = "";
            }
            else {
                this.employeeList[index].SubLedgerName = this.selectedSubLedger[index];
            }
        }
    }
}
