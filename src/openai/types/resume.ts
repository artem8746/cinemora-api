export interface ResumeParsedContent {
  title: string;

  personalDetails: {
    phone: string;
    photo: string;
    social: { [platform: string]: string }; // platform → URL
    address: string;
    fullName: string;
    jobTitle: string;
  };

  content: {
    work: {
      entries: Array<{
        employer: string;
        jobTitle: string;
        location: string;
        endDate: string; // format: "YYYY-MM" or ""
        description: string; // HTML with <ul><li>
        employerLink: string;
        startDate: string; // format: "YYYY-MM"
      }>;
    };

    skill: {
      entries: string[];
    };

    profile: string; // summary/about

    project: {
      entries: Array<{
        subTitle: string;
        endDate: string;
        description: string; // HTML with <ul><li>
        projectTitle: string;
        startDate: string;
        projectTitleLink: string; // repo / project URL
      }>;
    };

    education: {
      entries: Array<{
        degree: string;
        school: string;
        location: string;
        endDate: string;
        schoolLink: string;
        description: string;
        startDate: string;
      }>;
    };
  };
}
