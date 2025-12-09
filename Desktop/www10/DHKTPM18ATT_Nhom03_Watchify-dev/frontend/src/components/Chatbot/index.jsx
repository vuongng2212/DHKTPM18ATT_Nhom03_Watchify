import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import { chatbotApi } from "../../services/api";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể giúp gì về đồng hồ hôm nay?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Tạo và lưu trữ sessionId khi component mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem("chatSessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = "user_" + Date.now();
      localStorage.setItem("chatSessionId", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && input === "" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [input, isOpen]);

  const handleSendMessage = debounce(async () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
    if (inputRef.current) inputRef.current.focus();

    setIsLoading(true);

    try {
      const response = await chatbotApi({
        message: input,
        sessionId: sessionId,
      });
      const botResponse = response.reply;
      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    } catch (error) {
      console.error("Error calling backend API:", error.message);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Xin lỗi, tôi không thể trả lời ngay lúc này. Bạn có thể hỏi thêm về đồng hồ không?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, 100);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition cursor-pointer"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M21 12c0 4.418-3.582 8-8 8h-2l-4 3v-3H5c-2.21 0-4-1.79-4-4V8c0-2.21 1.79-4 4-4h14c2.21 0 4 1.79 4 4v4z"
            />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-lg shadow-lg w-80 h-96 flex flex-col">
          <div className="bg-red-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold select-none">Watchify Chatbot</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white cursor-pointer hover:text-gray-300 transition-all duration-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-2">
                <span className="inline-block p-2 rounded-lg bg-gray-200 text-black">
                  Đang xử lý...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t">
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 p-2 border rounded-l-lg focus:outline-none"
                placeholder="Hỏi về đồng hồ..."
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                className="bg-red-600 text-white p-[9px] rounded-r-lg hover:bg-red-700 cursor-pointer"
                disabled={isLoading}
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
