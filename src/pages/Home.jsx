// import { useState } from "react";
// import QuizWrapper from "../components/Quiz/QuizWrapper";
// import Dashboard from "./Dashboard";

// export default function Home() {
//   const [quizDone, setQuizDone] = useState(() => {
//     return localStorage.getItem("quiz_done") === "true";
//   });

//   const handleCompleteQuiz = () => {
//     localStorage.setItem("quiz_done", "true");
//     setQuizDone(true);
//   };

//   return (
//     <div className="relative min-h-screen">
//       {/* Dashboard layout in background */}
//       <Dashboard />

//       {/* Overlay quiz if not completed */}
//       {!quizDone && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
//           <QuizWrapper onComplete={handleCompleteQuiz} />
//         </div>
//       )}
//     </div>
//   );
// }
