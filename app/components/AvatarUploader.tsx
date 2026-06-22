import { useState } from "react";
import { usePuterStore } from "~/lib/puter";

export default function AvatarUploader() {
  const { uploadAvatar } = usePuterStore();
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    await uploadAvatar(file);
    setLoading(false);

    alert("Avatar updated!");
    window.location.reload();
  };

  return (
    <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded font-medium">
      {loading ? "Uploading..." : "Upload New Avatar"}
      <input type="file" className="hidden" onChange={handleUpload} />
    </label>
  );
}
