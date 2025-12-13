export class PauseContentDto {
  profileId: number;
  contentId: number;
  lastPositionSeconds: number;
  watchedSeconds: number;
  completed: boolean;
  autoContinuedNext: boolean;
}
