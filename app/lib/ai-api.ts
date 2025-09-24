// lib/ai-api.ts
export const getPredictionsFromAPI = async (healthData: any[]) => {
  const payload = healthData.map((record) => ({
    Diarrhea: record.symptoms.includes("Diarrhea") ? 1 : 0,
    Vomiting: record.symptoms.includes("Vomiting") ? 1 : 0,
    Fever: record.symptoms.includes("Fever") ? 1 : 0,
    AbdominalPain: record.symptoms.includes("Abdominal Pain") ? 1 : 0,
    Dehydration: record.symptoms.includes("Dehydration") ? 1 : 0,
  }));

  const res = await fetch("http://localhost:5000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to fetch predictions");

  const predictions = await res.json();
  return predictions;
};
