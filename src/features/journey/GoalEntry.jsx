import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { journeyOwner, writeJourney } from './context';
import './Journey.css';

export default function GoalEntry() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const begin = (intent, destination, advice = false) => {
    writeJourney(journeyOwner(user), { intent, returnTo: destination, question: advice ? ({ buy: 'Where should I start with buying a home?', sell: 'What documents should I gather when preparing to sell?', manage: 'How can HomeTruth help me manage my home?' })[intent] : '', propertyId: null });
    navigate(advice ? user ? '/ask-ai' : '/chat' : user ? destination : `/register?redirect=${encodeURIComponent(destination)}`);
  };
  const ask = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    writeJourney(journeyOwner(user), { intent: 'ask', question: question.trim(), returnTo: '/start', propertyId: null });
    navigate(user ? '/ask-ai' : '/chat');
  };
  return <section className="journey" aria-labelledby="journey-title">
    <h1 id="journey-title">Your home’s records, together and easier to use.</h1>
    <p>Find a manual, understand a survey or keep track of a repair. HomeTruth helps you use the information you have and keep useful answers with your home.</p>
    <h2>What would you like help with?</h2>
    <div className="journey-grid">
      <article className="journey-panel journey-card journey-buy"><Home aria-hidden="true" className="mb-5 text-ht-purple" /><h2>I’m buying a home</h2><p>Understand a survey and keep useful questions together. No survey yet? Ask about buying at any stage.</p><button className="journey-button" onClick={() => begin('buy', '/documents')}>Upload a survey</button><button className="journey-link mt-4" onClick={() => begin('buy', '/buying', true)}>Ask about buying</button></article>
      <article className="journey-panel journey-card journey-sell"><FileText aria-hidden="true" className="mb-5 text-ht-purple" /><h2>I’m selling a home</h2><p>Bring your documents into one place. Review what you have, ask about them and keep track of information you still need.</p><button className="journey-button" onClick={() => begin('sell', '/documents')}>Upload your documents</button><button className="journey-link mt-4" onClick={() => begin('sell', '/selling', true)}>Ask about selling</button></article>
      <article className="journey-panel journey-card journey-manage"><ClipboardList aria-hidden="true" className="mb-5 text-ht-purple" /><h2>I’m managing my home(s)</h2><p>Bring your home’s records and maintenance information together. Choose the task you want help with.</p><button className="journey-button" onClick={() => begin('manage', '/my-home')}>Manage my home</button><button className="journey-link mt-4" onClick={() => begin('manage', '/my-home', true)}>Ask about my home</button></article>
    </div>
    <form onSubmit={ask} className="journey-panel"><h2>Something else on your mind?</h2><label className="journey-field" htmlFor="starting-question">Your question</label><div className="journey-form"><input id="starting-question" value={question} onChange={e => setQuestion(e.target.value)} maxLength={4000} required placeholder="Ask about your home or your next move…" /><button className="journey-button" type="submit">AskAI</button></div></form>
    <p className="journey-note mt-5">General advice needs no account or home address. Sign in to keep private records. <Link to={user ? '/dashboard' : '/login'}>{user ? 'Your dashboard' : 'Already have an account? Log in'}</Link></p>
  </section>;
}
