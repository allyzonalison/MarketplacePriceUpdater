import { createContext } from "react";

export interface ProgressState {
  visible: boolean;
  title: string;
  completed: number;
  total: number;
  percent: number;
}

export interface ProgressContextType {
  progress: ProgressState;
  showProgress: (title: string) => void;
  hideProgress: () => void;
}

export const ProgressContext = createContext<ProgressContextType | null>(null);
