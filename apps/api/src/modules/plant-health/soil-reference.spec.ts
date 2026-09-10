import {
  classifyNitrogen,
  classifyPhosphorus,
  classifyPotassium,
  classifyPh,
  phRecommendation,
} from "@fms/shared";

describe("soil testing kit reference tables", () => {
  it("classifies nitrogen bands exactly as printed on the kit's chart", () => {
    expect(classifyNitrogen(40).code).toBe("L1");
    expect(classifyNitrogen(49.9).code).toBe("L1");
    expect(classifyNitrogen(50).code).toBe("L2");
    expect(classifyNitrogen(99).code).toBe("L2");
    expect(classifyNitrogen(100).code).toBe("M1");
    expect(classifyNitrogen(150).code).toBe("M1");
    expect(classifyNitrogen(151).code).toBe("M2");
    expect(classifyNitrogen(200).code).toBe("M2");
    expect(classifyNitrogen(201).code).toBe("H1");
    expect(classifyNitrogen(300).code).toBe("H1");
    expect(classifyNitrogen(301).code).toBe("H2");
  });

  it("maps nitrogen bands to the Low/Medium/High summary from the kit", () => {
    expect(classifyNitrogen(80).level).toBe("LOW");
    expect(classifyNitrogen(150).level).toBe("MEDIUM");
    expect(classifyNitrogen(250).level).toBe("HIGH");
  });

  it("classifies phosphorus bands exactly as printed on the kit's chart", () => {
    expect(classifyPhosphorus(0.5).code).toBe("L1");
    expect(classifyPhosphorus(2).code).toBe("L2");
    expect(classifyPhosphorus(5).code).toBe("M1");
    expect(classifyPhosphorus(9).code).toBe("M2");
    expect(classifyPhosphorus(12).code).toBe("H1");
    expect(classifyPhosphorus(20).code).toBe("H2");
  });

  it("classifies potassium bands exactly as printed on the kit's chart", () => {
    expect(classifyPotassium(10).code).toBe("L1");
    expect(classifyPotassium(30).code).toBe("L2");
    expect(classifyPotassium(60).code).toBe("M1");
    expect(classifyPotassium(100).code).toBe("M2");
    expect(classifyPotassium(130).code).toBe("H1");
    expect(classifyPotassium(200).code).toBe("H2");
  });

  it("finds the nearest pH reaction on the chart", () => {
    expect(classifyPh(4.0).reaction).toBe("Intensely Acidic");
    expect(classifyPh(7.0).reaction).toBe("Neutral");
    expect(classifyPh(10.0).reaction).toBe("Very Intensely Alkaline");
    expect(classifyPh(6.9).reaction).toBe("Neutral"); // nearest of 6.5/7.0
  });

  it("only recommends lime below pH 5.0 and gypsum above pH 8.0", () => {
    expect(phRecommendation(4.5)).toMatch(/lime/i);
    expect(phRecommendation(8.5)).toMatch(/gypsum/i);
    expect(phRecommendation(6.8)).not.toMatch(/lime|gypsum/i);
  });
});
