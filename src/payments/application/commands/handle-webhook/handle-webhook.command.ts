export class HandleWebhookCommand {
  constructor(
    public readonly rawBody: Buffer,
    public readonly signature: string,
    public readonly body: Record<string, unknown>,
  ) {}
}
