"use client";

import {
  ArrowRight,
  CheckCircle2,
  Home,
  RefreshCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// --- STRUCTURE DES QUESTIONS (Exemple de 20 questions types) ---
const questionsCE2 = [
  {
    id: 1,
    type: "grammaire",
    question: "Trouve le Verbe : 'Le petit chat mange sa pâtée.'",
    options: ["petit", "chat", "mange"],
    answer: "mange",
    aide: "Le verbe exprime l'action.",
  },
  {
    id: 2,
    type: "conjugaison",
    question: "Conjugue : 'Nous (chanter) une chanson.'",
    options: ["chantons", "chantent", "chantez"],
    answer: "chantons",
    aide: "Avec 'Nous', la terminaison est souvent -ons.",
  },
  {
    id: 3,
    type: "orthographe",
    question: "Choisis le pluriel de : 'un cheval'",
    options: ["des chevals", "des chevaux", "des chevau"],
    answer: "des chevaux",
    aide: "Les mots en -al font leur pluriel en -aux.",
  },
  {
    id: 4,
    type: "grammaire",
    question: "Trouve le Sujet : 'Maman prépare un gâteau.'",
    options: ["Maman", "prépare", "gâteau"],
    answer: "Maman",
    aide: "Qui est-ce qui prépare ?",
  },
  {
    id: 5,
    type: "vocabulaire",
    question: "Quel est le synonyme de 'content' ?",
    options: ["triste", "heureux", "colère"],
    answer: "heureux",
    aide: "Un synonyme veut dire la même chose.",
  },
  // ... (Imagine ici les questions 6 à 19 détaillées de la même manière)
  {
    id: 20,
    type: "orthographe",
    question: "Complète : 'Ils ___ mangé toutes les pommes.'",
    options: ["ont", "on", "onts"],
    answer: "ont",
    aide: "C'est le verbe avoir : ils ont.",
  },
];

export default function BilanCompletCE2() {
  const router = useRouter();

  // États du Quiz
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");

  // Animation de la barre de progression
  const progress = ((currentQuestion + 1) / questionsCE2.length) * 100;

  const handleAnswer = (option: string) => {
    if (selectedOption !== null) return; // Empêche de cliquer deux fois

    setSelectedOption(option);
    const correct = option === questionsCE2[currentQuestion].answer;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      setFeedback("Excellent ! C'est la bonne réponse.");
    } else {
      setFeedback(
        `Dommage... La réponse était : ${questionsCE2[currentQuestion].answer}`,
      );
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questionsCE2.length) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setFeedback("");
    } else {
      setShowResult(true);
    }
  };

  // --- ÉCRAN DE RÉSULTAT FINAL ---
  if (showResult) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-[#1e293b] rounded-3xl p-10 border-4 border-[#4f8ef7] text-center shadow-2xl">
          <Trophy
            size={100}
            className="mx-auto text-yellow-400 mb-6 animate-bounce"
          />
          <h1 className="text-4xl font-extrabold mb-4">Bilan Terminé !</h1>

          <div className="text-6xl font-bold text-[#4f8ef7] mb-6">
            {score}{" "}
            <span className="text-2xl text-gray-400">
              / {questionsCE2.length}
            </span>
          </div>

          <p className="text-xl mb-8">
            {score >= 15
              ? "Tu es un véritable expert du CE2 ! 🚀"
              : "Beau travail ! Continue de t'entraîner. 📚"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 bg-[#4f8ef7] hover:bg-[#3b7ddd] p-4 rounded-xl font-bold transition-all"
            >
              <RefreshCcw size={20} /> Recommencer
            </button>
            <button
              onClick={() => router.push("/cours/francais/primaire/ce2")}
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 p-4 rounded-xl font-bold transition-all"
            >
              <Home size={20} /> Retour au CE2
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- ÉCRAN DES QUESTIONS ---
  const q = questionsCE2[currentQuestion];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header & Barre de progression */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold uppercase tracking-widest text-[#4f8ef7]">
            Bilan Français CE2
          </h2>
          <span className="bg-[#1e293b] px-4 py-2 rounded-full font-mono">
            Question {currentQuestion + 1} / {questionsCE2.length}
          </span>
        </div>

        <div className="w-full h-4 bg-gray-800 rounded-full mb-10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#4f8ef7] to-[#2ec4b6] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Carte de Question */}
        <div className="bg-[#1e293b] rounded-3xl p-8 shadow-xl border border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#4f8ef7]" />

          <span className="inline-block px-3 py-1 rounded bg-[#334155] text-xs font-bold mb-4 uppercase">
            {q.type}
          </span>

          <h3 className="text-2xl md:text-3xl font-semibold mb-8">
            {q.question}
          </h3>

          {/* Options de réponse */}
          <div className="grid grid-cols-1 gap-4">
            {q.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={selectedOption !== null}
                className={`
                  p-5 text-left rounded-2xl border-2 transition-all text-lg font-medium
                  ${
                    selectedOption === option
                      ? isCorrect
                        ? "border-green-500 bg-green-500/20"
                        : "border-red-500 bg-red-500/20"
                      : "border-gray-700 hover:border-[#4f8ef7] bg-[#0f172a]"
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  {option}
                  {selectedOption === option &&
                    (isCorrect ? (
                      <CheckCircle2 className="text-green-500" />
                    ) : (
                      <XCircle className="text-red-500" />
                    ))}
                </div>
              </button>
            ))}
          </div>

          {/* Feedback & Bouton Suivant */}
          {selectedOption && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div
                className={`p-4 rounded-xl mb-4 ${isCorrect ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
              >
                <p className="font-bold mb-1">
                  {isCorrect ? "Bravo !" : "Oups..."}
                </p>
                <p>{feedback}</p>
                <p className="text-sm italic mt-2 text-gray-400">
                  Conseil : {q.aide}
                </p>
              </div>

              <button
                onClick={nextQuestion}
                className="w-full bg-[#4f8ef7] hover:bg-[#3b7ddd] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 group transition-all"
              >
                Question suivante{" "}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
