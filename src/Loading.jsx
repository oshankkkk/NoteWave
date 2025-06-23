export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {/* Animated dots */}
        <div className="flex justify-center space-x-2 mb-8">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
        
        {/* Loading text with pulse animation */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800 animate-pulse">
            Loading
          </h2>
        </div>
      </div>
    </div>
  );
}