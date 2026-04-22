function lerTexto(texto){
  const msg = new SpeechSynthesisUtterance(texto);
  msg.lang = "pt-BR";
  speechSynthesis.cancel();
  speechSynthesis.speak(msg);
}