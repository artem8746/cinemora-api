export class SaveTokenCommand {
  constructor(
    public readonly key: string,
    public readonly token: string,
    public readonly expirationSeconds: number,
  ) {}
}
