import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseVacancyDto } from './dto/parse-vacancy.dto';
import { ParseVacancyResponseDto } from './dto/vacancy-data.dto';
import { ParseVacancyCommand } from './commands/parse-vacancy/parse-vacancy.command';
import { ParseVacancyCommandResponse } from './commands/parse-vacancy/parse-vacancy.handler';
import { CommonResponses } from '@/utils/swagger.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('vacancies')
@Controller('vacancies')
@UseGuards(JwtAuthGuard)
export class VacanciesController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
