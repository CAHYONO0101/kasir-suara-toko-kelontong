/**
 * Helper for Text-To-Speech in Indonesian
 */
export function speakIndonesian(text: string, enabled: boolean = true) {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
    if (idVoice) {
      utterance.voice = idVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

/**
 * Format numbers into friendly Indonesian voice currency text
 * e.g. 28500 -> "28 ribu 5 ratus rupiah"
 */
export function formatCurrencyVoice(amount: number): string {
  if (amount <= 0) return 'nol rupiah';
  
  if (amount >= 1000000) {
    const jt = (amount / 1000000).toFixed(1);
    return `${jt} juta rupiah`;
  }
  
  const rb = Math.floor(amount / 1000);
  const sisa = amount % 1000;
  
  if (sisa === 0) {
    return `${rb} ribu rupiah`;
  }
  return `${rb} ribu ${sisa} rupiah`;
}
