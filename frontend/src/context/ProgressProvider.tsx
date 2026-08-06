import { useEffect, useMemo, useState, type ReactNode } from "react";
import { io } from "socket.io-client";

import { ProgressContext, type ProgressState } from "./progressContext";

const socket = io("https://marketplacepriceupdater.onrender.com");

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<ProgressState>({
    visible: false,
    title: "",
    completed: 0,
    total: 0,
    percent: 0,
  });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

    socket.on("price-update-progress", (data) => {
      console.log("🟢 Progress received:", data);

      setProgress((prev) => ({
        ...prev,
        visible: true,
        completed: data.completed,
        total: data.total,
        percent: data.percent,
      }));
    });

    socket.on("price-update-complete", () => {
      console.log("✅ Complete received");

      setTimeout(() => {
        setProgress({
          visible: false,
          title: "",
          completed: 0,
          total: 0,
          percent: 0,
        });
      }, 500);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("price-update-progress");
      socket.off("price-update-complete");
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
