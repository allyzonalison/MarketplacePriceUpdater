import { useMemo, useState, type ReactNode } from "react";

import { ProgressContext, type ProgressState } from "./progressContext";

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<ProgressState>({
    visible: false,
    title: "",
    completed: 0,
    total: 0,
    percent: 0,
  });

  const value = useMemo(
    () => ({
      progress,

      showProgress(title: string) {
        setProgress({
          visible: true,
          title,
          completed: 0,
          total: 0,
          percent: 0,
        });
      },

      hideProgress() {
        setProgress({
          visible: false,
          title: "",
          completed: 0,
          total: 0,
          percent: 0,
        });
      },
    }),
    [progress]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
