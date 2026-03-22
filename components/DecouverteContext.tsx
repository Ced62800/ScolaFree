"use client";

import { createContext, useContext } from "react";

export type ModeDecouverte = {
  estConnecte: boolean;
  maxQuestions: number;
};

export const DecouverteContext = createContext<ModeDecouverte>({
  estConnecte: false,
  maxQuestions: 5,
});

export const useDecouverte = () => useContext(DecouverteContext);
