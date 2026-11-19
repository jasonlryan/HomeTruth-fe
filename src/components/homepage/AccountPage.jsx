import { useState } from "react";
import { Field, HTIcon } from "./HomeTruth";
import { PublicFooter, PublicHeader } from "./Journey";
import "../../pages/account-entry.css";

const assetBase = process.env.PUBLIC_URL + "/assets/homepage/";

export default function AccountPage({ title, description, children }) {
  return (
    <div className="ht-ui ht-journey ht-account">
      <PublicHeader assetBase={assetBase} homeHref="/" />
      <main className="ht-account-main">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </main>
      <PublicFooter assetBase={assetBase} homeHref="/" />
    </div>
  );
}

export function AccountPasswordField({ label = "Password", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="ht-account-password">
      <Field {...props} label={label} type={visible ? "text" : "password"} />
      <button type="button" className="ht-account-visibility" aria-pressed={visible}
        aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
        onClick={() => setVisible(value => !value)}>
        <HTIcon name="visible" assetBase={assetBase + "icons/"} />
      </button>
    </div>
  );
}
