import axios from "axios";

const UserDetailModal = ({ isOpen, onClose, user, onDelete, markAsPaid }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-semibold">User Details</h2>
        {user && (
          <div>
            <p>
              <strong>Full Name:</strong> {user.fullName}
            </p>
            <p>
              <strong>Number:</strong> {user.number}
            </p>
            <p>
              <strong>Password:</strong> {user.password}
            </p>
            <p>
              <strong>Is Done:</strong> {user.isDone ? "Yes" : "No"}
            </p>
            <p>
              <strong>Today's Balance:</strong> {user.todaysBalance}
            </p>
            <p>
              <strong>All Balance:</strong> {user.allBalance}
            </p>
            <p>
              <strong>Packages:</strong> {user?.packages?.join(", ")}
            </p>
            <p>
              <strong>Is Paid:</strong> {user.isPaid ? "Yes" : "No"}
            </p>
          </div>
        )}
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={onDelete}
          >
            Delete
          </button>
          <button
            className="px-4 py-2 bg-blue-500 ml-2 text-white rounded"
            onClick={() => {
              markAsPaid(user);
              onClose();
            }}
          >
            {user.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded ml-2"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
