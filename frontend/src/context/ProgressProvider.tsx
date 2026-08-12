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
      console.log("📊 PRICE PROGRESS:", data);

      setProgress((current) => ({
        ...current,
        visible: true,
        completed: data.completed,
        total: data.total,
        percent: data.percent,
      }));
    };

    const handleComplete = () => {
      console.log("✅ PRICE UPDATE COMPLETE");

      setProgress((current) => ({
        ...current,
        completed: current.total,
        percent: 100,
      }));

      setTimeout(() => {
        setProgress({
          visible: false,
          title: "",
          completed: 0,
          total: 0,
          percent: 0,
        });
      }, 500);
    };

    const handleError = () => {
      console.error("❌ PRICE UPDATE ERROR");

      setProgress({
        visible: false,
        title: "",
        completed: 0,
        total: 0,
        percent: 0,
      });
    };

    socket.on("price-update-progress", handleProgress);
    socket.on("price-update-complete", handleComplete);
    socket.on("price-update-error", handleError);

    return () => {
      socket.off("price-update-progress", handleProgress);
      socket.off("price-update-complete", handleComplete);
      socket.off("price-update-error", handleError);
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
