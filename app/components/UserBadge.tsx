import { usePuterStore } from "~/lib/puter";

export default function UserBadge() {
  const { auth } = usePuterStore();

  if (!auth?.isAuthenticated) return null;

  const user = auth.user;

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-white shadow-lg border rounded-full px-4 py-2 flex items-center gap-2">
      <img
        src={user.avatar || "/icons/user.png"}
        alt="User Avatar"
        className="w-8 h-8 rounded-full"
      />
      <span className="font-medium text-sm">{user.name || user.email}</span>
    </div>
  );
}
