export interface Contest {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  userId: string;
  problems: Problem[];
}

export interface Problem {
  id: number;
  contestId: string;
  descriptionUrl: string;
  inputFileUrl: string;
  outputFileUrl: string;
  sampleInput: string;
  sampleOutput: string;
  points: number;
}
