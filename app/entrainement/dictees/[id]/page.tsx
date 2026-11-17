import DicteeExercice from "@/components/entrainement/DicteeExercice";
import { DICTEES, getDictee } from "@/lib/entrainement/dictees";
import { notFound } from "next/navigation";

// Une page générée par dictée au moment du build
export function generateStaticParams() {
  return DICTEES.map((d) => ({ id: d.id }));
}

export const dynamicParams = false;

export default async function PageDictee({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dictee = getDictee(id);
  if (!dictee) notFound();
  return <DicteeExercice dictee={dictee} />;
}
