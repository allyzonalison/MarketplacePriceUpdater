import { useEffect, useMemo, useState, type ReactNode } from "react";

import { ProgressContext, type ProgressState } from "./progressContext";

import socket from "../services/socket";

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<ProgressState>({
    visible: false,
    title: "",
    completed: 0,
    total: 0,
    percent: 0,
  });

  useEffect(() => {
    const handleProgress = (data: {
      completed: number;
      total: number;
      percent: number;
    }) => {
      setProgress((current) => ({
        ...current,
        completed: data.completed,
        total: data.total,
        percent: data.percent,
      }));
    };

    const handleComplete = () => {
      setProgress((current) => ({
        ...current,
        completed: current.total,
        percent: 100,
      }));
    };

    socket.on("price-update-progress", handleProgress);
    socket.on("price-update-complete", handleComplete);

    return () => {
      socket.off("price-update-progress", handleProgress);
      socket.off("price-update-complete", handleComplete);
    };
  }, []);

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
