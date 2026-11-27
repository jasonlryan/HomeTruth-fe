import React from "react";
import "./styles/tokens.css";
import "./styles/components.css";

export function HTIcon({ name, label = "", size = 16, assetBase = "/admin/design-system/assets/icons/" }) {
  return <img src={assetBase + "ht-" + name + ".svg"} alt={label} width={size} height={size} />;
}

export function Button({ variant = "primary", pending = false, disabled, type = "button", children, ...props }) {
  return (
    <button type={type} className="ht-button" data-variant={variant} disabled={pending || disabled} aria-busy={pending || undefined} {...props}>
      {children}
    </button>
  );
}

export function Field({ id, label, hint, error, multiline, ...props }) {
  const Control = multiline ? "textarea" : "input";
  const descriptions = [hint && id + "-hint", error && id + "-error"].filter(Boolean);
  return (
    <div className="ht-field">
      <label htmlFor={id}>{label}</label>
      <Control id={id} aria-invalid={error ? true : undefined} aria-describedby={descriptions.join(" ") || undefined} {...props} />
      {hint && <small id={id + "-hint"}>{hint}</small>}
      {error && <small className="ht-error" id={id + "-error"}>{error}</small>}
    </div>
  );
}

export const routes = [
  { id: "buy", icon: "buy", label: "Buying a home", compact: "Buying", question: "What should I ask after a survey flags a problem?" },
  { id: "improve", icon: "own", label: "Improving my home", compact: "Improving", question: "What should I check before accepting a quote for home improvements?" },
  { id: "sell", icon: "sell", label: "Preparing to sell", compact: "Selling", question: "Which records should I gather for work done on my home?" },
];

export function RouteChoice({ name, selected, onChange, disabled, assetBase }) {
  return (
    <fieldset className="ht-routes" disabled={disabled}>
      <legend>Choose what to ask about</legend>
      <div className="ht-route-list">
        {routes.map(route => (
          <label key={route.id} className="ht-route">
            <input type="radio" name={name} value={route.id} checked={selected === route.id} aria-label={route.label} onChange={() => onChange(route)} />
            <span aria-hidden="true"><HTIcon name={route.icon} assetBase={assetBase} /><span className="ht-route-full">{route.label}</span><span className="ht-route-short">{route.compact}</span></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Panel({ children, ...props }) {
  return <section className="ht-panel" {...props}>{children}</section>;
}

export function Status({ tone, icon, appearance, children }) {
  return <span className="ht-status" data-tone={tone} data-appearance={appearance}>{icon && <HTIcon name={icon} />}{children}</span>;
}

export function Badge({ icon, children }) {
  return <span className="ht-badge">{icon && <HTIcon name={icon} />}{children}</span>;
}
