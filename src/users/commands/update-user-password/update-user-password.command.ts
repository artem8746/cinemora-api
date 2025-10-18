export class UpdateUserPasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly newPassword: string,
  ) {}
}
