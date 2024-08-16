import { useRouter } from "next/router";
import { useState, useLayoutEffect, useEffect } from "react";
import axios from "axios";
import UserDetailModal from "@/components/userDetailModal.js";
import Loading from "@/components/loading.js";
import UserAddModal from "@/components/addUserModal.js";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [users, setUsers] = useState([]);
  const [queuers, setQueuers] = useState([]);
  const [admin, setAdmin] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAddModalOpen, setUserAddModalOpen] = useState(false);
  useLayoutEffect(() => {
    const fetchAdminData = async () => {
      try {
        if (typeof window !== "undefined") {
          const storedAdmin = JSON.parse(localStorage.getItem("user"));
          if (storedAdmin) {
            const response = await axios.post(
              "http://18.215.243.4:3000/user/isAdmin",
              {
                login: storedAdmin.login,
                password: storedAdmin.password,
              }
            );

            const data = response.data;
            if (data) {
              setAdmin(storedAdmin);
              setLoading(false);
              router.push("/dashboard");
              setActiveSection("Users");
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
  let handleRefreshUsersData = async () => {
    setLoading(true);
    await axios.post(
      "http://18.215.243.4:3000/user/refreshUsersData",
      {},
      {
        headers: {
          login: admin?.login,
          password: admin?.password,
        },
      }
    );
    await fetchUsers();
    setLoading(false);
  };
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
      }
      setLoading(false);
    }
  };
  const fetchQueuers = async () => {
    if (activeSection === "Queuers") {
      setLoading(true);
      try {
        const response = await axios.get("http://18.215.243.4:3000/queuer", {
          headers: {
            login: admin?.login,
            password: admin?.password,
          },
        });
        setQueuers(response.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users data. Please try again.");
      }
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
    fetchQueuers();
  }, [admin, activeSection]);

  const handleLogOut = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`http://18.215.243.4:3000/user/${selectedUser?._id}`, {
        headers: {
          login: admin?.login,
          password: admin?.password,
        },
      });
      setUsers(users.filter((user) => user?._id !== selectedUser?._id));
      handleCloseModal();
    } catch (error) {
      console.error("Failed to delete user:", error);
      setError("Failed to delete user. Please try again.");
    }
  };

  const handleDeleteQueuer = async (queuer) => {
    try {
      await axios.delete(`http://18.215.243.4:3000/queuer/${queuer?._id}`, {
        headers: {
          login: admin?.login,
          password: admin?.password,
        },
      });
      setQueuers(queuers.filter((queuerI) => queuer?._id !== queuerI?._id));
    } catch (error) {
      console.error("Failed to delete user:", error);
      setError("Failed to delete user. Please try again.");
    }
  };
  const handleAddUser = async (newUser) => {
    try {
      const response = await axios.post(
        "http://18.215.243.4:3000/user",
        newUser,
        {
          headers: {
            "Content-Type": "application/json",
            login: admin?.login,
            password: admin?.password,
          },
        }
      );
      setUsers((prevUsers) => [...prevUsers, response.data]);
    } catch (error) {
      console.error("Failed to add user:", error);
      setError("Failed to add user. Please try again.");
    }
  };

  const getIncome = () => {
    return users.filter((user) => user.isPaid).length * 20;
  };
  let markAsPaid = (userI) => {
    let isPaid = !userI.isPaid;
    axios.put(
      "http://18.215.243.4:3000/user/" + userI._id,
      {
        isPaid,
      },
      {
        headers: {
          "Content-Type": "application/json",
          login: admin?.login,
          password: admin?.password,
        },
      }
    );
    setUsers((prev) => {
      return prev.map((user) => {
        if (user._id == userI._id) {
          user.isPaid = isPaid;
        }
        return user;
      });
    });
  };
  let approveQueuer = (queuer) => {
    try {
      axios
        .post("http://18.215.243.4:3000/user", {
          fullName: queuer.fullName,
          number: queuer.number,
          password: queuer.password,
        })
        .then(() => {
          handleDeleteQueuer(queuer);
          setQueuers(queuers.filter((queuerI) => queuer?._id !== queuerI?._id));
        })
        .catch((err) => {
          alert(err?.response?.data?.message ?? "Something went wrong");
        });
    } catch (error) {
      alert(error.message);
    }
  };
  if (loading) {
    return <Loading />;
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
            onClick={() => {
              setActiveSection("Users");
              setSidebarOpen(false);
            }}
            className={`p-2 text-gray-800 rounded hover:bg-gray-200 ${
              activeSection === "Users" && "bg-gray-200"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => {
              setActiveSection("Income");
              setSidebarOpen(false);
            }}
            className={`p-2 text-gray-800 rounded hover:bg-gray-200 ${
              activeSection === "Income" && "bg-gray-200"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => {
              setActiveSection("Queuers");
              setSidebarOpen(false);
            }}
            className={`p-2 text-gray-800 rounded hover:bg-gray-200 ${
              activeSection === "Queuers" && "bg-gray-200"
            }`}
          >
            Queuers
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
          {activeSection === "Users" && (
            <div className="p-4 bg-white shadow rounded-md">
              <h2 className="text-lg font-semibold mb-4">Users</h2>
              <div className="overflow-x-auto">
                <div className="flex justify-between">
                  <button
                    onClick={() => setUserAddModalOpen(true)}
                    className="mb-4 p-2 bg-green-500 text-white rounded"
                  >
                    Add User
                  </button>
                  <button
                    onClick={handleRefreshUsersData}
                    className="mb-4 p-2 bg-blue-600 text-white rounded"
                  >
                    Refresh
                  </button>
                </div>

                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      {isMobile() ? (
                        <>
                          <th className="px-4 py-2 border">Name</th>
                          <th className="px-4 py-2 border">Is Paid</th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-2 border">Name</th>
                          <th className="px-4 py-2 border">Number</th>
                          <th className="px-4 py-2 border">Is Done</th>
                          <th className="px-4 py-2 border">Today's Balance</th>
                          <th className="px-4 py-2 border">All Balance</th>
                          <th className="px-4 py-2 border">Packages</th>
                          <th className="px-4 py-2 border">Is Paid</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={index}>
                        {isMobile() ? (
                          <>
                            <td
                              className="px-4 py-2 border"
                              onClick={() => handleRowClick(user)}
                            >
                              {user?.fullName}
                            </td>
                            <td className="px-4 py-2 border">
                              {user?.isPaid ? "Yes" : "No"}
                            </td>
                          </>
                        ) : (
                          <>
                            {" "}
                            <td
                              className="px-4 py-2 border"
                              onClick={() => handleRowClick(user)}
                            >
                              {user?.fullName}
                            </td>
                            <td className="px-4 py-2 border">{user?.number}</td>
                            <td className="px-4 py-2 border">
                              {user?.isDone ? "Yes" : "No"}
                            </td>
                            <td className="px-4 py-2 border">
                              <span className="font-medium">$</span>
                              {user?.todaysBalance}
                            </td>
                            <td className="px-4 py-2 border">
                              <span className="font-medium">$</span>
                              {user?.allBalance}
                            </td>
                            <td className="px-4 py-2 border">
                              {user?.packages?.join(", ")}
                            </td>
                            <td className="px-4 py-2 border">
                              {user?.isPaid ? "Yes" : "No"}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeSection === "Queuers" && (
            <div className="p-4 bg-white shadow rounded-md">
              <h2 className="text-lg font-semibold mb-4">Queuers</h2>
              <div className="overflow-x-auto">
                <div className="flex justify-end">
                  <button
                    onClick={fetchQueuers}
                    className="mb-4 p-2 bg-blue-600 text-white rounded"
                  >
                    Refresh
                  </button>
                </div>

                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">Name</th>
                      <th className="px-4 py-2 border">Number</th>
                      <th className="px-4 py-2 border">Payment</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queuers.map((queuer, index) => (
                      <tr key={index}>
                        <>
                          <td className="px-4 py-2 border">
                            {queuer?.fullName}
                          </td>
                          <td className="px-4 py-2 border">{queuer?.number}</td>
                          <td className="px-4 py-2 border">
                            <a
                              className="text-blue-600"
                              target="__blank"
                              href={
                                "http://18.215.243.4:3000/" +
                                queuer?.paymentImage
                              }
                            >
                              Image
                            </a>
                          </td>
                          <td className="flex justify-center">
                            <button
                              className="px-4 py-2 mr-3 bg-red-500 text-white rounded"
                              onClick={() => handleDeleteQueuer(queuer)}
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => approveQueuer(queuer)}
                              className="px-4 py-2 bg-green-500 text-white rounded"
                            >
                              Approve
                            </button>
                          </td>
                        </>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeSection === "Income" && (
            <div className="p-4 bg-white shadow rounded-md">
              <h2 className="text-lg font-semibold mb-4">Income</h2>
              <p>
                Total Income: <span className="font-medium">$</span>
                {getIncome()}
              </p>
            </div>
          )}
        </main>

        {/* Modals */}
        <UserDetailModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          user={selectedUser}
          onDelete={handleDeleteUser}
          markAsPaid={markAsPaid}
        />
        <UserAddModal
          isOpen={userAddModalOpen}
          onClose={() => setUserAddModalOpen(false)}
          onAddUser={handleAddUser}
        />
      </div>
    </div>
  );
};

export default Dashboard;
