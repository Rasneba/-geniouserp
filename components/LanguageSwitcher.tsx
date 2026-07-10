"use client";

import { Link, usePathname } from "@/lib/i18n/navigation";
import { useLocale } from "next-intl";
import { useLanguage } from "@/lib/i18n/LocaleProvider";

const languages = [
  { code: "en" as const, name: "English", nativeName: "English" },
  { code: "am" as const, name: "Amharic", nativeName: "አማርኛ" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <div className="dropdown">
      <button
        className="btn btn-sm dropdown-toggle d-flex align-items-center gap-1"
        style={{ background: "transparent", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="bi bi-globe2"></i>
        <span className="d-none d-md-inline">{t("lang.switch")}</span>
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        {languages.map((l) => (
          <li key={l.code}>
            <Link
              href={pathname}
              locale={l.code}
              className={`dropdown-item d-flex align-items-center gap-2 ${locale === l.code ? "active" : ""}`}
            >
              <span className={locale === l.code ? "fw-bold" : ""}>{l.nativeName}</span>
              {locale === l.code && <i className="bi bi-check ms-auto"></i>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
