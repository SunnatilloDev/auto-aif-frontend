// components/UserAddModal.js
import { useState } from "react";

const UserAddModal = ({ isOpen, onClose, onAddUser }) => {
  const [newUser, setNewUser] = useState({
    fullName: "",
    number: "",
    password: "",
    isPaid: false,
    todaysBalance: 0,
    allBalance: 0,
    packages: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
    setNewUser((prev) => ({ ...prev, isPaid: value == "true" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddUser(newUser);
    onClose();

    console.log(newUser);

    setNewUser({
      fullName: "",
      number: "",
      password: "",
      isPaid: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Add New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Full Name:</label>
            <input
              type="text"
              name="fullName"
              value={newUser.fullName}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Number:</label>
            <input
              type="text"
              name="number"
              value={newUser.number}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password:</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Is Paid:</label>
            <select
              name="isPaid"
              value={newUser.isPaid}
              onChange={(e) => handleInputChange(e)}
              className="border border-gray-300 rounded p-2 w-full"
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 p-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="p-2 bg-indigo-600 text-white rounded"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAddModal;
