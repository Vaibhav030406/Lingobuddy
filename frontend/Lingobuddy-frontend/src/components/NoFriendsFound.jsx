const NoFriendsFound = () => {
  return (
    <div className="rounded bg-[var(--background)] text-[var(--text)] border border-[var(--primary)] p-6 text-center">
      <h3 className="font-semibold text-lg mb-2">No friends yet</h3>
      <p className="opacity-70">
        Connect with language partners below to start practicing together!
      </p>
    </div>
  );
};

export default NoFriendsFound;
