import type { DoshaPercentages, DoshaResult, DoshaType, QuizAnswer } from "@/types";

export function calculateDoshaResult(answers: QuizAnswer[]): DoshaResult {
  const points: DoshaPercentages = { vata: 0, pitta: 0, kapha: 0 };

  for (const answer of answers) {
    points[answer.doshaType] += answer.points;
  }

  const total = points.vata + points.pitta + points.kapha || 1;

  const percentages: DoshaPercentages = {
    vata: Math.round((points.vata / total) * 100),
    pitta: Math.round((points.pitta / total) * 100),
    kapha: Math.round((points.kapha / total) * 100),
  };

  // Fix rounding so percentages always sum to 100
  const sum = percentages.vata + percentages.pitta + percentages.kapha;
  if (sum !== 100) {
    const dominant = (Object.entries(percentages) as [DoshaType, number][]).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    percentages[dominant] += 100 - sum;
  }

  const ranked = (Object.entries(percentages) as [DoshaType, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  return {
    percentages,
    primary: ranked[0][0],
    secondary: ranked[1][0],
    points,
  };
}
