export const C = {
  bg: "linear-gradient(122deg, #123D32 0%, #1B5A45 39%, #50C878 72%, #F2F6F1 118%)",
  card: "#FFFFFF",
  cardAlt: "#E2EEE6",
  ink: "#163A31",
  sub: "#59756B",
  border: "#C9DDD1",
  green900: "#174A3B",
  green700: "#087F5B",
  green600: "#0A9F6E",
  green200: "#B7DCC9",
  green100: "#E2F2E8",
  amber: "#C78332",
  amberBg: "#F8EEDC",
  red: "#B84D4D",
  redBg: "#F8E3E0",
};

export const FONT = "'Manrope', 'Avenir Next', 'Segoe UI', sans-serif";

export function tierColor(v) {
  if (v >= 70) return { fg: C.green600, bg: C.green100 };
  if (v >= 40) return { fg: C.amber, bg: C.amberBg };
  return { fg: C.red, bg: C.redBg };
}
