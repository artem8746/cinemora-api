export class CreateInvoiceCommand {
  constructor(
    public readonly userId: string,
    public readonly idempotencyKey: string,
    public readonly planId?: string,
    public readonly tokenAmount?: number,
  ) {}
}
