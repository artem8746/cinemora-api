export class ResumeUploadedEvent {
  constructor(
    public readonly userId: string,
    public readonly url: string,
    public readonly uploadedAt: Date,
  ) {}
}
