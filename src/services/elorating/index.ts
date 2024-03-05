export function calculateExpectedScore(ratingA: any, ratingB: any) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function calculateRatingChange(
  ratingA: any,
  expectedScoreA: any,
  actualScoreA: any,
  kFactor: any
) {
  return Math.round(kFactor * (actualScoreA - expectedScoreA));
}

export function updateRatings(
  ratingA: any,
  ratingB: any,
  actualScoreA: any,
  kFactor: any
) {
  const expectedScoreA = calculateExpectedScore(ratingA, ratingB);
  const ratingChangeA = calculateRatingChange(
    ratingA,
    expectedScoreA,
    actualScoreA,
    kFactor
  );

  const newRatingA = ratingA + ratingChangeA;
  const newRatingB = ratingB - ratingChangeA;

  return [newRatingA, newRatingB];
}
