import { useRouter } from "next/router";
import { useState, useLayoutEffect, useEffect } from "react";
import axios from "axios";
import UserDetailModal from "@/components/userDetailModal.js";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const [lastTap, setLastTap] = useState(0);
  const [modalOpen, setModalOpen] = useState(false); // Modal state
  const [selectedUser, setSelectedUser] = useState(null); // Selected user for modal

  useLayoutEffect(() => {
    const fetchAdminData = async () => {
      try {
        if (typeof window !== "undefined") {
          const storedAdmin = JSON.parse(localStorage.getItem("user"));
          if (storedAdmin) {
            const response = await axios.post(
              "http://18.215.243.4:3000/user/isAdmin",
              {
                login: storedAdmin.email,
                password: storedAdmin.password,
              }
            );

            const data = response.data;
            if (data) {
              setAdmin(storedAdmin);
              setLoading(false);
              router.push("/dashboard");
            } else {
              router.push("/login");
            }
          } else {
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError("Failed to load admin data. Please try again.");
        router.push("/login");
      }
    };

    fetchAdminData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (activeSection === "Users") {
        setLoading(true);
        try {
          const response = await axios.get("http://18.215.243.4:3000/user", {
            headers: {
              login: admin?.login,
              password: admin?.password,
            },
          });
          setUsers(response.data);
        } catch (err) {
          console.error("Failed to fetch users:", err);
          setError("Failed to load users data. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, [activeSection, admin]);

  const handleLogOut = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleEditClick = (userId, field) => {
    setEditingUser({ userId, field });
  };

  const handleInputChange = (e, userId, field) => {
    const updatedUsers = users.map((user) =>
      user._id === userId ? { ...user, [field]: e.target.value } : user
    );
    setUsers(updatedUsers);
  };

  const handleInputBlur = async (userId, field) => {
    const userToUpdate = users.find((user) => user._id === userId);

    try {
      await axios.put(
        `http://18.215.243.4:3000/user/${userId}`,
        {
          [field]: userToUpdate[field],
        },
        {
          headers: {
            "Content-Type": "application/json",
            login: admin?.login,
            password: admin?.password,
          },
        }
      );
    } catch (error) {
      console.error("Failed to update user:", error);
    }

    setEditingUser(null);
  };

  const handleDoubleTap = (userId, field) => {
    const currentTime = Date.now();
    const tapLength = currentTime - lastTap;

    if (tapLength < 300 && tapLength > 0) {
      handleEditClick(userId, field);
    }
    setLastTap(currentTime);
  };

  const handleRowClick = (user) => {
    setSelectedUser(user); // Set the selected user
    setModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close the modal
    setSelectedUser(null); // Clear selected user
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`http://18.215.243.4:3000/user/${selectedUser._id}`, {
        headers: {
          login: admin?.login,
          password: admin?.password,
        },
      });
      setUsers(users.filter((user) => user._id !== selectedUser._id)); // Update user list
      handleCloseModal(); // Close the modal after deletion
    } catch (error) {
      console.error("Failed to delete user:", error);
      setError("Failed to delete user. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const isMobile = () => /Mobi|Android/i.test(navigator.userAgent);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white shadow-md transition-transform duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:w-64 w-3/4 max-w-xs md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 bg-indigo-600 text-white px-4">
          <span className="text-2xl font-semibold">Admin</span>
          <button
            className="md:hidden p-2"
            onClick={() => setSidebarOpen(false)}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col p-4">
          <button
            onClick={() => setActiveSection("Users")}
            className={`p-2 text-gray-800 rounded hover:bg-gray-200 ${
              activeSection === "Users" && "bg-gray-200"
            }`}
          >
            Users
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between h-16 px-4 bg-white shadow-md">
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setSidebarOpen(!sidebarOpen)}
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
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {activeSection}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Admin</span>
            <button
              className="p-2 bg-gray-200 rounded-full"
              onClick={handleLogOut}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeSection === "Dashboard" && (
            <div className="p-4 bg-white shadow rounded-md">
              <h2 className="text-lg font-semibold">
                Welcome to the Dashboard
              </h2>
              <p className="text-gray-600">
                This is the dashboard overview section.
              </p>
            </div>
          )}
          {activeSection === "Users" && (
            <div className="p-4 bg-white shadow rounded-md">
              <h2 className="text-lg font-semibold mb-4">Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">Full Name</th>
                      <th className="px-4 py-2 border">Number</th>
                      <th className="px-4 py-2 border">Password</th>
                      <th className="px-4 py-2 border">Is Done</th>
                      <th className="px-4 py-2 border">Today's Balance</th>
                      <th className="px-4 py-2 border">All Balance</th>
                      <th className="px-4 py-2 border">Packages</th>
                      <th className="px-4 py-2 border">Is Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={index}>
                        <td
                          className="px-4 py-2 border"
                          onClick={() => handleRowClick(user)}
                        >
                          {user.fullName}
                        </td>
                        <td className="px-4 py-2 border cursor-pointer">
                          {user.number}
                        </td>
                        <td
                          className="px-4 py-2 border cursor-pointer"
                          onDoubleClick={() => {
                            if (!isMobile()) {
                              handleEditClick(user._id, "password");
                            }
                          }}
                          onTouchEnd={() => {
                            if (isMobile()) {
                              handleDoubleTap(user._id, "password");
                            }
                          }}
                        >
                          {editingUser?.userId === user._id &&
                          editingUser.field === "password" ? (
                            <input
                              type="text"
                              value={user.password}
                              onChange={(e) =>
                                handleInputChange(e, user._id, "password")
                              }
                              onBlur={() =>
                                handleInputBlur(user._id, "password")
                              }
                              className="border border-gray-300 rounded p-1"
                            />
                          ) : (
                            user.password
                          )}
                        </td>
                        <td className="px-4 py-2 border">
                          {user.isDone ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-2 border">
                          {user.todaysBalance}
                        </td>
                        <td className="px-4 py-2 border">{user.allBalance}</td>
                        <td className="px-4 py-2 border">
                          {user?.packages?.join(", ")}
                        </td>
                        <td
                          className="px-4 py-2 border cursor-pointer"
                          onDoubleClick={() => {
                            if (!isMobile()) {
                              handleEditClick(user._id, "isPaid");
                            }
                          }}
                          onTouchEnd={() => {
                            if (isMobile()) {
                              handleDoubleTap(user._id, "isPaid");
                            }
                          }}
                        >
                          {editingUser?.userId === user._id &&
                          editingUser.field === "isPaid" ? (
                            <select
                              value={user.isPaid}
                              onChange={(e) =>
                                handleInputChange(e, user._id, "isPaid")
                              }
                              onBlur={() => handleInputBlur(user._id, "isPaid")}
                              className="border border-gray-300 rounded p-1"
                            >
                              <option value={true}>Yes</option>
                              <option value={false}>No</option>
                            </select>
                          ) : user.isPaid === true ? (
                            "Yes"
                          ) : (
                            "No"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default Dashboard;
