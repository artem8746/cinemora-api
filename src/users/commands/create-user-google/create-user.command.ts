export class CreateUserGoogleCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
  ) {}
}
