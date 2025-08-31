import React from 'react';
import './App.css';
import { API_URL } from './api';

function App() {
  const [question, setQuestion] = React.useState("");
  const [result, setResult] = React.useState(undefined);
  const [history, setHistory] = React.useState([]);

  const askQuestion = async () => {
    if (question.trim() === "") return;

    // Create a short preview for sidebar history
    const shortQuestion =
      question.split(" ").slice(0, 5).join(" ") +
      (question.split(" ").length > 5 ? "..." : "");

    const newHistory = [...history, { type: 'user', text: shortQuestion, full: question }];
    setHistory(newHistory);
    setQuestion("");
    setResult(undefined);

    try {
      let response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          contents: [{ parts: [{ text: question }] }]
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      response = await response.json();
      console.log(response);

      // Extract and format Gemini response
      const botResponse = response.candidates[0].content.parts[0].text;

      // Replace line breaks with <br> for readability
      const formattedResponse = botResponse
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // bold
        .replace(/- (.*?)(<br>|$)/g, "• $1<br>"); // bullet points

      setHistory([...newHistory, { type: 'bot', text: formattedResponse, isHtml: true }]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setHistory([...newHistory, { type: 'bot', text: "Sorry, I couldn't fetch a response." }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      askQuestion();
    }
  };

  const handleHistoryClick = (text) => {
    setQuestion(text);
    askQuestion();
  };

  return (
    <>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Recent</h3>
          </div>
          <ul className="history">
            {history.filter(item => item.type === 'user').map((item, index) => (
              <li key={index} onClick={() => handleHistoryClick(item.full)}>
                <span>💬</span> {item.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="main-content">
          <div className="chat-area">
            {history.length === 0 ? (
              <div className="welcome-container">
                <div className="logo">R</div>
                <h1>Welcome to ReactBot!</h1>
                <p>I am a friendly chatbot designed to answer your questions and provide information.</p>
              </div>
            ) : (
              history.map((item, index) => (
                <div key={index} className={`chat-bubble ${item.type}`}>
                  {item.isHtml ? (
                    <p dangerouslySetInnerHTML={{ __html: item.text }} />
                  ) : (
                    <p>{item.text}</p>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text" 
                onChange={(e) => setQuestion(e.target.value)}
                value={question}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything"
              />
              <button onClick={askQuestion}>➤</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
