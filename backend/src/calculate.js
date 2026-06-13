function calculateSplit(totalAmount, people) {
  if (totalAmount === undefined || totalAmount === null) {
    throw new Error("Amount is required");
  }

  if (typeof totalAmount !== "number" || isNaN(totalAmount)) {
    throw new Error("Amount must be a number");
  }

  if (totalAmount < 0) {
    throw new Error("Amount cannot be negative");
  }

  if (!Array.isArray(people) || people.length === 0) {
    throw new Error("No people provided");
  }

  const cleanedPeople = people.map(p => String(p).trim()).filter(Boolean);

  if (cleanedPeople.length === 0) {
    throw new Error("No valid people provided");
  }

  const uniquePeople = [...new Set(cleanedPeople)];

  const share = Math.round((totalAmount / uniquePeople.length) * 100) / 100;

  return uniquePeople.map(name => ({
    name,
    owes: share
  }));
}

function calculateUnequalSplit(totalAmount, people) {
  if (!Array.isArray(people) || people.length === 0) {
    throw new Error("No people provided");
  }

  const total = Number(totalAmount);

  if (isNaN(total) || total < 0) {
    throw new Error("Amount must be a non-negative number");
  }

  people.forEach((p, i) => {
    if (!p || !String(p.name || "").trim()) {
      throw new Error(`Person at index ${i} has no name`);
    }
    if (p.amount === undefined || p.amount === null || isNaN(Number(p.amount)) || Number(p.amount) < 0) {
      throw new Error(`Invalid amount for ${p.name}`);
    }
  });

  const sum = Math.round(people.reduce((acc, p) => acc + Number(p.amount), 0) * 100) / 100;
  const roundedTotal = Math.round(total * 100) / 100;

  if (Math.abs(sum - roundedTotal) > 0.02) {
    throw new Error(`Individual amounts (${sum}) must sum to total (${roundedTotal})`);
  }

  return people
    .filter(p => String(p.name).trim())
    .map(p => ({
      name: String(p.name).trim(),
      owes: Math.round(Number(p.amount) * 100) / 100,
      percentage: total > 0 ? Math.round((Number(p.amount) / total) * 10000) / 100 : 0,
    }));
}

module.exports = { calculateSplit, calculateUnequalSplit };