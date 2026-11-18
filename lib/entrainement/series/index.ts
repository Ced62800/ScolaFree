import type { DonneesNotion, Serie } from "../types";
import aAsA from "./a-as-a";
import cesSes from "./ces-ses";
import etEst from "./et-est";
import onOnt from "./on-ont";
import sonSont from "./son-sont";

// Un fichier par notion. Pour ajouter une notion :
// 1. créer series/<notion>.ts sur le modèle de et-est.ts ;
// 2. l'importer ici et l'ajouter à DONNEES.
export const DONNEES: DonneesNotion[] = [etEst, aAsA, onOnt, sonSont, cesSes];

export const SERIES: Serie[] = DONNEES.flatMap((d) => d.series);

export function getSerie(id: string): Serie | undefined {
  return SERIES.find((s) => s.id === id);
}

export function getSeriesPourNotion(notion: string): Serie[] {
  return SERIES.filter((s) => s.notion === notion);
}
