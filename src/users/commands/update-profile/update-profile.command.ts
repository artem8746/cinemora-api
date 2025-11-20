export class UpdateProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly updateData: {
      avatar?: string;
      username?: string;
      position?: string;
      location?: string;
    },
  ) {}
}
