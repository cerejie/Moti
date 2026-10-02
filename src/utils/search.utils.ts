// PostgREST's or=() filter treats , ( ) as syntax and % * as wildcards, so a typed
// term is reduced to plain text before it is wrapped as a contains-pattern.
export const toIlikePattern = (term: string): string | null => {
  const clean = term.replace(/[,()%*\\]/g, " ").trim();
  return clean === "" ? null : `%${clean}%`;
};
