import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notyf = new Notyf({
  duration: 4000,
  position: {
    x: "right",
    y: "top",
  },
  ripple: false,
  dismissible: true,
  types: [
    {
      type: "critical",
      background: "#b91c1c",
      icon: {
        className: "notyf__icon--error",
        tagName: "i",
      },
    },
    {
      type: "high",
      background: "#f97316",
    },
    {
      type: "medium",
      background: "#2563eb",
    },
    {
      type: "low",
      background: "#16a34a",
    },
  ],
});

const sounds = {
  critical: "/sounds/preview.mp3",
  high: "/sounds/preview-1.mp3",
  medium: "/sounds/preview-2.mp3",
  low: "/sounds/medium.mp3",
};

let lastAlertTime = 0;

const playSound = (severity) => {
  const now = Date.now();
  if (now - lastAlertTime < 2000) return; // ⛔ throttle spam

  lastAlertTime = now;
  const audio = new Audio(sounds[severity]);
  audio.volume = 0.9;
  audio.play().catch(() => {});
};

export const notifyAlert = ({ title, severity = "medium" }) => {
  playSound(severity);
  notyf.open({
    type: severity,
    message: `🚨 ${title}`,
  });
};
