import React, { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button, HTIcon, Panel, RouteChoice, routes } from "./HomeTruth";
import { rehypeAnswerReveal } from "./answerReveal";
import "./styles/journey.css";

const footerGroups = [
  ["Product", [["How it works", "/how-it-works"], ["Pricing", "/pricing"], ["Pro Features", "/pro-features"]]],
  ["Company", [["About", "/about"], ["FAQ", "/faq"], ["Contact", "mailto:admin@hometruth.io"]]],
  ["Legal", [["Privacy Policy", "/privacy-policy"], ["Terms of Service", "/terms-of-service"]]],
];

export function PublicHeader({ assetBase, loginHref, loginLabel = "Log in", homeHref }) {
  return (
    <header className="ht-public-header">
      <div className="ht-public-width">
        <a href={homeHref}><img src={assetBase + "brand/hometruth-logo.svg"} alt="HomeTruth" /></a>
        {loginHref && <a className="ht-button" data-variant="secondary" href={loginHref}>{loginLabel}</a>}
      </div>
    </header>
  );
}

export function PublicFooter({ assetBase, homeHref }) {
  return (
    <footer className="ht-public-footer">
      <div className="ht-public-width">
        <div className="ht-footer-grid">
          <a href={homeHref}><img src={assetBase + "brand/hometruth-logo-dark.svg"} alt="HomeTruth" /></a>
          {footerGroups.map(([heading, links]) => (
            <div key={heading}>
              <h2>{heading}</h2>
              <ul>{links.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <p className="ht-copyright">© {new Date().getFullYear()} HomeTruth. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function QuestionComposer({ route, onRouteChange, question, onQuestionChange, onSubmit, pending, limited, assetBase }) {
  const id = useId();
  return (
    <form className="ht-panel ht-composer" onSubmit={onSubmit}>
      <RouteChoice name={id + "-route"} selected={route.id} onChange={onRouteChange} disabled={pending || limited} assetBase={assetBase + "icons/"} />
      <label className="ht-visually-hidden" htmlFor={id}>Your property question</label>
      <textarea id={id} rows={2} maxLength={2000} value={question} disabled={pending || limited}
        placeholder={"e.g. " + route.question} onChange={event => onQuestionChange(event.target.value)} />
      <div className="ht-composer-actions">
        <Button variant="cyan" type="submit" pending={pending} disabled={limited}>Ask HomeTruth</Button>
      </div>
    </form>
  );
}

const AnswerMarkup = React.memo(function AnswerMarkup({ text }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeAnswerReveal]} skipHtml>
      {text}
    </ReactMarkdown>
  );
});

export function FirstAnswer({ text, phase, onDelivered, actions }) {
  const content = useRef(null);
  const delivering = phase === "delivering";

  useEffect(() => {
    if (!delivering) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDelivered();
      return;
    }

    const parts = Array.from(content.current.querySelectorAll("[data-answer-step]"));
    const finalStep = Number(parts.at(-1)?.dataset.answerStep || 0);
    if (!finalStep) {
      onDelivered();
      return;
    }

    let start;
    let frame;
    let next = 0;
    const duration = Math.min(2500, Math.max(450, text.length * 6));
    const advance = timestamp => {
      start ??= timestamp;
      const progress = Math.min(1, (timestamp - start) / duration);
      const step = Math.max(1, Math.ceil(progress * finalStep));

      while (next < parts.length && Number(parts[next].dataset.answerStep) <= step) {
        parts[next].setAttribute("data-answer-visible", "");
        next += 1;
      }

      if (progress === 1) onDelivered();
      else frame = requestAnimationFrame(advance);
    };

    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [text, delivering, onDelivered]);

  return (
    <Panel className="ht-panel ht-first-answer" aria-label="HomeTruth answer">
      <p className="ht-visually-hidden" role="status">
        {phase === "complete" ? "Answer ready." : "Preparing your answer."}
      </p>
      {phase === "waiting" && <p aria-hidden="true">Finding an answer…</p>}
      {phase !== "waiting" && (
        <div ref={content} className="ht-answer-content"
          data-revealing={delivering || undefined} inert={delivering}>
          <AnswerMarkup text={text} />
        </div>
      )}
      {phase === "complete" && actions}
    </Panel>
  );
}

export function HomeRecordHandoff({ headingRef, accountLinks, onClose, onAccountChoice, onAccountHandoff }) {
  const id = useId();
  const accountAction = event => {
    onAccountHandoff?.();
    if (onAccountChoice) {
      event.preventDefault();
      onAccountChoice(event.currentTarget.dataset.account);
    }
  };

  return (
    <Panel aria-labelledby={id}>
      <h2 id={id} ref={headingRef} tabIndex={-1}>Start a home record</h2>
      <p>Add your property, then keep the surveys, quotes and records of work you want to come back to.</p>
      <p><a href="/privacy-policy">How HomeTruth uses your information</a></p>
      <div className="ht-journey-actions">
        {accountLinks.register && <a className="ht-button" data-variant="record" href={accountLinks.register} data-account="register" onClick={accountAction}>Create an account</a>}
        <a className="ht-button" data-variant="secondary" href={accountLinks.login} data-account="login" onClick={accountAction}>{accountLinks.loginLabel || "Log in"}</a>
        <Button variant="text" onClick={onClose}>Back to your answer</Button>
      </div>
    </Panel>
  );
}

export default function Journey({ assetBase, ask, getAccountLinks, onAccountChoice, onAccountHandoff, loginHref, loginHrefWithAnswer, loginLabel, manualPreviewHref, homeHref = "/", Composer = QuestionComposer, RecordLink }) {
  const [route, setRoute] = useState(routes[0]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerOffersManual, setAnswerOffersManual] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [limited, setLimited] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [requestId, setRequestId] = useState(0);
  const submitting = useRef(false);
  const heading = useRef(null);
  const recordButton = useRef(null);
  const answerFlow = useRef(null);
  const hero = useRef(null);
  const opening = useRef(null);
  const pending = phase === "waiting" || phase === "delivering";
  const accountLinks = getAccountLinks();

  // Size the photo against the opening. Appending a long answer only reveals more of it.
  useEffect(() => {
    const section = hero.current;
    const firstScreen = opening.current;
    const frameImage = () => {
      const width = section.clientWidth;
      const height = firstScreen.offsetHeight;
      const photoWidth = Math.max(width, height * 724 / 335) * 1.15;
      const photoTop = Math.max(18 - photoWidth * 103 / 724, height - photoWidth * 367 / 724);
      const photoRight = width <= 760
        ? -Math.min(photoWidth - width, Math.max(0, photoWidth * (1 - 484 / 724) - width * 0.23))
        : -Math.min(80, (photoWidth - width) * 0.65);
      section.style.setProperty("--photo-width", photoWidth + "px");
      section.style.setProperty("--photo-top", photoTop + "px");
      section.style.setProperty("--photo-right", photoRight + "px");
    };
    frameImage();
    const observer = new ResizeObserver(frameImage);
    observer.observe(firstScreen);
    return () => observer.disconnect();
  }, []);

  const markDelivered = React.useCallback(() => {
    submitting.current = false;
    setPhase("complete");
  }, []);

  const submit = async event => {
    event.preventDefault();
    await submitQuestion(question.trim() || route.question);
  };

  const submitQuestion = async prompt => {
    if (submitting.current || limited) return;
    submitting.current = true;
    setRequestId(id => id + 1);
    setRecordOpen(false);
    setPhase("waiting");
    setAnswerOffersManual(false);

    try {
      const result = await ask(prompt);
      setLimited(Boolean(result.limited));
      if (!result.text?.trim()) {
        setPhase(result.limited ? "limited" : "error");
        submitting.current = false;
        return;
      }
      setAnswer(result.text);
      setAnswerOffersManual(Boolean(result.action));
      setPhase("delivering");
    } catch {
      setPhase("error");
      submitting.current = false;
    }
  };

  useEffect(() => {
    if (phase === "waiting") answerFlow.current?.scrollIntoView({ block: "nearest" });
  }, [phase]);

  useEffect(() => {
    if (recordOpen) heading.current.focus();
  }, [recordOpen]);

  const showRecord = phase === "complete" || phase === "limited";
  const recordAction = showRecord && (
    <div className="ht-journey-actions">
      {answerOffersManual && manualPreviewHref && (
        <Link className="ht-button" data-variant="cyan" to={manualPreviewHref} onClick={onAccountHandoff}>Find my manual</Link>
      )}
      {RecordLink ? (
        <RecordLink homeHref={homeHref} fromAnswer={phase === "complete"} onClick={onAccountHandoff}>
          <HTIcon name="home" assetBase={assetBase + "icons/"} /> Start a home record
        </RecordLink>
      ) : (
        <Button ref={recordButton} variant="secondary" onClick={() => setRecordOpen(true)} aria-expanded={recordOpen}>
          <HTIcon name="home" assetBase={assetBase + "icons/"} /> Start a home record
        </Button>
      )}
    </div>
  );

  return (
    <div className="ht-ui ht-journey">
      <PublicHeader assetBase={assetBase} homeHref={homeHref} loginHref={(showRecord && answer && loginHrefWithAnswer) || loginHref || accountLinks.login} loginLabel={loginLabel} />
      <main ref={hero} className="ht-journey-hero">
        <div className="ht-hero-backdrop">
          <img className="ht-hero-photo" src={assetBase + "brand/hometruth-house-to-tower.jpg"} alt="" />
        </div>
        <div className="ht-public-width">
          <div ref={opening} className="ht-journey-opening">
            <div className="ht-hero-overlay">
              <h1>Your home, <span>made simple.</span></h1>
              <p className="ht-hero-lead">Understand the property you're buying, plan improvements <span>to make</span> it yours, and show buyers its value when you sell.</p>
              <Composer route={route} onRouteChange={setRoute} question={question} onQuestionChange={setQuestion}
                onSubmit={submit} onAsk={submitQuestion} manualPreviewHref={manualPreviewHref} pending={pending} limited={limited} assetBase={assetBase} />
              {RecordLink ? (
                <div className="ht-homepage-entry-links">
                  <RecordLink homeHref={homeHref} onClick={onAccountHandoff}>
                    <HTIcon name="home" assetBase={assetBase + "icons/"} /> Start a home record
                  </RecordLink>
                  <a className="ht-hero-more" href="/how-it-works">About HomeTruth <HTIcon name="arrow-right" assetBase={assetBase + "icons/"} /></a>
                </div>
              ) : <a className="ht-hero-more" href="/how-it-works">About HomeTruth <HTIcon name="arrow-right" assetBase={assetBase + "icons/"} /></a>}
            </div>
          </div>
          {phase !== "idle" && (
            <div id="homepage-answer" ref={answerFlow} className="ht-journey-flow">
              {phase === "error" && <Panel><p role="alert">We couldn’t get an answer. Try asking again.</p></Panel>}
              {phase === "limited" && <Panel><p role="status">You’ve reached the guest question limit.</p>{recordAction}</Panel>}
              {(pending || phase === "complete") && (
                <FirstAnswer key={requestId} text={answer} phase={phase} onDelivered={markDelivered} actions={recordAction} />
              )}
              {recordOpen && <HomeRecordHandoff headingRef={heading} accountLinks={accountLinks} onAccountChoice={onAccountChoice} onAccountHandoff={onAccountHandoff} onClose={() => {
                setRecordOpen(false);
                recordButton.current?.focus();
              }} />}
            </div>
          )}
        </div>
      </main>
      <PublicFooter assetBase={assetBase} homeHref={homeHref} />
    </div>
  );
}
