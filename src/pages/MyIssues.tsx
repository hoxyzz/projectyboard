import { IssuesView } from "@/features/issues/issues-view";
import { useNavigate } from "react-router-dom";

export default function MyIssuesPage() {
  const navigate = useNavigate();
  return (
    <IssuesView
      onIssueSelect={(issue) => navigate(`/issues/${issue.id}`)}
      onFilterChange={undefined}
    />
  );
}
