import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Target, CheckCircle, XCircle, Loader2, Award, ArrowRight, AlertTriangle } from 'lucide-react';

const availableTests = [
  { id: 1, topic: 'Data Science & Python', desc: 'Test your knowledge on Pandas, NumPy, and Data Analysis.' },
  { id: 2, topic: 'Machine Learning', desc: 'Assess your skills in ML algorithms, Neural Networks, and AI.' },
  { id: 3, topic: 'Web Development', desc: 'MERN stack, HTML/CSS, and frontend frameworks.' },
  { id: 4, topic: 'Cybersecurity', desc: 'Network security, cryptography, and risk assessment.' },
];

const Assessment = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  
  const quizContainerRef = useRef(null);

  // Auto-submit anti-cheat mechanism
  useEffect(() => {
    if (!questions || score !== null) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleAutoSubmit();
      }
    };
    
    const handleBlur = () => {
      handleAutoSubmit();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [questions, score, answers]);

  const handleAutoSubmit = () => {
    setAutoSubmitted(true);
    submitQuiz(true); // pass true to indicate auto-submit
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  const startQuiz = async () => {
    if (!selectedTopic) return;
    setIsGenerating(true);
    setScore(null);
    setAnswers({});
    setCurrentQ(0);
    setAutoSubmitted(false);
    
    try {
      const res = await axios.post('http://localhost:5000/api/quizzes/generate', { topic: selectedTopic.topic });
      setQuestions(res.data.questions);
      
      // Request Fullscreen
      if (quizContainerRef.current) {
        quizContainerRef.current.requestFullscreen().catch(err => {
          console.error("Error attempting to enable fullscreen:", err);
        });
      }
    } catch (error) {
      alert("Failed to generate quiz. Check backend.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (option) => {
    setAnswers(prev => ({ ...prev, [currentQ]: option }));
  };

  const submitQuiz = (isAuto = false) => {
    // If not auto-submitting via blur, manually exit fullscreen
    if (!isAuto && document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
    
    // We use a functional state update here to ensure we capture the latest answers
    setAnswers(currentAnswers => {
      let s = 0;
      questions.forEach((q, idx) => {
        if (currentAnswers[idx] === q.correctAnswer) s++;
      });
      setScore(s);
      return currentAnswers;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" ref={quizContainerRef}>
      {/* If Quiz hasn't started and no score */}
      {!questions && score === null && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Target className="w-32 h-32" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Assessments</h1>
          <p className="text-gray-500 mb-8 max-w-2xl">Select a topic below to begin. The quiz will launch in full-screen mode. Warning: Switching tabs or leaving the screen will automatically submit your test.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {availableTests.map(test => (
              <div 
                key={test.id} 
                onClick={() => setSelectedTopic(test)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedTopic?.id === test.id 
                    ? 'border-primary-600 bg-primary-50 shadow-md transform scale-[1.02]' 
                    : 'border-gray-100 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <h3 className={`text-xl font-bold mb-2 ${selectedTopic?.id === test.id ? 'text-primary-800' : 'text-gray-800'}`}>
                  {test.topic}
                </h3>
                <p className="text-sm text-gray-500">{test.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button 
              onClick={startQuiz}
              disabled={isGenerating || !selectedTopic}
              className="bg-primary-800 hover:bg-primary-900 disabled:opacity-50 text-white px-10 py-4 rounded-xl font-bold transition-all flex items-center shadow-lg shadow-primary-900/30"
            >
              {isGenerating ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Target className="w-6 h-6 mr-2" />}
              {isGenerating ? 'Preparing Assessment...' : 'Take Quiz (Full Screen)'}
            </button>
          </div>
        </div>
      )}

      {/* Active Quiz View */}
      {questions && score === null && (
        <div className="bg-white p-8 md:p-12 min-h-screen md:min-h-0 md:rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-primary-800 tracking-wider uppercase">Question {currentQ + 1} of {questions.length}</span>
              <span className="px-3 py-1 bg-secondary-50 text-secondary-800 rounded-full text-xs font-bold">{questions[currentQ].difficultyLevel}</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-8">{questions[currentQ].text}</h2>
            
            <div className="space-y-4 mb-8">
              {questions[currentQ].options.map((opt, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                    answers[currentQ] === opt 
                      ? 'border-primary-600 bg-primary-50 shadow-sm' 
                      : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQ] === opt ? 'border-primary-600' : 'border-gray-300'}`}>
                      {answers[currentQ] === opt && <div className="w-3 h-3 bg-primary-600 rounded-full" />}
                    </div>
                    <span className="text-lg text-gray-700 font-medium">{opt}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1"/> Anti-Cheat Active
              </p>
              <div className="flex space-x-4">
                {currentQ > 0 && (
                  <button onClick={() => setCurrentQ(prev => prev - 1)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                    Previous
                  </button>
                )}
                {currentQ < questions.length - 1 ? (
                  <button 
                    onClick={() => setCurrentQ(prev => prev + 1)} 
                    disabled={!answers[currentQ]}
                    className="px-6 py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center"
                  >
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button 
                    onClick={() => submitQuiz(false)}
                    disabled={Object.keys(answers).length !== questions.length}
                    className="px-8 py-3 rounded-xl font-bold bg-success-600 text-white hover:bg-success-700 disabled:opacity-50 transition-colors shadow-lg shadow-success-600/30"
                  >
                    Submit Assessment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {score !== null && (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-success-100 rounded-full blur-3xl opacity-50" />
          
          {autoSubmitted && (
             <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl font-bold flex items-center justify-center max-w-xl mx-auto border border-red-200">
               <AlertTriangle className="w-6 h-6 mr-2" />
               Assessment was automatically submitted because you left the window.
             </div>
          )}

          <Award className="w-24 h-24 text-success-500 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-gray-900 mb-2">Assessment Complete!</h2>
          <p className="text-xl text-gray-600 mb-8">You scored <span className="font-bold text-success-600">{score}</span> out of {questions?.length}</p>
          
          <div className="text-left space-y-6 max-w-2xl mx-auto">
            {questions && questions.map((q, idx) => {
              const isCorrect = answers[idx] === q.correctAnswer;
              const hasAnswered = answers[idx] !== undefined;
              return (
                <div key={idx} className={`p-6 rounded-2xl border ${isCorrect ? 'bg-success-50/50 border-success-100' : 'bg-red-50/50 border-red-100'}`}>
                  <div className="flex items-start space-x-3">
                    {isCorrect ? <CheckCircle className="w-6 h-6 text-success-500 mt-1 flex-shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{q.text}</h3>
                      <p className="text-sm text-gray-600 mb-1">Your answer: <span className={isCorrect ? 'text-success-700 font-semibold' : 'text-red-700 font-semibold ' + (hasAnswered ? 'line-through' : '')}>{hasAnswered ? answers[idx] : 'Not Answered'}</span></p>
                      {!isCorrect && <p className="text-sm text-success-700 font-semibold mb-2">Correct answer: {q.correctAnswer}</p>}
                      <p className="text-sm text-gray-500 mt-2 bg-white/50 p-3 rounded-lg">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
             <button 
                onClick={() => { setQuestions(null); setScore(null); setSelectedTopic(null); setAutoSubmitted(false); }}
                className="px-8 py-3 rounded-xl font-bold bg-primary-800 text-white hover:bg-primary-900 transition-colors"
             >
                Return to Assessments
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
