import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OpenAIService } from '../../openai.service';
import { ParseResumeRawContentCommand } from './parse-text-to-resume.command';
import { ResumeParsedContent } from '@/openai/types/resume';

const MOCK_RESPONSE = {
  title: 'Artem Malikov',
  personalDetails: {
    phone: '0982605316',
    photo: '',
    social: {
      telegram: 'https://t.me/arrtemmalikov',
      linkedin: 'https://www.linkedin.com/in/artem-malikov-ba4797231/',
      github: 'https://github.com/artem8746',
    },
    address: 'Essen, Germany',
    fullName: 'Artem Malikov',
    jobTitle: 'Full-stack developer',
  },
  content: {
    work: {
      entries: [
        {
          employer: 'Antagosoft',
          jobTitle: 'Full-stack Developer',
          location: '',
          endDateNew: 'present',
          description:
            '<ul><li>Refactored critical components into reusable modules, according to FSD, improving code maintainability and onboarding efficiency for new developers</li><li>Engineered a scalable reporting system, automating Excel report generation for large datasets and reducing manual workload by 80%</li><li>Developed and secured an admin panel, implementing role-based access control (RBAC)</li></ul>',
          employerLink: '',
          startDateNew: '2024-09',
        },
        {
          employer: 'Insiders',
          jobTitle: 'Full-stack Developer',
          location: '',
          endDateNew: '2024-09',
          description:
            '<ul><li>Deployed a scalable web app to Azure using Docker, streamlining CI/CD workflows</li><li>Integrated third-party APIs to enhance application functionality and improve user experience</li><li>Implemented UI using Mantine, translating Figma prototypes into responsive and accessible components</li><li>Engineered efficient GraphQL endpoints, enabling flexible data querying and reducing API complexity and response times by 20%.</li></ul>',
          employerLink: '',
          startDateNew: '2024-01',
        },
      ],
    },
    skill: {
      entries: [
        'HTML5',
        'CSS3',
        'Sass (SCSS)',
        'CSS Modules',
        'BEM',
        'Tailwind',
        'shadcn/ui',
        'Framer Motion',
        'Material UI',
        'React',
        'Next.js',
        'Redux',
        'JavaScript',
        'TypeScript',
        'Axios',
        'Mantine',
        'React Flow',
        'Node.js',
        'Express',
        'Nest.js',
        'REST API',
        'GraphQL',
        'Sequelize',
        'Prisma ORM',
        'PostgreSQL',
        'Firebase',
        'Docker',
        'Git',
        'CI/CD',
        'Yarn',
        'Webpack',
        'Agile',
        'OOP',
      ],
    },
    profile:
      'Full-stack developer with a degree in Computer Engineering and over 3+ years of hands-on experience. Recently built a car tracking and analytics platform with NestJS, MinIO, PostgreSQL, Redis, and Docker, designed for real-time data monitoring. English - B2 | Deutsch - A2',
    project: {
      entries: [
        {
          subTitle: 'TechStar (Shop Catalog)',
          endDateNew: '',
          description:
            '<ul><li>Set up a development environment with Vite, Prettier, ESLint, and Husky for consistent code quality.</li><li>Customized Swiper on the main page to improve user experience.</li><li>Integrated Redux Toolkit to enhance state management and scalability.</li></ul>',
          projectTitle: 'TechStar (Shop Catalog)',
          startDateNew: '',
          projectTitleLink:
            'https://github.com/fe-nov23-DOMinationDynasty/product_catalog',
        },
        {
          subTitle: 'MyBike landing',
          endDateNew: '',
          description:
            '<ul><li>Developed a responsive and accessible website using BEM, HTML5, and SASS, ensuring cross-device compatibility and web accessibility</li></ul>',
          projectTitle: 'MyBike landing',
          startDateNew: '',
          projectTitleLink: 'https://github.com/artem8746/mybike-landing',
        },
        {
          subTitle: 'Todo app',
          endDateNew: '',
          description:
            '<ul><li>Implemented CRUD operations, bulk actions, and inline editing with accessible and responsive design using Bulma, along with loading overlays and error handling to enhance user experience and data management</li></ul>',
          projectTitle: 'Todo app',
          startDateNew: '',
          projectTitleLink:
            'https://github.com/artem8746/react_todo-app-with-api-prod/tree/master',
        },
      ],
    },
    education: {
      entries: [
        {
          degree: 'Associate Specialist in Computer Science',
          school: 'NTU KHPI',
          location: 'Kharkiv, Ukraine',
          endDateNew: 'present',
          schoolLink: '',
          description: '',
          startDateNew: '2022-09',
        },
      ],
    },
  },
};

@CommandHandler(ParseResumeRawContentCommand)
export class ParseTextToResumeHandler
  implements ICommandHandler<ParseResumeRawContentCommand>
{
  constructor(private readonly openAIService: OpenAIService) {}

  // TODO: Uncomment this to use the actual OpenAI API
  execute(
    _command: ParseResumeRawContentCommand,
  ): Promise<ResumeParsedContent> {
    // return await this.openAIService.parseRawResumeContent(command.rawContent);
    return Promise.resolve(MOCK_RESPONSE);
  }
}

export type ParseTextToResumeCommandResponse = ReturnType<
  ParseTextToResumeHandler['execute']
>;
