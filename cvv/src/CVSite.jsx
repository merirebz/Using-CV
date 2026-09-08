import React, { useState } from "react";



const emptyForm = {
  name: "",
  title: "",
  phone: "",
  email: "",
  github: "",
  portfolio: "",
  profile: "",
  experience: "", 
  education: "", 
  skills: "", 
  certifications: "",
  languages: "",
  photo: "", 
};

const TEMPLATES = [
  { id: "classic", label: "Classique" },
  { id: "sidebar", label: "Colonne" },
  { id: "minimal", label: "Minimal" },
];



function parseExperience(text) {
  if (!text.trim()) return [];
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const header = lines[0] || "";
      const bullets = lines.slice(1);
      let role = header, company = "", period = "";
      const pipeSplit = header.split("|");
      if (pipeSplit.length > 1) {
        period = pipeSplit[1].trim();
        const left = pipeSplit[0].trim();
        const dashSplit = left.split(/—|-/);
        role = dashSplit[0]?.trim() || left;
        company = dashSplit.slice(1).join("-").trim();
      } else {
        const dashSplit = header.split(/—/);
        role = dashSplit[0]?.trim() || header;
        company = dashSplit.slice(1).join("—").trim();
      }
      return { role, company, period, bullets };
    });
}

function parseEducation(text) {
  if (!text.trim()) return [];
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [degree, school] = line.split("|").map((s) => s?.trim());
      return { degree: degree || line, school: school || "" };
    });
}

function parseSkills(text) {
  if (!text.trim()) return [];
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [category, items] = line.split(":");
      return {
        category: category?.trim() || "Compétences",
        items: (items || "").split(",").map((s) => s.trim()).filter(Boolean),
      };
    });
}

export default function CVSite() {
  const [form, setForm] = useState(emptyForm);
  const [template, setTemplate] = useState("classic");
  const [step, setStep] = useState("form");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const content = {
    name: form.name,
    title: form.title,
    contact: { phone: form.phone, email: form.email, github: form.github, portfolio: form.portfolio },
    profile: form.profile,
    experience: parseExperience(form.experience),
    education: parseEducation(form.education),
    skills: parseSkills(form.skills),
    certifications: form.certifications,
    languages: form.languages,
    photo: form.photo,
  };

  return (
    <div style={{ minHeight: "100%", background: "#F6F4EE", color: "#1E2A24", fontFamily: "'Georgia', serif" }}>
      {step === "form" ? (
        <FormView form={form} update={update} onNext={() => setStep("preview")} />
      ) : (
        <PreviewView content={content} template={template} setTemplate={setTemplate} onBack={() => setStep("form")} />
      )}
    </div>
  );
}



function FormView({ form, update, onNext }) {
  const fields = [
    { key: "name", label: "Nom complet", placeholder: "YOUR NAME" },
    { key: "title", label: "Titre du poste", placeholder: "YOUR POSTE" },
    { key: "phone", label: "Téléphone", placeholder: "YOUR NUMBER" },
    { key: "email", label: "Email", placeholder: "nom@email.coM" },
    { key: "github", label: "GitHub", placeholder: "github.com/..." },
    { key: "portfolio", label: "Portfolio", placeholder: "monportfolio.com" },
  ];

  const textAreas = [
    { key: "profile", label: "Profil", rows: 3, placeholder: "Décris-toi en 2-3 phrases..." },
    {
      key: "experience", label: "Expérience", rows: 6,
      placeholder: "Poste — Entreprise | Période\nCe que tu as fait\nTechnologies utilisées\n\nPoste2 — Entreprise2 | Période2\n...",
      hint: "Une ligne 'Poste — Entreprise | Période', puis les détails en dessous. Laisse une ligne vide entre deux emplois.",
    },
    {
      key: "education", label: "Formation", rows: 2,
      placeholder: "Diplôme | École\nAutre diplôme | Autre école",
      hint: "Une ligne par diplôme, format 'Diplôme | École'.",
    },
    {
      key: "skills", label: "Compétences", rows: 4,
      placeholder: "",
      hint: "Une ligne par catégorie, format 'Catégorie: item1, item2'.",
    },
    { key: "certifications", label: "Certifications", rows: 2, placeholder: "Nom de la certification, organisme..." },
    { key: "languages", label: "Langues", rows: 1, placeholder: "Français, Anglais, Arabe" },
  ];

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 32px 80px" }}>
      <h1 style={{ fontSize: "28px", margin: "0 0 4px", fontWeight: 700 }}>Construis ton CV</h1>
      <p style={{ margin: "0 0 32px", color: "#6B6656", fontSize: "15px" }}>
       
      </p>

      <PhotoUpload value={form.photo} onChange={(v) => update("photo", v)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "8px" }}>
        {fields.map((f) => (
          <FieldInput key={f.key} {...f} value={form[f.key]} onChange={(v) => update(f.key, v)} />
        ))}
      </div>

      {textAreas.map((f) => (
        <FieldTextArea key={f.key} {...f} value={form[f.key]} onChange={(v) => update(f.key, v)} />
      ))}

      <button
        onClick={onNext}
        disabled={!form.name}
        style={{
          marginTop: "16px", padding: "13px 28px",
          background: !form.name ? "#C9C2AE" : "#1E2A24",
          color: "#F6F4EE", border: "none", borderRadius: "2px",
          fontSize: "15px", fontFamily: "'Georgia', serif",
          cursor: !form.name ? "default" : "pointer", letterSpacing: "0.02em",
        }}
      >
        Voir mon CV
      </button>
    </div>
  );
}

function PhotoUpload({ value, onChange }) {
  const [error, setError] = useState("");
  const inputId = "cv-photo-input";

  function handleFile(file) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Merci de choisir un fichier image (JPG, PNG...).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image est trop lourde (5 Mo max).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.onerror = () => setError("Impossible de lire cette image.");
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <span style={{ display: "block", fontSize: "13px", color: "#6B6656", marginBottom: "5px" }}>
        Photo de profil (optionnel)
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "72px", height: "72px", borderRadius: "50%",
            overflow: "hidden", flexShrink: 0,
            border: "1px solid #C9C2AE", background: "#EFEADD",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {value ? (
            <img src={value} alt="Aperçu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "10px", color: "#A8A08A", textAlign: "center", padding: "0 6px" }}>
              Aucune photo
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor={inputId}
            style={{
              display: "inline-block", padding: "8px 16px", fontSize: "13px",
              border: "1px solid #1E2A24", borderRadius: "2px", cursor: "pointer",
              fontFamily: "'Georgia', serif", background: "transparent",
            }}
          >
            {value ? "Changer la photo" : "Ajouter une photo"}
          </label>
          <input
            id={inputId} type="file" accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            style={{ display: "none" }}
          />
          {value && (
            <button
              onClick={() => onChange("")}
              style={{
                display: "block", marginTop: "6px", background: "none", border: "none",
                color: "#A8543A", fontSize: "12.5px", cursor: "pointer",
                fontFamily: "'Georgia', serif", padding: 0,
              }}
            >
              Supprimer la photo
            </button>
          )}
        </div>
      </div>

      {error && <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#A8543A" }}>{error}</p>}
    </div>
  );
}

function FieldInput({ label, placeholder, value, onChange }) {
  return (
    <label style={{ display: "block", fontSize: "13px", color: "#6B6656" }}>
      {label}
      <input
        type="text" value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          display: "block", width: "100%", marginTop: "5px", marginBottom: "14px",
          padding: "9px 10px", fontSize: "14px", fontFamily: "'Georgia', serif",
          border: "1px solid #C9C2AE", borderRadius: "2px", background: "#FFFFFF",
          color: "#1E2A24", boxSizing: "border-box",
        }}
      />
    </label>
  );
}

function FieldTextArea({ label, placeholder, value, onChange, rows, hint }) {
  return (
    <label style={{ display: "block", fontSize: "13px", color: "#6B6656", marginBottom: "14px" }}>
      {label}
      {hint && <span style={{ display: "block", fontSize: "11.5px", color: "#A8543A", marginTop: "2px" }}>{hint}</span>}
      <textarea
        value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} rows={rows}
        style={{
          display: "block", width: "100%", marginTop: "5px", padding: "9px 10px",
          fontSize: "14px", fontFamily: "'Georgia', serif", border: "1px solid #C9C2AE",
          borderRadius: "2px", background: "#FFFFFF", color: "#1E2A24",
          boxSizing: "border-box", resize: "vertical",
        }}
      />
    </label>
  );
}


function PreviewView({ content, template, setTemplate, onBack }) {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 32px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", color: "#6B6656", fontSize: "14px", cursor: "pointer", fontFamily: "'Georgia', serif", padding: 0 }}
        >
          ← Modifier les informations
        </button>

        <div style={{ display: "flex", gap: "8px" }}>
          {TEMPLATES.map((t) => (
            <button
              key={t.id} onClick={() => setTemplate(t.id)}
              style={{
                padding: "7px 14px", fontSize: "13px", fontFamily: "'Georgia', serif",
                border: `1px solid ${template === t.id ? "#1E2A24" : "#C9C2AE"}`,
                background: template === t.id ? "#1E2A24" : "transparent",
                color: template === t.id ? "#F6F4EE" : "#1E2A24",
                borderRadius: "2px", cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>
        {template === "classic" && <ClassicTemplate content={content} />}
        {template === "sidebar" && <SidebarTemplate content={content} />}
        {template === "minimal" && <MinimalTemplate content={content} />}
      </div>

      <p style={{ marginTop: "16px", fontSize: "12.5px", color: "#6B6656", textAlign: "center" }}>
      
      </p>
    </div>
  );
}


function ClassicTemplate({ content: c }) {
  return (
    <div style={{ padding: "48px 52px", color: "#1E2A24" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "22px", marginBottom: "14px" }}>
        {c.photo && (
          <img
            src={c.photo} alt={c.name}
            style={{
              width: "92px", height: "92px", borderRadius: "50%",
              objectFit: "cover", flexShrink: 0, border: "1px solid #C9C2AE",
            }}
          />
        )}
        <div>
          <h1 style={{ fontSize: "30px", margin: 0, fontWeight: 700 }}>{c.name}</h1>
          <p style={{ margin: "4px 0 0", fontStyle: "italic", color: "#A8543A", fontSize: "15px" }}>{c.title}</p>
        </div>
      </div>
      <div style={{ fontFamily: "'Menlo', monospace", fontSize: "11.5px", color: "#6B6656", marginBottom: "18px" }}>
        {[c.contact?.phone, c.contact?.email, c.contact?.github, c.contact?.portfolio].filter(Boolean).join("  ·  ")}
      </div>
      <div style={{ borderBottom: "2px solid #1E2A24", marginBottom: "22px" }} />

      {c.profile && (
        <ClassicSection title="Profil">
          <p style={{ margin: 0, fontSize: "14.5px", lineHeight: 1.55 }}>{c.profile}</p>
        </ClassicSection>
      )}

      {c.experience.length > 0 && (
        <ClassicSection title="Expérience">
          {c.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                <strong style={{ fontSize: "15px" }}>{exp.role}{exp.company ? ` — ${exp.company}` : ""}</strong>
                <span style={{ fontFamily: "'Menlo', monospace", fontSize: "11.5px", color: "#6B6656" }}>{exp.period}</span>
              </div>
              <ul style={{ margin: "6px 0 0", paddingLeft: "20px", fontSize: "14px" }}>
                {exp.bullets.map((b, j) => <li key={j} style={{ marginBottom: "3px" }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </ClassicSection>
      )}

      {c.education.length > 0 && (
        <ClassicSection title="Formation">
          {c.education.map((ed, i) => (
            <div key={i} style={{ marginBottom: "8px" }}>
              <strong style={{ fontSize: "14.5px" }}>{ed.degree}</strong>
              {ed.school && <p style={{ margin: "2px 0 0", fontSize: "13.5px", fontStyle: "italic", color: "#6B6656" }}>{ed.school}</p>}
            </div>
          ))}
        </ClassicSection>
      )}

      {c.skills.length > 0 && (
        <ClassicSection title="Compétences">
          {c.skills.map((s, i) => (
            <p key={i} style={{ margin: "0 0 6px", fontSize: "14px" }}>
              <strong>{s.category} : </strong>{s.items.join(", ")}
            </p>
          ))}
        </ClassicSection>
      )}

      {c.certifications && (
        <ClassicSection title="Certifications">
          <p style={{ margin: 0, fontSize: "14px" }}>{c.certifications}</p>
        </ClassicSection>
      )}

      {c.languages && (
        <ClassicSection title="Langues">
          <p style={{ margin: 0, fontSize: "14px" }}>{c.languages}</p>
        </ClassicSection>
      )}
    </div>
  );
}

function ClassicSection({ title, children }) {
  return (
    <section style={{ marginBottom: "22px" }}>
      <h2 style={{ fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 8px", borderBottom: "1px solid #C9C2AE", paddingBottom: "4px" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}


function SidebarTemplate({ content: c }) {
  return (
    <div style={{ display: "flex", minHeight: "500px", flexWrap: "wrap" }}>
      <aside style={{ width: "34%", minWidth: "220px", background: "#1E2A24", color: "#F6F4EE", padding: "40px 26px" }}>
        {c.photo && (
          <img
            src={c.photo} alt={c.name}
            style={{
              width: "96px", height: "96px", borderRadius: "50%",
              objectFit: "cover", marginBottom: "18px", border: "2px solid #C9A98A",
            }}
          />
        )}
        <h1 style={{ fontSize: "24px", margin: 0, fontWeight: 700, lineHeight: 1.2 }}>{c.name}</h1>
        <p style={{ margin: "6px 0 24px", color: "#C9A98A", fontSize: "13.5px", fontStyle: "italic" }}>{c.title}</p>

        <SidebarBlock title="Contact">
          {[c.contact?.phone, c.contact?.email, c.contact?.github, c.contact?.portfolio].filter(Boolean).map((v, i) => (
            <p key={i} style={{ fontSize: "12px", margin: "2px 0", fontFamily: "'Menlo', monospace" }}>{v}</p>
          ))}
        </SidebarBlock>

        {c.skills.length > 0 && (
          <SidebarBlock title="Compétences">
            {c.skills.map((s, i) => (
              <p key={i} style={{ fontSize: "12.5px", margin: "0 0 8px" }}>
                <strong>{s.category}</strong><br />{s.items.join(", ")}
              </p>
            ))}
          </SidebarBlock>
        )}

        {c.languages && (
          <SidebarBlock title="Langues">
            <p style={{ fontSize: "12.5px", margin: 0 }}>{c.languages}</p>
          </SidebarBlock>
        )}
      </aside>

      <main style={{ width: "66%", minWidth: "260px", flex: 1, padding: "40px 36px", color: "#1E2A24" }}>
        {c.profile && (
          <MainBlock title="Profil">
            <p style={{ margin: 0, fontSize: "14.5px", lineHeight: 1.55 }}>{c.profile}</p>
          </MainBlock>
        )}

        {c.experience.length > 0 && (
          <MainBlock title="Expérience">
            {c.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "15px" }}>{exp.role}{exp.company ? ` — ${exp.company}` : ""}</strong>
                  <span style={{ fontFamily: "'Menlo', monospace", fontSize: "11.5px", color: "#6B6656" }}>{exp.period}</span>
                </div>
                <ul style={{ margin: "6px 0 0", paddingLeft: "20px", fontSize: "14px" }}>
                  {exp.bullets.map((b, j) => <li key={j} style={{ marginBottom: "3px" }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </MainBlock>
        )}

        {c.education.length > 0 && (
          <MainBlock title="Formation">
            {c.education.map((ed, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <strong style={{ fontSize: "14.5px" }}>{ed.degree}</strong>
                {ed.school && <p style={{ margin: "2px 0 0", fontSize: "13.5px", fontStyle: "italic", color: "#6B6656" }}>{ed.school}</p>}
              </div>
            ))}
          </MainBlock>
        )}

        {c.certifications && (
          <MainBlock title="Certifications">
            <p style={{ margin: 0, fontSize: "14px" }}>{c.certifications}</p>
          </MainBlock>
        )}
      </main>
    </div>
  );
}

function SidebarBlock({ title, children }) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <h2 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 8px", color: "#C9A98A" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function MainBlock({ title, children }) {
  return (
    <section style={{ marginBottom: "22px" }}>
      <h2 style={{ fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 8px", color: "#A8543A" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}


function MinimalTemplate({ content: c }) {
  return (
    <div style={{ padding: "52px 60px", color: "#1E2A24", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "6px" }}>
        {c.photo && (
          <img
            src={c.photo} alt={c.name}
            style={{
              width: "76px", height: "76px", borderRadius: "50%",
              objectFit: "cover", flexShrink: 0,
            }}
          />
        )}
        <div>
          <h1 style={{ fontSize: "26px", margin: 0, fontWeight: 600 }}>{c.name}</h1>
          <p style={{ margin: "3px 0 0", fontSize: "14px", color: "#6B6656" }}>{c.title}</p>
        </div>
      </div>
      <p style={{ fontSize: "12px", color: "#6B6656", margin: "16px 0 28px" }}>
        {[c.contact?.phone, c.contact?.email, c.contact?.github, c.contact?.portfolio].filter(Boolean).join("   ")}
      </p>

      {c.profile && <p style={{ fontSize: "14px", lineHeight: 1.6, margin: "0 0 28px", maxWidth: "560px" }}>{c.profile}</p>}

      {c.experience.length > 0 && (
        <MinimalSection title="Expérience">
          {c.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "18px" }}>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
                {exp.role}{exp.company ? `, ${exp.company}` : ""} <span style={{ fontWeight: 400, color: "#6B6656" }}>— {exp.period}</span>
              </p>
              <ul style={{ margin: "6px 0 0", paddingLeft: "18px", fontSize: "13.5px", color: "#3A362E" }}>
                {exp.bullets.map((b, j) => <li key={j} style={{ marginBottom: "3px" }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </MinimalSection>
      )}

      {c.education.length > 0 && (
        <MinimalSection title="Formation">
          {c.education.map((ed, i) => (
            <p key={i} style={{ margin: "0 0 6px", fontSize: "13.5px" }}>
              {ed.degree} {ed.school && <span style={{ color: "#6B6656" }}>— {ed.school}</span>}
            </p>
          ))}
        </MinimalSection>
      )}

      {c.skills.length > 0 && (
        <MinimalSection title="Compétences">
          {c.skills.map((s, i) => (
            <p key={i} style={{ margin: "0 0 5px", fontSize: "13.5px" }}>
              <span style={{ fontWeight: 600 }}>{s.category}:</span> {s.items.join(", ")}
            </p>
          ))}
        </MinimalSection>
      )}

      {c.certifications && (
        <MinimalSection title="Certifications">
          <p style={{ margin: 0, fontSize: "13.5px" }}>{c.certifications}</p>
        </MinimalSection>
      )}

      {c.languages && (
        <MinimalSection title="Langues">
          <p style={{ margin: 0, fontSize: "13.5px" }}>{c.languages}</p>
        </MinimalSection>
      )}
    </div>
  );
}

function MinimalSection({ title, children }) {
  return (
    <section style={{ marginBottom: "20px" }}>
      <h2 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", margin: "0 0 8px", color: "#A8543A" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
