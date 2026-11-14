import type { ReactNode } from "react";
import { useActiveBranch } from "../../../hook/data/branch/branch.scope.hook";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import BranchPickPanel from "./BranchPickPanel";

type IProps = {
  title: string;
  description: string;
  children: (branchId: string) => ReactNode;
};

// A screen that writes stock renders only once it knows its one branch.
const BranchWriteGate = ({ title, description, children }: IProps) => {
  const { query, writeBranch } = useActiveBranch();

  if (query.isLoading) return <EmptyState loading description="Loading branches…" />;
  if (query.error) {
    return (
      <ErrorState
        error={query.error}
        title="Couldn't load branches"
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (!writeBranch) return <BranchPickPanel title={title} description={description} />;

  return children(writeBranch.id);
};

export default BranchWriteGate;
