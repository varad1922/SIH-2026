import React, { useState } from 'react';
import axios from 'axios';
import { Target, CheckCircle, XCircle, Loader2, Award, ArrowRight } from 'lucide-react';

const Assessment = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const generateQuiz = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setScore(null);
    setAnswers({});
    setCurrentQ(0);
    
    try {
      const res = await axios.post('http://localhost:5000/api/quizzes/generate', { topic });
      setQuestions(res.data.questions);
    } catch (error) {
      alert("Failed to generate quiz. Check backend.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (option) => {
    setAnswers({ ...answers, [currentQ]: option });
  };

  const submitQuiz = () => {
    let s = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) s++;
    });
    setScore(s);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Target className="w-32 h-32" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Competency Assessment</h1>
        <p className="text-gray-500 mb-8 max-w-2xl">Enter a skill or domain you wish to assess. Our Gemini AI engine will generate a real-time, personalized MCQ test to evaluate your competency level.</p>
        
        <div className="flex space-x-3">
          <input 
            type="text" 
            placeholder="e.g., Python Data Science, Advanced Survey Design..." 
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <button 
            onClick={generateQuiz}
            disabled={isGenerating || !topic}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center shadow-lg shadow-primary-500/30"
          >
            {isGenerating ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Target className="w-6 h-6 mr-2" />}
            {isGenerating ? 'Generating...' : 'Start Assessment'}
          </button>
        </div>
      </div>

      {questions && score === null && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-primary-600 tracking-wider uppercase">Question {currentQ + 1} of {questions.length}</span>
            <span className="px-3 py-1 bg-secondary-50 text-secondary-700 rounded-full text-xs font-bold">{questions[currentQ].difficultyLevel}</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-8">{questions[currentQ].text}</h2>
          
          <div className="space-y-4 mb-8">
            {questions[currentQ].options.map((opt, idx) => (
              <button 
                key={idx}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                  answers[currentQ] === opt 
                    ? 'border-primary-500 bg-primary-50 shadow-sm' 
                    : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQ] === opt ? 'border-primary-500' : 'border-gray-300'}`}>
                    {answers[currentQ] === opt && <div className="w-3 h-3 bg-primary-500 rounded-full" />}
                  </div>
                  <span className="text-lg text-gray-700 font-medium">{opt}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
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
                onClick={submitQuiz}
                disabled={Object.keys(answers).length !== questions.length}
                className="px-8 py-3 rounded-xl font-bold bg-success-600 text-white hover:bg-success-700 disabled:opacity-50 transition-colors shadow-lg shadow-success-600/30"
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      )}

      {score !== null && (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-success-100 rounded-full blur-3xl opacity-50" />
          <Award className="w-24 h-24 text-success-500 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-gray-900 mb-2">Assessment Complete!</h2>
          <p className="text-xl text-gray-600 mb-8">You scored <span className="font-bold text-success-600">{score}</span> out of {questions.length}</p>
          
          <div className="text-left space-y-6 max-w-2xl mx-auto">
            {questions.map((q, idx) => {
              const isCorrect = answers[idx] === q.correctAnswer;
              return (
                <div key={idx} className={`p-6 rounded-2xl border ${isCorrect ? 'bg-success-50/50 border-success-100' : 'bg-red-50/50 border-red-100'}`}>
                  <div className="flex items-start space-x-3">
                    {isCorrect ? <CheckCircle className="w-6 h-6 text-success-500 mt-1 flex-shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{q.text}</h3>
                      <p className="text-sm text-gray-600 mb-1">Your answer: <span className={isCorrect ? 'text-success-700 font-semibold' : 'text-red-700 font-semibold line-through'}>{answers[idx]}</span></p>
                      {!isCorrect && <p className="text-sm text-success-700 font-semibold mb-2">Correct answer: {q.correctAnswer}</p>}
                      <p className="text-sm text-gray-500 mt-2 bg-white/50 p-3 rounded-lg">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
