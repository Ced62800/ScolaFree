"use client";
import { DecouverteContext } from "@/components/DecouverteContext";
import { getBestScore, getLastScore, saveScore } from "@/lib/scores";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CLASSE = "3eme";
const MATIERE = "anglais";
const THEME = "medias-societe";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Question = {
  question: string;
  options: string[];
  answer: string;
  fiche: { regle: string; exemple: string; piege: string; astuce: string };
};

const questionsBase: Question[] = [
  {
    question: "What is 'fake news'?",
    options: [
      "News published only in newspapers",
      "False or misleading information presented as real news",
      "News that is very recent",
      "News from foreign countries",
    ],
    answer: "False or misleading information presented as real news",
    fiche: {
      regle:
        "Fake news = deliberately false or misleading information spread through media, especially online. It can influence public opinion, elections and health decisions. Critical thinking is essential to identify it.",
      exemple:
        "Ways to spot fake news: check the source, look for other reports, check the date, look for bias, verify images. Fact-checking websites: Snopes, FactCheck.org.",
      piege:
        "Fake news is not simply wrong information — it is often deliberately created to mislead. Satire is different: it's clearly fictional humour.",
      astuce:
        "SIFT method to spot fake news: Stop (don't share immediately), Investigate the source, Find better coverage, Trace claims to their origin.",
    },
  },
  {
    question: "What does 'social media' refer to?",
    options: [
      "Traditional TV and radio broadcasting",
      "Online platforms where users create and share content",
      "Government-controlled news channels",
      "Printed newspapers and magazines",
    ],
    answer: "Online platforms where users create and share content",
    fiche: {
      regle:
        "Social media = digital platforms enabling users to create, share and interact with content. Examples: Instagram, TikTok, YouTube, Twitter/X, Facebook, Snapchat, WhatsApp.",
      exemple:
        "Uses: communication, entertainment, news, activism, business. Issues: cyberbullying, addiction, privacy, misinformation, mental health impacts.",
      piege:
        "Social media is not just for young people or entertainment. It is used for journalism, politics, business, activism and education.",
      astuce:
        "Key vocabulary: post, share, like, follow, comment, hashtag, viral, influencer, algorithm, feed, notification, privacy settings.",
    },
  },
  {
    question: "What is 'cyberbullying'?",
    options: [
      "Hacking into computer systems",
      "Bullying that takes place online or through digital devices",
      "Sharing positive messages online",
      "A type of computer virus",
    ],
    answer: "Bullying that takes place online or through digital devices",
    fiche: {
      regle:
        "Cyberbullying = using digital technology to harass, threaten or embarrass someone. It can include sending hurtful messages, spreading rumours, posting embarrassing photos, excluding someone online.",
      exemple:
        "Forms: sending threatening messages, posting humiliating photos, creating hate pages, impersonating someone online. Consequences: depression, anxiety, social isolation, school dropout.",
      piege:
        "Cyberbullying is as serious as physical bullying and can have severe psychological consequences. It can happen 24/7, reaching victims at home.",
      astuce:
        "Key vocabulary: to bully, harassment, victim, online abuse, digital footprint, to report, to block, to screenshot evidence, mental health.",
    },
  },
  {
    question: "What is 'digital literacy'?",
    options: [
      "The ability to read digital displays",
      "The ability to use, evaluate and create digital content effectively",
      "A programming language",
      "The number of hours spent online",
    ],
    answer:
      "The ability to use, evaluate and create digital content effectively",
    fiche: {
      regle:
        "Digital literacy = the skills needed to use digital technology effectively and critically. It includes: finding and evaluating information, creating digital content, staying safe online, understanding privacy and copyright.",
      exemple:
        "A digitally literate person: can spot fake news, protects their personal data, uses technology responsibly, understands how algorithms work.",
      piege:
        "Digital literacy is not just about using devices — it includes critical thinking about content, privacy, security and digital citizenship.",
      astuce:
        "Digital literacy skills: search effectively, evaluate sources, protect privacy, create content, understand algorithms, communicate responsibly online.",
    },
  },
  {
    question: "What does 'streaming' mean in the context of media?",
    options: [
      "Downloading files to watch later",
      "Watching or listening to content in real time over the internet",
      "Sharing content on social media",
      "Broadcasting on traditional TV",
    ],
    answer: "Watching or listening to content in real time over the internet",
    fiche: {
      regle:
        "Streaming = receiving and playing audio or video content in real time over the internet, without downloading. Examples: Netflix, YouTube, Spotify, Disney+, Twitch (live streaming).",
      exemple:
        "Streaming vs downloading: streaming = watch now (needs internet). Download = save file to watch offline. Live streaming = broadcast in real time (Twitch, Instagram Live).",
      piege:
        "Streaming requires a continuous internet connection. Downloading saves the file. Podcast = audio streaming. SVOD (Subscription Video on Demand) = paid streaming service.",
      astuce:
        "Streaming vocabulary: to stream, platform, subscription, on demand, buffering, bandwidth, algorithm, binge-watching, content creator.",
    },
  },
  {
    question: "What is an 'influencer'?",
    options: [
      "A government spokesperson",
      "A person who influences others through their online presence and content",
      "A type of social media algorithm",
      "A traditional journalist",
    ],
    answer:
      "A person who influences others through their online presence and content",
    fiche: {
      regle:
        "An influencer is someone with a significant online following who can influence their audience's opinions, behaviours and purchasing decisions. They work on platforms like Instagram, YouTube, TikTok.",
      exemple:
        "Types: mega-influencers (millions of followers), macro, micro (10k-100k — often more authentic), nano. Issues: undisclosed advertising, unrealistic standards, mental health impact.",
      piege:
        "More followers does not always mean more influence. Micro-influencers often have more engaged and loyal audiences than mega-influencers.",
      astuce:
        "Influencer vocabulary: followers, engagement rate, sponsored content, brand deal, authenticity, reach, niche, content creator, monetise.",
    },
  },
  {
    question: "What does 'privacy' mean online?",
    options: [
      "Making all your content public",
      "The right to control your personal information and how it is used",
      "Using a private browser only",
      "Avoiding all social media",
    ],
    answer: "The right to control your personal information and how it is used",
    fiche: {
      regle:
        "Online privacy = the right to control what personal information you share online and how it is collected, stored and used by companies. GDPR (EU law) protects digital privacy rights.",
      exemple:
        "Privacy threats: data tracking, cookies, data breaches, facial recognition, location tracking. Protection: strong passwords, privacy settings, VPN, two-factor authentication.",
      piege:
        "Privacy is not just about hiding things — it's about control over your own data. Even 'public' posts can be collected and analysed by companies.",
      astuce:
        "Privacy vocabulary: personal data, cookies, consent, data breach, GDPR, password, encryption, digital footprint, surveillance, terms and conditions.",
    },
  },
  {
    question: "What is 'screen time'?",
    options: [
      "The time spent watching films in cinemas",
      "The total amount of time spent using screens (phone, tablet, computer, TV)",
      "The brightness setting of a screen",
      "The time a TV show airs",
    ],
    answer:
      "The total amount of time spent using screens (phone, tablet, computer, TV)",
    fiche: {
      regle:
        "Screen time = the amount of time spent in front of digital screens. Excessive screen time can affect sleep, concentration, physical health and social skills. Balance between online and offline activities is important.",
      exemple:
        "Recommended screen time: WHO suggests limits for children. Issues: blue light affecting sleep, social media comparison, reduced physical activity, shorter attention spans.",
      piege:
        "Not all screen time is equal — educational content, video calls with family and creative activities are different from passive scrolling or gaming addiction.",
      astuce:
        "Screen time vocabulary: digital detox, offline, mindful use, notifications, scrolling, blue light, sleep disruption, attention span, balance.",
    },
  },
  {
    question:
      "What is the role of traditional media (TV, newspapers) compared to social media?",
    options: [
      "Traditional media is always more reliable than social media",
      "Traditional media has editorial control while social media allows anyone to publish",
      "Social media is always more reliable than traditional media",
      "They are exactly the same",
    ],
    answer:
      "Traditional media has editorial control while social media allows anyone to publish",
    fiche: {
      regle:
        "Traditional media (TV, newspapers, radio): editorial control, professional journalists, fact-checking, accountability. Social media: anyone can publish, fast but unverified, risk of misinformation, but also democratic and immediate.",
      exemple:
        "BBC, Le Monde, The Guardian = traditional media with editorial standards. Twitter/X, Facebook, TikTok = social media where anyone posts. Both have advantages and risks.",
      piege:
        "Traditional media can also be biased or owned by corporations with political interests. Critical thinking applies to ALL media sources.",
      astuce:
        "Evaluate ALL media: Who made it? Why? What evidence? Other sources? Is it recent? Traditional or social, always question the source.",
    },
  },
  {
    question: "What does 'going viral' mean?",
    options: [
      "Getting a computer virus",
      "Content spreading very rapidly and widely across the internet",
      "Becoming sick from using screens",
      "Deleting content from social media",
    ],
    answer: "Content spreading very rapidly and widely across the internet",
    fiche: {
      regle:
        "Going viral = content (video, image, meme, post) spreading extremely quickly and widely across the internet through shares, reposts and reactions. Viral content can reach millions in hours.",
      exemple:
        "Viral content triggers strong emotions: humour, outrage, surprise, inspiration. Brands and activists use viral content for awareness. Memes often go viral.",
      piege:
        "Going viral is not always positive. Fake news, embarrassing moments and cyberbullying can also go viral and cause real harm.",
      astuce:
        "Viral vocabulary: to go viral, to share, to repost, meme, trend, hashtag, algorithm, reach, impression, engagement, like, comment.",
    },
  },
];

export default function MediasSocietePage() {
  const router = useRouter();
  const { estConnecte, maxQuestions } = useContext(DecouverteContext);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [etape, setEtape] = useState<"intro" | "quiz" | "resultat">("intro");
  const [index, setIndex] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState<string | null>(null);
  const [estCorrecte, setEstCorrecte] = useState<boolean | null>(null);
  const [ficheOuverte, setFicheOuverte] = useState(false);
  const [ficheObligatoireLue, setFicheObligatoireLue] = useState(true);
  const [bestScore, setBestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const [lastScore, setLastScore] = useState<{
    score: number;
    total: number;
  } | null>(null);
  const scoreRef = useRef(0);
  const scoreSaved = useRef(false);
  const fautesRef = useRef(0);

  useEffect(() => {
    if (estConnecte) {
      getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
      getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
    }
  }, [estConnecte]);

  const demarrer = () => {
    const q = shuffleArray(questionsBase)
      .slice(0, maxQuestions)
      .map((q) => ({ ...q, options: shuffleArray(q.options) }));
    setQuestions(q);
    scoreRef.current = 0;
    fautesRef.current = 0;
    scoreSaved.current = false;
    setIndex(0);
    setReponseChoisie(null);
    setEstCorrecte(null);
    setFicheOuverte(false);
    setFicheObligatoireLue(true);
    setEtape("quiz");
  };

  const choisirReponse = (option: string) => {
    if (reponseChoisie) return;
    setReponseChoisie(option);
    const correct = option === questions[index].answer;
    setEstCorrecte(correct);
    if (correct) {
      scoreRef.current += 1;
    } else {
      fautesRef.current += 1;
      if (fautesRef.current === 1) setFicheOuverte(true);
      if (fautesRef.current === 6) setFicheObligatoireLue(false);
    }
  };

  const questionSuivante = async () => {
    setFicheOuverte(false);
    if (index + 1 >= questions.length) {
      if (!scoreSaved.current && estConnecte) {
        scoreSaved.current = true;
        await saveScore({
          classe: CLASSE,
          matiere: MATIERE,
          theme: THEME,
          score: scoreRef.current,
          total: questions.length,
        });
        getBestScore(CLASSE, MATIERE, THEME).then(setBestScore);
        getLastScore(CLASSE, MATIERE, THEME).then(setLastScore);
      }
      setEtape("resultat");
    } else {
      setIndex(index + 1);
      setReponseChoisie(null);
      setEstCorrecte(null);
    }
  };

  const total = questions.length;
  const est6emeFaute = fautesRef.current >= 6;
  const boutonBloque = !estCorrecte && est6emeFaute && !ficheObligatoireLue;

  if (etape === "intro")
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="lecon-wrapper">
          <div className="lecon-badge">
            <img
              src="https://flagcdn.com/w40/gb.png"
              alt="UK"
              style={{
                width: "24px",
                verticalAlign: "middle",
                borderRadius: "3px",
                marginRight: "8px",
              }}
            />
            Anglais — 3ème
          </div>
          <h1 className="lecon-titre">Media & Society</h1>
          {!estConnecte && (
            <div
              style={{
                background: "rgba(79,142,247,0.1)",
                border: "1px solid rgba(79,142,247,0.3)",
                borderRadius: "10px",
                padding: "10px 16px",
                marginBottom: "16px",
                fontSize: "0.85rem",
                color: "#aaa",
                textAlign: "center",
              }}
            >
              Discovery mode — 5 questions ·{" "}
              <span
                onClick={() => router.push("/inscription")}
                style={{ color: "#4f8ef7", cursor: "pointer", fontWeight: 700 }}
              >
                Sign up
              </span>{" "}
              for all 10 questions!
            </div>
          )}
          <div className="lecon-intro">
            Explore key vocabulary about{" "}
            <strong>
              social media, digital life, fake news and online safety
            </strong>{" "}
            in English.
          </div>
          {estConnecte && (bestScore || lastScore) && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(46,196,182,0.1)",
                    border: "1px solid rgba(46,196,182,0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    🏆 Best score
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#2ec4b6",
                    }}
                  >
                    {bestScore.score}/{bestScore.total}
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    🕐 Last score
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#4f8ef7",
                    }}
                  >
                    {lastScore.score}/{lastScore.total}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="lecon-points">
            <div className="lecon-point">
              <div className="lecon-point-titre">
                📱 Social media vocabulary
              </div>
              <div className="lecon-point-texte">
                Platforms: Instagram, TikTok, YouTube, Twitter/X. Key words:
                post, share, like, follow, comment, hashtag, viral, influencer,
                algorithm, feed, streaming.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Key phrases:</span> to go viral,
                to scroll, to binge-watch, screen time, digital detox, content
                creator.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">
                ⚠️ Online safety & fake news
              </div>
              <div className="lecon-point-texte">
                Fake news = false information. Cyberbullying = online
                harassment. Privacy = control over personal data. Digital
                literacy = ability to use and evaluate digital content
                critically.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Key phrases:</span> to
                fact-check, to verify, reliable source, data privacy, digital
                footprint, to report abuse.
              </div>
            </div>
            <div className="lecon-point">
              <div className="lecon-point-titre">📺 Media & Society</div>
              <div className="lecon-point-texte">
                Traditional media (editorial control) vs social media (anyone
                publishes). Influencers shape opinions. Streaming replaced
                traditional TV for many. Critical thinking essential for all
                media.
              </div>
              <div className="lecon-point-exemple">
                <span className="exemple-label">Key phrases:</span> media bias,
                freedom of speech, censorship, journalism, accountability,
                public opinion.
              </div>
            </div>
          </div>
          <button className="lecon-btn" onClick={demarrer}>
            🚀 Start exercises →
          </button>
        </div>
      </div>
    );

  if (etape === "quiz" && questions.length > 0) {
    const q = questions[index];
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="progression-wrapper">
          <div className="progression-info">
            <span>
              Question {index + 1} / {total}
            </span>
            <span>
              {scoreRef.current} correct answer{scoreRef.current > 1 ? "s" : ""}
            </span>
          </div>
          <div className="progression-bar">
            <div
              className="progression-fill"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>
        <div className="qcm-wrapper">
          <div className="qcm-question">{q.question}</div>
          <div className="qcm-options">
            {q.options.map((option) => {
              let cn = "qcm-option";
              if (reponseChoisie) {
                if (option === q.answer) cn += " correct";
                else if (option === reponseChoisie) cn += " incorrect";
                else cn += " disabled";
              }
              return (
                <button
                  key={option}
                  className={cn}
                  onClick={() => choisirReponse(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {reponseChoisie && (
            <div
              className={`qcm-feedback ${estCorrecte ? "feedback-correct" : "feedback-incorrect"}`}
            >
              <span className="feedback-icon">{estCorrecte ? "✅" : "❌"}</span>
              <div className="feedback-texte">
                <strong>
                  {estCorrecte ? "Well done! 🎉" : "Not quite..."}
                </strong>
                <p>
                  {estCorrecte
                    ? "Excellent answer!"
                    : `The correct answer is: "${q.answer}"`}
                </p>
                {!estCorrecte && est6emeFaute && !ficheObligatoireLue && (
                  <div
                    style={{
                      marginTop: "10px",
                      background: "rgba(255,209,102,0.15)",
                      border: "1px solid rgba(255,209,102,0.4)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                    }}
                  >
                    <p
                      style={{
                        color: "#ffd166",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      😅 6 mistakes!
                    </p>
                    <p style={{ color: "#ddd", fontSize: "0.85rem" }}>
                      Read the study card before continuing! 💪
                    </p>
                  </div>
                )}
                {!estCorrecte && (
                  <button
                    onClick={() => setFicheOuverte(true)}
                    style={{
                      marginTop: "10px",
                      background: "rgba(255,209,102,0.2)",
                      border: "1px solid rgba(255,209,102,0.4)",
                      borderRadius: "8px",
                      padding: "6px 14px",
                      color: "#ffd166",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    📖 View study card
                  </button>
                )}
              </div>
            </div>
          )}
          {reponseChoisie && (
            <div style={{ marginTop: "16px" }}>
              {boutonBloque && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#ffd166",
                    fontSize: "0.85rem",
                    marginBottom: "8px",
                  }}
                >
                  📖 Read the card to unlock!
                </p>
              )}
              <button
                className="lecon-btn"
                onClick={questionSuivante}
                disabled={boutonBloque}
                style={{
                  opacity: boutonBloque ? 0.4 : 1,
                  cursor: boutonBloque ? "not-allowed" : "pointer",
                }}
              >
                {index + 1 >= total ? "See my result →" : "Next question →"}
              </button>
            </div>
          )}
        </div>
        {ficheOuverte && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1a1a2e, #16213e)",
                border: "1px solid rgba(255,209,102,0.4)",
                borderRadius: "20px",
                padding: "28px",
                maxWidth: "500px",
                width: "100%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "#ffd166",
                  marginBottom: "20px",
                }}
              >
                📖 Study card
              </div>
              <div
                style={{
                  marginBottom: "16px",
                  background: "rgba(79,142,247,0.1)",
                  border: "1px solid rgba(79,142,247,0.3)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#4f8ef7",
                    fontWeight: 700,
                    marginBottom: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  📚 The rule
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ddd",
                    lineHeight: "1.6",
                  }}
                >
                  {q.fiche.regle}
                </div>
              </div>
              <div
                style={{
                  marginBottom: "16px",
                  background: "rgba(46,196,182,0.1)",
                  border: "1px solid rgba(46,196,182,0.3)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#2ec4b6",
                    fontWeight: 700,
                    marginBottom: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  ✏️ Example
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ddd",
                    lineHeight: "1.6",
                  }}
                >
                  {q.fiche.exemple}
                </div>
              </div>
              <div
                style={{
                  marginBottom: "16px",
                  background: "rgba(255,107,107,0.1)",
                  border: "1px solid rgba(255,107,107,0.3)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#ff6b6b",
                    fontWeight: 700,
                    marginBottom: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  ⚠️ Watch out
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ddd",
                    lineHeight: "1.6",
                  }}
                >
                  {q.fiche.piege}
                </div>
              </div>
              <div
                style={{
                  marginBottom: "20px",
                  background: "rgba(255,209,102,0.1)",
                  border: "1px solid rgba(255,209,102,0.3)",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#ffd166",
                    fontWeight: 700,
                    marginBottom: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  💡 Tip
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#ddd",
                    lineHeight: "1.6",
                  }}
                >
                  {q.fiche.astuce}
                </div>
              </div>
              <button
                onClick={() => {
                  setFicheOuverte(false);
                  setFicheObligatoireLue(true);
                }}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Got it! Continue →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (etape === "resultat") {
    const pourcentage = Math.round((scoreRef.current / total) * 100);
    const emoji = pourcentage >= 80 ? "🏆" : pourcentage >= 60 ? "👍" : "💪";
    const message =
      pourcentage >= 80
        ? "Excellent work!"
        : pourcentage >= 60
          ? "Well done!"
          : "Keep practising!";
    return (
      <div className="cours-page">
        <div className="cours-header">
          <button className="cours-back" onClick={() => router.back()}>
            ← Retour
          </button>
        </div>
        <div className="resultat-wrapper">
          <div className="resultat-icon">{emoji}</div>
          <h2 className="resultat-titre">{message}</h2>
          <div className="resultat-score">
            {scoreRef.current}/{total}
          </div>
          <p className="resultat-desc">
            You answered {scoreRef.current} question
            {scoreRef.current > 1 ? "s" : ""} correctly out of {total} (
            {pourcentage}%).
          </p>
          {!estConnecte && (
            <div
              style={{
                background: "rgba(79,142,247,0.1)",
                border: "1px solid rgba(79,142,247,0.3)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#aaa",
                  fontSize: "0.9rem",
                  marginBottom: "12px",
                }}
              >
                Discovery mode. Sign up for all 10 questions!
              </p>
              <button
                onClick={() => router.push("/inscription")}
                style={{
                  background: "linear-gradient(135deg, #4f8ef7, #2ec4b6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Sign up for free →
              </button>
            </div>
          )}
          {estConnecte && (bestScore || lastScore) && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              {bestScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(46,196,182,0.1)",
                    border: "1px solid rgba(46,196,182,0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    🏆 Best score
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#2ec4b6",
                    }}
                  >
                    {bestScore.score}/{bestScore.total}
                  </div>
                </div>
              )}
              {lastScore && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.3)",
                    borderRadius: "12px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#aaa",
                      marginBottom: "4px",
                    }}
                  >
                    🕐 Last score
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#4f8ef7",
                    }}
                  >
                    {lastScore.score}/{lastScore.total}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="resultat-actions">
            <button className="lecon-btn" onClick={demarrer}>
              🔄 Try again
            </button>
            <button className="lecon-btn-outline" onClick={() => router.back()}>
              ← Back to topics
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
