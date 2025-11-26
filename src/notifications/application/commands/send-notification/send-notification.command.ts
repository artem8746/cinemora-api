export class SendNotificationCommand {
  constructor(
    public readonly data: unknown,
    public readonly userIds?: string[],
  ) {}
}
