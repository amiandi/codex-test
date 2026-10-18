import { useEffect, useId, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Flame,
  Info,
  Leaf,
  RotateCcw,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { calculateGas, parseWeight } from "./calculator";
import { defaults, loadInputs, STORAGE_KEY } from "./storage";
import type { Inputs } from "./storage";

const kg = (value: number) =>
  new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(value);
export default function App() {
  const [inputs, setInputs] = useState(loadInputs);
  const [storageFailed, setStorageFailed] = useState(false);
  const id = useId();
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {
      setStorageFailed(true);
    }
  }, [inputs]);
  const update = (key: keyof Inputs, value: string) =>
    setInputs((previous) => ({ ...previous, [key]: value }));
  const capacity = parseWeight(
    inputs.size === "custom" ? inputs.custom : inputs.size,
  );
  const hasWeights = inputs.tare.trim() !== "" || inputs.total.trim() !== "";
  const result = calculateGas({
    capacity,
    tare: parseWeight(inputs.tare),
    total: parseWeight(inputs.total),
  });
  const valid = result.ok;
  const percentage = valid ? result.percentage : 0;
  const status = !valid
    ? "Bereit für deine Messung"
    : percentage === 0
      ? "Deine Flasche ist leer"
      : percentage <= 20
        ? "Zeit für einen Nachschub"
        : "Da ist noch was drin";
  function weightField(
    key: "tare" | "total",
    label: string,
    description: string,
    placeholder: string,
  ) {
    return (
      <div className="field">
        <label htmlFor={`${id}-${key}`}>{label}</label>
        <p id={`${id}-${key}-hint`}>{description}</p>
        <div className="input-wrap">
          <input
            id={`${id}-${key}`}
            inputMode="decimal"
            type="text"
            placeholder={placeholder}
            value={inputs[key]}
            onChange={(event) => update(key, event.target.value)}
            aria-describedby={`${id}-${key}-hint${hasWeights && !valid ? ` ${id}-error` : ""}`}
            aria-invalid={hasWeights && !valid}
          />
          <span>kg</span>
        </div>
      </div>
    );
  }
  return (
    <div className="app">
      <header className="header">
        <a className="brand" href="#" aria-label="Propanpegel Startseite">
          <span className="brand-icon">
            <Flame size={22} />
          </span>
          propan<span className="brand-light">pegel</span>
          <span className="brand-dot">.</span>
        </a>
        <span className="header-note">
          <span /> Weniger schätzen. Mehr wissen.
        </span>
      </header>
      <main>
        <section className="intro">
          <div className="eyebrow">
            <span /> DEIN GAS. IM BLICK.
          </div>
          <h1>
            Wissen, was
            <br className="mobile-break" /> <span>noch drin ist.</span>
          </h1>
          <p>
            Ob Grillabend, Camping oder unterwegs: Berechne in Sekunden,
            <br className="desktop-break" /> wie viel Gas deine Propangasflasche
            noch hat.
          </p>
        </section>
        <div className="calculator-layout">
          <section className="form-card" aria-labelledby="calculator-title">
            <div className="card-heading">
              <span className="step">01</span>
              <div>
                <h2 id="calculator-title">Einmal wiegen, Bescheid wissen.</h2>
                <p>Alles, was du brauchst, sind zwei Gewichte.</p>
              </div>
              <Scale className="heading-icon" size={23} />
            </div>
            <form onSubmit={(event) => event.preventDefault()}>
              <fieldset>
                <legend>Welche Flasche hast du?</legend>
                <div className="size-options">
                  {(["5", "8", "11", "custom"] as const).map((size) => (
                    <label
                      className={`size-option ${inputs.size === size ? "selected" : ""}`}
                      key={size}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={size}
                        checked={inputs.size === size}
                        onChange={() => update("size", size)}
                      />
                      {size === "custom" ? (
                        "Andere"
                      ) : (
                        <>
                          {size}
                          <span>kg</span>
                        </>
                      )}
                      {inputs.size === size && <Check size={13} />}
                    </label>
                  ))}
                </div>
              </fieldset>
              {inputs.size === "custom" && (
                <div className="field custom-field">
                  <label htmlFor={`${id}-custom`}>
                    Nennfüllmenge deiner Flasche
                  </label>
                  <div className="input-wrap">
                    <input
                      id={`${id}-custom`}
                      inputMode="decimal"
                      value={inputs.custom}
                      onChange={(event) => update("custom", event.target.value)}
                      placeholder="z. B. 3"
                    />
                    <span>kg</span>
                  </div>
                </div>
              )}
              {weightField(
                "tare",
                "Tara-Gewicht",
                "Das Leergewicht – auf deiner Flasche eingeprägt.",
                "z. B. 10,5",
              )}
              {weightField(
                "total",
                "Aktuelles Gesamtgewicht",
                "Das Gewicht der Flasche inklusive verbleibendem Gas.",
                "z. B. 17,8",
              )}
              {hasWeights && !valid && (
                <p className="error" id={`${id}-error`} role="alert">
                  {result.message}
                </p>
              )}
              <div className="automatic">
                <span>
                  <span className="live-dot" /> Wird automatisch berechnet
                </span>
                <button
                  type="button"
                  onClick={() => setInputs({ ...defaults })}
                  title="Alle Eingaben zurücksetzen"
                >
                  <RotateCcw size={14} /> Zurücksetzen
                </button>
              </div>
            </form>
            <div className="local-note">
              <ShieldCheck size={15} />
              {storageFailed
                ? "Speichern nicht verfügbar. Die Berechnung funktioniert weiterhin."
                : "Deine letzten Eingaben bleiben in diesem Browser gespeichert."}
            </div>
          </section>
          <section
            className={`result-card ${valid && percentage <= 20 ? "low" : ""}`}
            aria-labelledby="result-title"
          >
            <div className="result-top">
              <span className="eyebrow">DEIN FÜLLSTAND</span>
              <span className="result-live">
                <span /> LIVE
              </span>
            </div>
            <div className="result-visual">
              <div
                className="bottle"
                role="img"
                aria-label={
                  valid
                    ? `Flasche zu ${kg(percentage)} Prozent gefüllt`
                    : "Flasche wartet auf Gewichtsangaben"
                }
              >
                <div className="bottle-handle" />
                <div className="bottle-neck" />
                <div className="bottle-body">
                  <div
                    className="gas-fill"
                    style={{ height: `${percentage}%` }}
                  />
                  <div className="bottle-shine" />
                  <Flame className="bottle-flame" size={32} />
                  <div className="bottle-line one" />
                  <div className="bottle-line two" />
                </div>
                <div className="bottle-base" />
              </div>
              <div className="gauge">
                <span>100%</span>
                <div className="gauge-track">
                  <div
                    className="gauge-marker"
                    style={{ bottom: `${percentage}%` }}
                  />
                </div>
                <span>0%</span>
              </div>
            </div>
            <div
              className="result-numbers"
              aria-live="polite"
              aria-atomic="true"
            >
              <h2 id="result-title">
                {valid ? kg(percentage) : "–"}
                <span>%</span>
              </h2>
              <p>
                {valid ? (
                  <>
                    <strong>{kg(result.remaining)} kg</strong> von{" "}
                    {kg(capacity)} kg Gas verbleibend
                  </>
                ) : (
                  "Trage deine Gewichte ein, um loszulegen."
                )}
              </p>
              <div className="status-pill">
                <span />
                {status}
              </div>
            </div>
            <div className="result-footer">
              <Leaf size={15} />
              <span>Gut vorbereitet. Entspannt draußen.</span>
            </div>
          </section>
        </div>
        <section className="how-to" aria-labelledby="how-title">
          <div className="how-heading">
            <span className="small-label">SO EINFACH GEHT’S</span>
            <h2 id="how-title">Drei Schritte. Keine Überraschungen.</h2>
          </div>
          <div className="steps">
            <article>
              <span className="instruction-icon">
                <Info size={20} />
              </span>
              <div>
                <h3>1. Tara ablesen</h3>
                <p>
                  Das Leergewicht findest du am Griff
                  <br className="desktop-break" /> oder auf dem Kragen deiner
                  Flasche.
                </p>
              </div>
            </article>
            <ArrowRight className="step-arrow" size={18} />
            <article>
              <span className="instruction-icon">
                <Scale size={20} />
              </span>
              <div>
                <h3>2. Flasche wiegen</h3>
                <p>
                  Stelle die Flasche auf eine Waage.
                  <br className="desktop-break" /> Eine Personenwaage reicht
                  aus.
                </p>
              </div>
            </article>
            <ArrowRight className="step-arrow" size={18} />
            <article>
              <span className="instruction-icon">
                <Flame size={20} />
              </span>
              <div>
                <h3>3. Füllstand kennen</h3>
                <p>
                  Gewichte eintragen und direkt sehen,
                  <br className="desktop-break" /> wie viel Gas noch übrig ist.
                </p>
              </div>
            </article>
          </div>
        </section>
        <aside className="tip">
          <Info size={18} />
          <p>
            <strong>Gut zu wissen:</strong> Wir rechnen mit Gewicht, nicht mit
            Druck. So erhältst du auch bei wechselnden Temperaturen eine
            verlässliche Schätzung. Die Genauigkeit hängt von deiner Waage und
            den Tara-Angaben ab.
          </p>
        </aside>
      </main>
      <footer>
        <span>
          propanpegel<span className="brand-dot">.</span>{" "}
          <span className="footer-divider">/</span> Für alles, was du draußen
          vorhast.
        </span>
        <span>
          Ohne Anmeldung. Ohne Datenübertragung. <ArrowDown size={13} />
        </span>
      </footer>
    </div>
  );
}
