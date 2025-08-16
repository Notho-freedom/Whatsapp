export default function SystemMessage({ message }) {
  if (!message.isSystemMessage) return null;

  return (
    <div className="flex justify-center my-2 sm:my-3">
      <div className="system-message text-gray-300 text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gray-800/50 border border-gray-600">
        {message.text}
      </div>
    </div>
  );
}
