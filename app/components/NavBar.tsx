import { useState, useEffect } from "react";
import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";

const NavBar = () => {
  const {
    auth,
    loadAvatar,
    auth: { signOut },
  } = usePuterStore();
  const [avatarUrl, setAvatarUrl] = useState("/icons/user.png");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetch() {
      const url = await loadAvatar();
      if (url) setAvatarUrl(url);
    }
    fetch();
  }, []);

  const logoutHandler = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <nav
      className="
            w-[90%] max-w-[1400px] mx-auto bg-white rounded-full px-6 py-4 shadow-sm
            flex items-center justify-between relative
        "
    >
      {/* Left */}
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">RESUMIND</p>
      </Link>

      {/* Right Section */}
      <div className="flex items-center gap-6 ">
        {/* Upload button */}
        <Link to="/upload" className="primary-button w-fit">
          Upload Resume
        </Link>

        {/* Avatar Dropdown */}
        {auth?.isAuthenticated && (
          <div className="relative">
            <img
              src={avatarUrl}
              alt="User"
              className="w-12 h-12 rounded-full border shadow-md cursor-pointer"
              onClick={() => setOpen(!open)}
            />

            {/* Dropdown */}
            {open && (
              <div
                className="
                                absolute right-0 mt-3 bg-white shadow-lg rounded-lg py-2 w-40 z-[999]
                            "
              >
                <button
                  onClick={logoutHandler}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
