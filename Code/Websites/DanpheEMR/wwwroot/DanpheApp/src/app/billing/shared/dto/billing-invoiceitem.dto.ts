export class InvoiceItem_DTO {
  public ServiceItemId: number = 0;
  public Department: string = '';
  public Performer: string = '';
  public PerformerId: number = null;
  public PerformerName: string = '';
  public PrescriberId: number = null;
  public PrescriberName: string = '';
  public ItemCode: string = '';
  public ItemName: string = '';
  public Price: number = 0;
  public Quantity: number = 0;
  public SubTotal: number = 0;
  public IsTaxApplicable: boolean = false;
  public IsDiscountApplicable: boolean = false;
  public DiscountPercent: number;
  public IsPriceChangeAllowed: boolean = false;
  public IsZeroPriceAllowed: boolean = false;
  public DiscountAmount: number = 0;
  public TotalAmount: number = 0;
  public SchemeId: number = 0;
  public PriceCategoryId: number = 0;
  public PatientId: number = 0;
  public ServiceDepartmentId: number = 0;
  public ServiceDepartmentName: string = '';
  public BillStatus: string = '';
  public PatientVisitId: number = 0;
  public BillingType: string = '';
  public VisitType: string = '';
  public IntegrationItemId: number = 0;
  public DiscountSchemeId: number = 0; //SchemeId and DiscountSchemeId are same.
  public IsCoPayment: boolean = false;
  public CoPayCashPercent: number = 0;
  public CoPayCreditPercent: number = 0;
  public CoPaymentCashAmount: number = 0;
  public CoPaymentCreditAmount: number = 0;
  public HasAdditionalBillingItems: boolean = false;
  public IsDoubleEntry_Now: boolean = false;
  public IsDoubleEntry_Past: boolean = false;
  public IsPackageBilling: boolean = false;
  public BillingPackageId: number = null;

}
