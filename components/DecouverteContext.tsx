"use client";

import { createContext, useContext } from "react";

export type ModeDecouverte = {
  estConnecte: boolean;
  maxQuestions: number; // 5 si non connecté, 10 si connecté
};

export const DecouverteContext = createContext<ModeDecouverte>({
  estConnecte: true,
  maxQuestions: 10,
});

export const useDecouverte = () => useContext(DecouverteContext);
