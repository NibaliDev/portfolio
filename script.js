
// Även om det inte var nödvändigt, ville jag testa skapa en vanilla HTML-komponent, eftersom jag har jobbat mycket med React tidigare.
class MinKomponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="global-card">
        <header>
          <h1>Nils Röjare</h1>
        </header>
        <nav>
          <a href="#" class="active" data-img="0" data-section="0">Skidåkning</a>
          <a href="#" class="" data-img="3" data-section="1">Jakt</a>
          <a href="#" class="" data-img="4" data-section="2">Matlagning</a>
          <a href="#" class="" data-img="5" data-section="3">Aktier</a>
          <a href="#" class="" data-img="6" data-section="4">Klassisk musik</a>
        </nav>
      </div>
    `;
  }
}
customElements.define('min-komponent', MinKomponent);


// Event-listener som kör om funktionen varje gång sidan laddar om.
window.addEventListener("load", function () {
  const images = gsap.utils.toArray(".slide-img"); // Hämta alla bilder och spara i form av en array.
  let currentIndex = 0;
  let isLocked = false;

  const TRANSITION_DURATION = 0.6; // Transitionen ska inte vara långsam och tråkig.
  const LOCK_TIME = 900; // Man ska tvingas stanna på varje bild en stund innan man går vidare; i anant fall blir scrollen för känslig.

  // Uppdatear naven när en annan länk tillhör den bild som för närvarande visas.
  function updateActiveNav(index) {
    const section = images[index].dataset.section; // Hämta vilken index för den länk tillhör bilden som för närvarande visas.
    
    document.querySelectorAll("nav a").forEach(link => link.classList.remove("active")); // Gör alla länkar i nav osynliga.
    document.querySelector(`nav a[data-section="${section}"]`)?.classList.add("active"); // Gör länk till aktiv bild synnlig i nav.

  }

  // Byt bild.
  function goToIndex(newIndex) {
    if (isLocked) return; // Man ska tvingas stanna på varje bild en stund innan man går vidare; i anant fall blir scrollen för känslig.
    newIndex = Math.max(0, Math.min(images.length - 1, newIndex)); // Räkna ut index för nästa bild. Ta hänsyn till att det inte finns oändligt mycket bilder.
    if (newIndex === currentIndex) return; // Redundans

    // Inled låsningen under LOCK_TIME.
    isLocked = true;

    // Används gsap för att byta bild med en cool transition.
    gsap.to(images[currentIndex], { opacity: 0, duration: TRANSITION_DURATION, ease: "power1.inOut" }); // Minska opacity av nuvarande bild.
    gsap.to(images[newIndex], { opacity: 1, duration: TRANSITION_DURATION, ease: "power1.inOut" }); // Höj opacity av kommande bild.

    // Uppdatera naven så att länken till den aktiva bild är synlig i nav.
    currentIndex = newIndex;
    updateActiveNav(currentIndex);

    setTimeout(() => { isLocked = false; }, LOCK_TIME); // Man ska tvingas stanna på varje bild en stund innan man går vidare; i anant fall blir scrollen för känslig.
  }

  // Om användaren scrollar ska bilden bytas.
  window.addEventListener("wheel", (e) => {
    e.preventDefault(); // Undvik att webbläsarens standardbeteende interfererar med denna funktion.
    if (e.deltaY > 0) goToIndex(currentIndex + 1); // Öka index om man scrollar ned.
    else if (e.deltaY < 0) goToIndex(currentIndex - 1); // Minska index om man scrollar ned.
  }, { passive: false });

  // Registrera en touch.
  let touchStartY = 0;
  window.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY; // Spara var touchen skedde i Y-led.
  }, { passive: true });

  // Om en swipe sker ska bilden bytas.
  window.addEventListener("touchend", (e) => {
    const diff = touchStartY - e.changedTouches[0].clientY; // Räkna ut swipens differens. 
    if (Math.abs(diff) < 30) return;
    goToIndex(currentIndex + (diff > 0 ? 1 : -1)); // Öka index om differensen är större än 0, minska index om differensen är mindre än 0.
  }, { passive: true });

  // Selecta varje länk i nav.
  document.querySelectorAll("nav a[data-section]").forEach((link) => {

    // Om någon av länkarna klickas på, ska bilden bytas till den första tillhörande den länken.
    link.addEventListener("click", (e) => {
      e.preventDefault(); // Undvik att webbläsarens standardbeteende interfererar med denna funktion.
      const section = link.dataset.section;
      const targetIndex = images.findIndex(img => img.dataset.section === section); // Hitta den första bilden tillhörande den länk som har klickats på.
      goToIndex(targetIndex); // Visa bilden tillhörande den första bilden tillhörande den länk som har klickats på.
    });
  });

  updateActiveNav(0); // Visa den första bilden när sidan laddas in.
});