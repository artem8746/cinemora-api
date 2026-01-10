import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommonResponses } from '@/utils/swagger.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { CreateVacancyNoteDto } from './dto/create-vacancy-note.dto';
import { UpdateVacancyNoteDto } from './dto/update-vacancy-note.dto';
import { CreateVacancyNoteCommand } from './commands/create-vacancy-note/create-vacancy-note.command';
import { CreateVacancyNoteCommandResponse } from './commands/create-vacancy-note/create-vacancy-note.handler';
import { UpdateVacancyNoteCommand } from './commands/update-vacancy-note/update-vacancy-note.command';
import { UpdateVacancyNoteCommandResponse } from './commands/update-vacancy-note/update-vacancy-note.handler';
import { DeleteVacancyNoteCommand } from './commands/delete-vacancy-note/delete-vacancy-note.command';
import { DeleteVacancyNoteCommandResponse } from './commands/delete-vacancy-note/delete-vacancy-note.handler';
import { GetVacancyNotesByVacancyIdQuery } from './queries/get-vacancy-notes-by-vacancy-id/get-vacancy-notes-by-vacancy-id.query';
import { GetVacancyNotesByVacancyIdQueryResponse } from './queries/get-vacancy-notes-by-vacancy-id/get-vacancy-notes-by-vacancy-id.handler';

@ApiTags('vacancy-notes')
@Controller('vacancy-notes')
@UseGuards(JwtAuthGuard)
export class VacancyNotesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('vacancies/:vacancyId')
  @ApiOperation({ summary: 'Create a note for a vacancy' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public async createVacancyNote(
    @Param('vacancyId') vacancyId: string,
    @CurrentUserId() userId: string,
    @Body() createVacancyNoteDto: CreateVacancyNoteDto,
  ): Promise<CreateVacancyNoteCommandResponse> {
    return await this.commandBus.execute<
      CreateVacancyNoteCommand,
      CreateVacancyNoteCommandResponse
    >(
      new CreateVacancyNoteCommand({
        vacancyId,
        userId,
        type: createVacancyNoteDto.type,
        title: createVacancyNoteDto.title,
        content: createVacancyNoteDto.content,
      }),
    );
  }

  @Get('vacancies/:vacancyId')
  @ApiOperation({ summary: 'Get all notes for a vacancy' })
  @CommonResponses.ApiResponseSuccess
  @CommonResponses.ApiResponseBadRequest
  public async getVacancyNotes(
    @Param('vacancyId') vacancyId: string,
    @CurrentUserId() userId: string,
  ): Promise<GetVacancyNotesByVacancyIdQueryResponse> {
    return await this.queryBus.execute<
      GetVacancyNotesByVacancyIdQuery,
      GetVacancyNotesByVacancyIdQueryResponse
    >(new GetVacancyNotesByVacancyIdQuery(vacancyId, userId));
  }

  @Patch(':noteId')
  @ApiOperation({ summary: 'Update a note by ID' })
  @CommonResponses.ApiResponseSuccess
  @CommonResponses.ApiResponseBadRequest
  public async updateVacancyNote(
    @Param('noteId') noteId: string,
    @CurrentUserId() userId: string,
    @Body() updateVacancyNoteDto: UpdateVacancyNoteDto,
  ): Promise<UpdateVacancyNoteCommandResponse> {
    return await this.commandBus.execute<
      UpdateVacancyNoteCommand,
      UpdateVacancyNoteCommandResponse
    >(
      new UpdateVacancyNoteCommand({
        noteId,
        userId,
        type: updateVacancyNoteDto.type,
        title: updateVacancyNoteDto.title,
        content: updateVacancyNoteDto.content,
      }),
    );
  }

  @Delete(':noteId')
  @ApiOperation({ summary: 'Delete a note by ID' })
  @CommonResponses.ApiResponseSuccess
  @CommonResponses.ApiResponseBadRequest
  public async deleteVacancyNote(
    @Param('noteId') noteId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    return await this.commandBus.execute<
      DeleteVacancyNoteCommand,
      DeleteVacancyNoteCommandResponse
    >(
      new DeleteVacancyNoteCommand({
        noteId,
        userId,
      }),
    );
  }
}
