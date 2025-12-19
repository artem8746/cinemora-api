import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseVacancyDto } from './dto/parse-vacancy.dto';
import { ParseVacancyFromTextDto } from './dto/parse-vacancy-from-text.dto';
import { ParseVacancyResponseDto } from './dto/vacancy-data.dto';
import { SaveVacancyDto } from './dto/save-vacancy.dto';
import { VacanciesByStatusDto } from './dto/vacancies-by-status.dto';
import { ParseVacancyCommand } from './commands/parse-vacancy/parse-vacancy.command';
import { ParseVacancyCommandResponse } from './commands/parse-vacancy/parse-vacancy.handler';
import { ParseVacancyFromTextCommand } from './commands/parse-vacancy-from-text/parse-vacancy-from-text.command';
import { ParseVacancyFromTextCommandResponse } from './commands/parse-vacancy-from-text/parse-vacancy-from-text.handler';
import { SaveVacancyCommand } from './commands/save-vacancy/save-vacancy.command';
import { SaveVacancyCommandResponse } from './commands/save-vacancy/save-vacancy.handler';
import { GetVacanciesByUserIdQuery } from './queries/get-vacancies-by-user-id/get-vacancies-by-user-id.query';
import { GetVacanciesByUserIdQueryResponse } from './queries/get-vacancies-by-user-id/get-vacancies-by-user-id.handler';
import { CommonResponses } from '@/utils/swagger.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';

@ApiTags('vacancies')
@Controller('vacancies')
@UseGuards(JwtAuthGuard)
export class VacanciesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('parse')
  @ApiOperation({ summary: 'Parse vacancy from URL' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public async parseVacancy(
    @Body() parseVacancyDto: ParseVacancyDto,
  ): Promise<ParseVacancyResponseDto> {
    return await this.commandBus.execute<
      ParseVacancyCommand,
      ParseVacancyCommandResponse
    >(new ParseVacancyCommand(parseVacancyDto.url));
  }

  @Post('parse-text')
  @ApiOperation({ summary: 'Parse vacancy from text content' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public async parseVacancyFromText(
    @Body() parseVacancyFromTextDto: ParseVacancyFromTextDto,
  ): Promise<ParseVacancyResponseDto> {
    return await this.commandBus.execute<
      ParseVacancyFromTextCommand,
      ParseVacancyFromTextCommandResponse
    >(new ParseVacancyFromTextCommand(parseVacancyFromTextDto.text));
  }

  @Post()
  @ApiOperation({ summary: 'Save vacancy to database' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public async saveVacancy(
    @CurrentUserId() userId: string,
    @Body() saveVacancyDto: SaveVacancyDto,
  ): Promise<SaveVacancyCommandResponse> {
    return await this.commandBus.execute<
      SaveVacancyCommand,
      SaveVacancyCommandResponse
    >(
      new SaveVacancyCommand({
        url: saveVacancyDto.url,
        parsedData: saveVacancyDto.parsedData,
        userId,
      }),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all vacancies for current user grouped by status',
  })
  @CommonResponses.ApiResponseSuccess
  public async getVacancies(
    @CurrentUserId() userId: string,
  ): Promise<VacanciesByStatusDto> {
    return await this.queryBus.execute<
      GetVacanciesByUserIdQuery,
      GetVacanciesByUserIdQueryResponse
    >(new GetVacanciesByUserIdQuery(userId));
  }
}
