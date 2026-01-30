let unlocked = false;
let audioContext = null;

export const unlockAudio = () => {
  if (unlocked) return;

  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  unlocked = true;
  console.log("🔓 Audio unlocked");
};

export const playAlertSound = (severity) => {
  if (!unlocked) return;

  const audio = new Audio(`/sounds/${severity}.mp3`);
  audio.volume = 1;
  audio.currentTime = 0;
  audio.play().catch(() => {});
};
