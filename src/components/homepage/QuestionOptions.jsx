import { useId, useRef, useState } from "react";
import { Button, HTIcon, RouteChoice } from "./HomeTruth";
import "./styles/question-options.css";

const prompts = {
  buy: [
    "What should I look for at a viewing?",
    "What should I ask after a survey flags a problem?",
    "What costs should I budget for before I buy?",
    "What should I check before making an offer?",
  ],
  improve: [
    "Which repairs should I do first?",
    "How do I compare quotes for the same job?",
    "What should I agree with a builder before work starts?",
    "What should I keep after the work is done?",
  ],
  sell: [
    "What paperwork should I gather before I sell?",
    "What records can show buyers the work I’ve done?",
    "What can I do if I’m missing paperwork for past work?",
    "What might buyers ask about my home?",
  ],
};

export default function QuestionOptions({ route, onRouteChange, question, onQuestionChange, onAsk, pending, limited, assetBase }) {
  const id = useId();
  const input = useRef(null);
  const [customOpen, setCustomOpen] = useState(false);
  const disabled = pending || limited;

  const toggleCustom = () => {
    if (customOpen) {
      setCustomOpen(false);
      return;
    }
    setCustomOpen(true);
    requestAnimationFrame(() => input.current?.focus());
  };

  return (
    <section className="ht-panel ht-composer ht-question-options" aria-label="Property questions">
      <RouteChoice name={id + "-route"} selected={route.id} onChange={onRouteChange} disabled={pending} assetBase={assetBase + "icons/"} />
      <ul className="ht-question-options-list" aria-label={route.label + " questions"}>
        {prompts[route.id].map(prompt => (
          <li key={prompt}>
            <Button variant="text" disabled={disabled} onClick={() => onAsk(prompt)}>
              <span>{prompt}</span><HTIcon name="arrow-right" assetBase={assetBase + "icons/"} />
            </Button>
          </li>
        ))}
      </ul>
      <Button className="ht-button ht-custom-question" variant="text" disabled={disabled} onClick={toggleCustom}
        aria-controls={id + "-custom"} aria-expanded={customOpen}>I have a different question</Button>
      <form id={id + "-custom"} hidden={!customOpen} onSubmit={event => {
        event.preventDefault();
        if (question.trim()) onAsk(question.trim());
      }}>
        <label className="ht-visually-hidden" htmlFor={id + "-question"}>Your property question</label>
        <textarea id={id + "-question"} ref={input} rows={2} maxLength={2000} value={question} disabled={disabled}
          placeholder="Type your property question" onChange={event => onQuestionChange(event.target.value)} />
        <div className="ht-composer-actions">
          <Button type="submit" variant="cyan" pending={pending} disabled={limited || !question.trim()}>Get an answer</Button>
        </div>
      </form>
    </section>
  );
}
