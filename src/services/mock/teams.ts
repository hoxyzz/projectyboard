import type { TeamService, Team } from "../types";

const MOCK_TEAMS: Team[] = [
  { id: "team-remco", name: "Remco", color: "hsl(142, 60%, 45%)" },
];

export function createMockTeamService(): TeamService {
  return {
    async list() {
      return MOCK_TEAMS;
    },
    async getById(id: string) {
      return MOCK_TEAMS.find((t) => t.id === id) ?? null;
    },
  };
}
