import { useQuery } from "@tanstack/react-query";
import { getTeamService } from "@/services";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeamService().list(),
  });
}
