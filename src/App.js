// import React, { useState, useRef, useEffect } from "react";
// import ReactMarkdown from "react-markdown";
// import "./App.css";
//
// function App() {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);
//
//   const sendMessage = async () => {
//     if (!input.trim()) return;
//
//     const updatedMessages = [...messages, { role: "user", content: input }];
//     setMessages(updatedMessages);
//     setInput("");
//     setLoading(true);
//
//     try {
//       const res = await fetch("https://server-app-mg66b.ondigitalocean.app/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ messages: updatedMessages }),
//       });
//
//       const data = await res.json();
//       setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
//     } catch (err) {
//       setMessages([...updatedMessages, { role: "assistant", content: "❌ Failed to get reply." }]);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };
//
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);
//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       e.preventDefault();
//       e.returnValue = ""; // 必须这样写，才能触发浏览器的提示弹窗
//     };
//
//     window.addEventListener("beforeunload", handleBeforeUnload);
//
//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, []);
//
//   return (
//     <div className="app-container">
//       <h2 className="title">Learn with ChatGPT</h2>
//
//       <div className="chat-box">
//         {messages.map((msg, idx) => (
//           <div key={idx} className={`message ${msg.role}`}>
//             <div className="bubble">
//               <ReactMarkdown
//                 components={{
//                   p: ({ node, ...props }) => <p className="message-content" {...props} />,
//                   strong: ({ node, ...props }) => <strong {...props} />,
//                   code: ({ node, ...props }) => <code {...props} />,
//                   pre: ({ node, ...props }) => <pre {...props} />,
//                   li: ({ node, ...props }) => <li {...props} />,
//                 }}
//               >
//                 {msg.content}
//               </ReactMarkdown>
//             </div>
//           </div>
//         ))}
//
//         {/* Typing animation */}
//         {loading && (
//           <div className="message assistant">
//             <div className="bubble typing-bubble">
//               GPT-4o: Typing<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
//             </div>
//           </div>
//         )}
//
//         <div ref={chatEndRef} />
//       </div>
//
//       <div className="input-area">
//         <textarea
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Ask ChatGPT something..."
//         />
//         <button onClick={sendMessage} disabled={loading}>
//           {loading ? "Sending..." : "Send"}
//         </button>
//       </div>
//     </div>
//   );
// }
//
// export default App;


//

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://server-app-mg66b.ondigitalocean.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Network response was not ok.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let fullReply = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullReply += chunk;

        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg.role === "assistant") {
            const updatedLast = { ...lastMsg, content: fullReply };
            return [...prev.slice(0, -1), updatedLast];
          }
          return prev;
        });
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Failed to get reply." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <div className="app-container">
      <h2 className="title">Learn with ChatGPT</h2>

      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="bubble">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p className="message-content" {...props} />,
                  strong: ({ node, ...props }) => <strong {...props} />,
                  code: ({ node, ...props }) => <code {...props} />,
                  pre: ({ node, ...props }) => <pre {...props} />,
                  li: ({ node, ...props }) => <li {...props} />,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="bubble typing-bubble">
              GPT-4o: Typing<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask ChatGPT something..."
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
