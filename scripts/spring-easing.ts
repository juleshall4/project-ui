/**
 * Prints a CSS linear() easing that follows an Apple-style spring
 * ({ duration, bounce }), plus the time it takes to settle.
 * Usage: bun scripts/spring-easing.ts 0.25 0.2
 */
const [duration = 0.5, bounce = 0.2] = process.argv.slice(2).map(Number);

const omega = (2 * Math.PI) / duration;
const zeta = 1 - bounce;
const damped = omega * Math.sqrt(1 - zeta * zeta);
const position = (t: number) =>
  1 - Math.exp(-zeta * omega * t) * (Math.cos(damped * t) + ((zeta * omega) / damped) * Math.sin(damped * t));

// Settled once it stays within 0.1% of the target.
let settle = duration;
for (let t = duration * 3; t > 0; t -= 0.001) {
  if (Math.abs(1 - position(t)) > 0.001) {
    settle = t;
    break;
  }
}

const steps = 40;
const points = Array.from({ length: steps + 1 }, (_, i) => {
  const value = i === steps ? 1 : position((settle * i) / steps);
  return Number(value.toFixed(4));
});
const overshoot = Math.max(...points);

console.log(`settles in ${Math.round(settle * 1000)}ms, overshoot ${(overshoot - 1) * 100 > 0 ? ((overshoot - 1) * 100).toFixed(1) : 0}%`);
console.log(`linear(${points.join(", ")})`);
