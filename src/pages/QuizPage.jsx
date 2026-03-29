import QuizSummary from "../components/QuizSummary";

export default function QuizPage() {
  return (
    <div className="flex">
      <div className="flex-grow">
        <main className="p-6">
          <QuizSummary />
        </main>
      </div>
    </div>
  );
}
