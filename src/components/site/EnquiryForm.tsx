import { useState, type FormEvent } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { submitLead } from "@/lib/server/public-fns";
import { useI18n, type CopyKey } from "@/lib/i18n";
import { isEmail, normalizeIndianMobile, waUrl } from "@/lib/utils";
import { leadContext, track } from "@/components/site/analytics";
import { WhatsAppIcon } from "@/components/site/Logo";

const root = getRouteApi("__root__");
const errors: Record<string, CopyKey> = {
  name: "errName",
  mobile: "errMobile",
  email: "errEmail",
  interest: "errInterest",
  rate: "errRate",
};

export function EnquiryForm({ interestDefault = "" }: { interestDefault?: "" | "skill" | "business" }) {
  const { settings } = root.useLoaderData();
  const { t, pick } = useI18n();
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [interest, setInterest] = useState(interestDefault);
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  function focus() {
    if (started) return;
    setStarted(true);
    track("enquiry_start");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (fullName.trim().length < 2) return setError("name");
    if (!normalizeIndianMobile(mobile)) return setError("mobile");
    if (email.trim() && !isEmail(email.trim())) return setError("email");
    if (interest !== "skill" && interest !== "business") return setError("interest");
    setPending(true);
    try {
      const result = await submitLead({
        data: {
          fullName,
          mobile,
          email,
          city,
          interest,
          message,
          company,
          ...leadContext(),
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      track("enquiry_submit", interest);
      setDone(true);
    } catch {
      setError("generic");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    const note = interest === "business"
      ? pick(settings.wa_business_en, settings.wa_business_hi)
      : pick(settings.wa_skill_en, settings.wa_skill_hi);
    return (
      <div className="grid gap-4" role="status">
        <p className="text-base font-semibold text-ink">{t("success")}</p>
        <a className="btn btn-wa" href={waUrl(settings.whatsapp_e164, note)} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", "after-enquiry")}>
          <WhatsAppIcon />
          {t("waAfter")}
        </a>
      </div>
    );
  }

  return (
    <form className="relative grid gap-4" onSubmit={onSubmit} noValidate>
      <div className="hp" aria-hidden="true">
        <label>
          Company
          <input value={company} onChange={(event) => setCompany(event.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="field">
          {t("fullName")} *
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} onFocus={focus} placeholder={t("namePh")} required autoComplete="name" />
        </label>
        <label className="field">
          {t("city")} <span className="font-medium text-muted">({t("optional")})</span>
          <input value={city} onChange={(event) => setCity(event.target.value)} onFocus={focus} placeholder={t("cityPh")} autoComplete="address-level2" />
        </label>
        <label className="field">
          {t("whatsappNo")} *
          <input value={mobile} onChange={(event) => setMobile(event.target.value)} onFocus={focus} placeholder={t("mobilePh")} required inputMode="tel" autoComplete="tel" />
        </label>
        <label className="field">
          {t("interested")} *
          <select value={interest} onChange={(event) => setInterest(event.target.value as "" | "skill" | "business")} onFocus={focus} required>
            <option value="">{t("choose")}</option>
            <option value="skill">{t("skillOpt")}</option>
            <option value="business">{t("businessOpt")}</option>
          </select>
        </label>
        <label className="field">
          {t("email")} <span className="font-medium text-muted">({t("optional")})</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} onFocus={focus} placeholder={t("emailPh")} autoComplete="email" inputMode="email" />
        </label>
        <label className="field">
          {t("message")} <span className="font-medium text-muted">({t("optional")})</span>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} onFocus={focus} placeholder={t("messagePh")} />
        </label>
      </div>
      {error ? (
        <p className="text-sm font-semibold text-royal" role="alert">
          {t(errors[error] ?? "errGeneric")}
        </p>
      ) : null}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? t("submitting") : t("submit")}
        <span aria-hidden="true">→</span>
      </button>
      <p className="text-xs leading-5 text-muted">{t("dataNotice")}</p>
    </form>
  );
}
