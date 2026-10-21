import "./style.css";
import { ministers } from "./characters.js";

let selectedId = "demir";
const app = document.querySelector("#app");

function render() {
  const selected = ministers.find((minister) => minister.id === selectedId);
  app.innerHTML = `
    <main class="shell">
      <header>
        <a class="brand" href="#">Gölge Şef</a>
        <span>Arayüz prototipi</span>
      </header>
      <section class="intro">
        <span class="eyebrow">Operasyon: Boş Koltuk</span>
        <h1>Kimse masum kalmayacak.</h1>
        <p>Başkan susuyor. Kabine bekliyor. İktidar mücadelesinin merkezinde sen varsın.</p>
      </section>
      <div class="workspace">
        <section aria-labelledby="cabinet-title">
          <h2 id="cabinet-title">Kabine</h2>
          <p class="section-note">Dosyasını görmek için bir bakan seç.</p>
          <div class="candidates">
            ${ministers.map((minister) => `
              <button class="candidate ${minister.id === selectedId ? "selected" : ""}"
                data-select="${minister.id}" aria-pressed="${minister.id === selectedId}">
                <span class="initials">${minister.initials}</span>
                <span><strong>${minister.name}</strong><small>${minister.role}</small></span>
                <span class="power">${minister.power}<small>Nüfuz</small></span>
              </button>
            `).join("")}
          </div>
        </section>
        <section class="dossier" aria-labelledby="dossier-title">
          <span class="eyebrow">Şahıs dosyası</span>
          <h2 id="dossier-title">${selected.name}</h2>
          <span class="role">${selected.role}</span>
          <p>${selected.bio}</p>
          <div class="stat"><span>Siyasi nüfuz</span><strong>${selected.power}/100</strong></div>
          <div class="meter"><span style="width:${selected.power}%"></span></div>
          <p class="development-note">Bu sürümde bakanları seçip profillerini inceleyebilirsin. Operasyon emirleri ve oyun döngüsü geliştirme aşamasında.</p>
        </section>
      </div>
      <footer>Gölge Şef · Geliştirme aşamasında</footer>
    </main>
  `;
  app.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = button.dataset.select;
      render();
      app.querySelector(`[data-select="${selectedId}"]`).focus();
    });
  });
}

render();
