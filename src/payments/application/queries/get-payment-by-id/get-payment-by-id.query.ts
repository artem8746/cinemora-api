export class GetPaymentByIdQuery {
  constructor(
    public readonly paymentId: string,
    public readonly userId: string,
  ) {}
}
