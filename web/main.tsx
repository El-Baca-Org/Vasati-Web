import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { loadSnapshot, type VasatiSnapshot, type PrayerKey } from "./lib/vasati";
import "./styles.css";

const labels: Record<PrayerKey, string> = {
  imsak: "İmsak", sabah: "Sabah", gunes: "Güneş", israk: "İşrak", kerahet: "Kerahet",
  ogle: "Öğle", ikindi: "İkindi", asr_sani: "Asr-ı Sânî", isfirar_sems: "İsfirâr-ı Şems",
  aksam: "Akşam", istibak_nucum: "İstibâk-ı Nücûm", yatsi: "Yatsı", isa_sani: "İşâ-i Sânî", kible_saati: "Kıble Saati"
};
const order: PrayerKey[] = ["aksam", "istibak_nucum", "yatsi", "isa_sani", "imsak", "sabah", "gunes", "israk", "kerahet", "ogle", "ikindi", "asr_sani", "isfirar_sems", "kible_saati"];

function App() {
  const [snapshot, setSnapshot] = useState<VasatiSnapshot | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { loadSnapshot().then(setSnapshot).catch((e) => setError(String(e))); }, []);
  useEffect(() => {
    const id = window.setInterval(() => loadSnapshot().then(setSnapshot).catch(() => undefined), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (error) return <main className="shell"><div className="error">Vasati verisi yüklenemedi: {error}</div></main>;
  if (!snapshot) return <main className="shell"><div className="loading">Vasati başlatılıyor…</div></main>;
  return (
    <main className="shell">
      <header className="hero">
        <div>
          <div className="eyebrow">VASATÎ · İSTANBUL</div>
          <h1>Klasik Türk Zamanı</h1>
          <p>Modern vakitleri Vasatî zaman sistemine dönüştüren web uygulaması.</p>
        </div>
        <div className="hero-clock"><span>Modern</span><strong>{snapshot.currentGregorian}</strong><small>Vasatî: {snapshot.currentVasati}</small></div>
      </header>
      <section className="stats">
        <div><span>Milâdî</span><b>{snapshot.gregorian.day}.{snapshot.gregorian.month}.{snapshot.gregorian.year}</b><small>{snapshot.gregorian.dayOfYear}. gün</small></div>
        <div><span>Vasatî sene</span><b>{snapshot.vasatiYear}</b><small>hesaplanan yıl</small></div>
        <div><span>Merkez</span><b>İstanbul</b><small>Europe/Istanbul</small></div>
      </section>
      <section className="panel"><div className="panel-head"><h2>Vakitler</h2><span>Vasatî gösterim</span></div><div className="grid">
        {order.map((key) => <article className={`card ${key === "aksam" ? "anchor" : ""}`} key={key}><span>{labels[key]}</span><strong>{snapshot.prayers[key]}</strong><small>{key.replaceAll("_", " ")}</small></article>)}
      </div></section>
      <footer>Vasati Web · C++ hesaplama mantığı TypeScript'e taşındı · Veriler: Vakitler.xml</footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
