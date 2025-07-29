import { Link } from "react-router-dom";
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend }) => {
  return (
    <div className="rounded-lg bg-[var(--background)] text-[var(--text)] border border-[var(--primary)] hover:shadow-md transition-shadow p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src={friend.profilePicture} 
            alt={friend.fullName}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-semibold truncate">{friend.fullName}</h3>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-xs px-2 py-1 rounded bg-[var(--primary)] text-white flex items-center">
          {getLanguageFlag(friend.nativeLanguage)}
          <span>Native: {friend.nativeLanguage}</span>
        </span>
        <span className="text-xs px-2 py-1 rounded border border-[var(--primary)] text-[var(--primary)] flex items-center">
          {getLanguageFlag(friend.learningLanguage)}
          <span>Learning: {friend.learningLanguage}</span>
        </span>
      </div>

      <Link
        to={`/chat/${friend._id}`}
        className="border border-[var(--primary)] text-[var(--primary)] w-full inline-block text-center px-3 py-2 rounded hover:bg-[var(--primary)] hover:text-white transition-colors"
      >
        Message
      </Link>
    </div>
  );
};

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 w-4 mr-1 object-cover flex-shrink-0"
      />
    );
  }
  return null;
}

export default FriendCard;