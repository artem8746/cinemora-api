import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCompletionCommand {
  @IsString()
  @IsNotEmpty()
  prompt!: string;
}
