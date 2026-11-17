import SerieExercice from "@/components/entrainement/SerieExercice";
import { getSerie, SERIES } from "@/lib/entrainement/series";
import { notFound } from "next/navigation";

// Une page générée par série au moment du build
export function generateStaticParams() {
  return SERIES.map((s) => ({ id: s.id }));
}

export const dynamicParams = false;

export default async function PageSerie({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const serie = getSerie(id);
  if (!serie) notFound();
  return <SerieExercice serie={serie} />;
}
