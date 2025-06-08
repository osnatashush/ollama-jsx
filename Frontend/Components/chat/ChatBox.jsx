  {/* Welcome/title section */}
  {messages.length === 0 && (
    <div className="w-full flex flex-col items-center justify-center mt-12 mb-8">
      <h2 className="text-3xl font-bold text-blue-100 mb-2">Hi, I'm Ronna!</h2>
      <p className="text-lg text-blue-200">What can I help you with?</p>
    </div>
  )}
  {/* Message list */}
  <div className="flex-1 overflow-y-auto px-4 py-6">
    {messages.map((message, index) => (
      <div
        key={index}
        className={`flex gap-4 mb-6 ${
          message.role === "assistant" ? "justify-start" : "justify-end"
        }`}
      >
        {message.role === "assistant" && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-blue-100 font-bold text-sm">R</span>
          </div>
        )}
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            message.role === "assistant"
              ? "bg-blue-600/50 text-blue-100"
              : "bg-blue-500/50 text-blue-100"
          }`}
        >
          {message.content}
        </div>
      </div>
    ))}
  </div>
  {/* Input bar */}
  <form
    onSubmit={handleSubmit}
    className="w-full flex items-center gap-2 px-4 py-3 bg-blue-200/90 rounded-2xl shadow-lg mt-6 mb-4 border border-blue-300 focus-within:ring-2 focus-within:ring-blue-400"
    style={{ position: 'relative' }}
  >
    <input
      type="text"
      value={input}
      onChange={e => setInput(e.target.value)}
      placeholder="Type your message..."
      className="flex-1 bg-transparent outline-none text-blue-800 placeholder-blue-500 text-base px-2"
    />
    <button
      type="submit"
      className="ml-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-blue-100 font-semibold shadow transition"
    >
      Send
    </button>
  </form> 