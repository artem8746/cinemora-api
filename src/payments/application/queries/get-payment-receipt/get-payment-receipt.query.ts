export class GetPaymentReceiptQuery {
  constructor(
    public readonly paymentId: string,
    public readonly userId: string,
  ) {}
}
