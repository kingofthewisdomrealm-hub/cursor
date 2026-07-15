import type { DoshaType } from "@/types";

export interface DoshaProfile {
  type: DoshaType;
  name: string;
  element: string;
  color: string;
  colorClass: string;
  bgClass: string;
  accentClass: string;
  qualities: string[];
  personality: string;
  bodyProfile: string;
  strengths: string[];
  imbalanceSigns: string[];
  increase: string[];
  reduce: string[];
  yogaNeeds: string[];
  avoid: string[];
  recommendedYoga: string;
  recommendedBreathing: string;
  recommendedMeditation: string;
}

export const DOSHA_PROFILES: Record<DoshaType, DoshaProfile> = {
  vata: {
    type: "vata",
    name: "Vata",
    element: "Air & Ether",
    color: "#7B9EB8",
    colorClass: "text-vata",
    bgClass: "bg-vata-soft",
    accentClass: "border-vata/40",
    qualities: [
      "Creative",
      "Fast-thinking",
      "Energetic in bursts",
      "Flexible",
      "Easily overstimulated",
      "May experience anxiety or irregular sleep",
    ],
    personality:
      "You move like the wind — quick ideas, imaginative leaps, and a natural adaptability. When balanced, you are inspired and light. When depleted, you may feel scattered or unsettled.",
    bodyProfile:
      "Typically a lighter frame, cooler extremities, dry or delicate skin, and an energy pattern that rises quickly then dips. Digestion and sleep can be irregular when out of rhythm.",
    strengths: [
      "Creativity and intuition",
      "Mental agility",
      "Adaptability under change",
      "Natural flexibility",
      "Enthusiasm for new experiences",
    ],
    imbalanceSigns: [
      "Anxiety or racing thoughts",
      "Irregular sleep",
      "Dry skin or joints",
      "Scattered focus",
      "Cold hands and feet",
      "Inconsistent appetite",
    ],
    increase: [
      "Warmth and grounding foods",
      "Consistent daily routines",
      "Slow, steady movement",
      "Oil massage and restful sleep",
      "Calm, rhythmic breathwork",
    ],
    reduce: [
      "Excessively fast flows",
      "Too many transitions",
      "Overstimulation and screens late at night",
      "Cold environments",
      "Irregular mealtimes",
    ],
    yogaNeeds: [
      "Grounding",
      "Slower movements",
      "Longer holds",
      "Stability",
      "Calm breathing",
      "Consistent routines",
    ],
    avoid: [
      "Excessively fast flows",
      "Too many transitions",
      "Overstimulation",
      "Cold environments",
    ],
    recommendedYoga: "Grounding, stable flows with longer holds",
    recommendedBreathing: "Nadi Shodhana (alternate nostril) and slow diaphragmatic breath",
    recommendedMeditation: "Body-scan or guided grounding meditation",
  },
  pitta: {
    type: "pitta",
    name: "Pitta",
    element: "Fire & Water",
    color: "#D4845A",
    colorClass: "text-pitta",
    bgClass: "bg-pitta-soft",
    accentClass: "border-pitta/40",
    qualities: [
      "Focused",
      "Driven",
      "Competitive",
      "Organized",
      "Intense",
      "May become frustrated or overheated",
    ],
    personality:
      "You burn with clear purpose — focused, decisive, and naturally organized. When balanced, you lead with warmth and clarity. When overheated, intensity can tip into impatience.",
    bodyProfile:
      "Often a medium, athletic build with warm skin, strong digestion, and sharp focus. You may run warm and thrive with cooling practices and moderate pacing.",
    strengths: [
      "Focus and determination",
      "Leadership and organization",
      "Strong digestion and metabolism",
      "Courage under pressure",
      "Clear decision-making",
    ],
    imbalanceSigns: [
      "Irritability or frustration",
      "Overheating",
      "Skin inflammation",
      "Acidic digestion",
      "Competitive self-pressure",
      "Difficulty winding down",
    ],
    increase: [
      "Cooling practices and environments",
      "Relaxed pacing",
      "Hip openers and gentle twists",
      "Soft, cooling foods",
      "Rest without agenda",
    ],
    reduce: [
      "Excessive heat",
      "Aggressive practice",
      "Competitive goals",
      "Very intense breathwork",
      "Overworking without recovery",
    ],
    yogaNeeds: [
      "Cooling movements",
      "Relaxed pacing",
      "Noncompetitive practice",
      "Hip openers",
      "Gentle twists",
      "Cooling breathwork",
    ],
    avoid: [
      "Excessive heat",
      "Aggressive practice",
      "Competitive goals",
      "Very intense breathwork",
    ],
    recommendedYoga: "Cooling, noncompetitive flows with hip openers and twists",
    recommendedBreathing: "Sheetali or slow relaxed ujjayi (gentle)",
    recommendedMeditation: "Loving-kindness or cooling visualizations",
  },
  kapha: {
    type: "kapha",
    name: "Kapha",
    element: "Earth & Water",
    color: "#3D7A6A",
    colorClass: "text-kapha",
    bgClass: "bg-kapha-soft",
    accentClass: "border-kapha/40",
    qualities: [
      "Stable",
      "Calm",
      "Loyal",
      "Patient",
      "Strong",
      "May experience low motivation or sluggishness",
    ],
    personality:
      "You are the steady earth — calm, nurturing, and enduring. When balanced, you offer loyalty and strength. When stagnant, energy can feel heavy and motivation slows.",
    bodyProfile:
      "Often a sturdy, grounded frame with smooth skin, steady energy, and strong endurance. You may prefer warmth and benefit from stimulating movement to stay light and clear.",
    strengths: [
      "Stability and patience",
      "Emotional loyalty",
      "Physical endurance",
      "Calm presence",
      "Consistent care for others",
    ],
    imbalanceSigns: [
      "Low motivation",
      "Heaviness or lethargy",
      "Congestion",
      "Attachment to routine",
      "Slow digestion",
      "Difficulty starting",
    ],
    increase: [
      "Energizing movement",
      "Faster transitions",
      "Strength and challenge",
      "Heat-building sequences",
      "Stimulating breathwork",
    ],
    reduce: [
      "Very slow routines",
      "Excessive rest",
      "Repetitive gentle practice",
      "Long periods of inactivity",
      "Heavy, oily foods in excess",
    ],
    yogaNeeds: [
      "Energizing movement",
      "Faster transitions",
      "Strength",
      "Heat",
      "Challenge",
      "Stimulating breathwork",
    ],
    avoid: [
      "Very slow routines",
      "Excessive rest",
      "Repetitive gentle practice",
      "Long periods of inactivity",
    ],
    recommendedYoga: "Energizing, strengthening flows with dynamic transitions",
    recommendedBreathing: "Kapalabhati (gentle) or stimulating breath of fire variations",
    recommendedMeditation: "Walking meditation or energizing intention-setting",
  },
};

export const DOSHA_ORDER: DoshaType[] = ["vata", "pitta", "kapha"];
