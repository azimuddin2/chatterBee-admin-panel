"use client";

import Image from "next/image";

export default function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction,
}) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#343434] text-white p-6 rounded-lg shadow-lg relative w-full max-w-md mx-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex items-center mb-6">
          <div className="w-16 h-16 relative rounded-full overflow-hidden mr-4">
            <Image
              src={transaction.userImagePath} // Use the userImagePath from the transaction prop
              alt={transaction.fullName || "User"}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div>
            <p className="text-lg font-bold">
              Full name: {transaction.fullName}
            </p>
            <p className="text-sm">Email: {transaction.email}</p>
            <p className="text-sm">Phone number: {transaction.phone}</p>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4">Transaction Details:</h3>
        <div className="space-y-2">
          <p>
            Transaction ID:{" "}
            <span className="font-semibold">{transaction.transactionID}</span>
          </p>
          <p>
            A/C holder name:{" "}
            <span className="font-semibold">{transaction.accHolderName}</span>
          </p>
          <p>
            A/C number:{" "}
            <span className="font-semibold">{transaction.accNumber}</span>
          </p>
          <p>
            Received amount:{" "}
            <span className="font-semibold">${transaction.receivedAmount}</span>
          </p>
          <p>
            Detect Percentage:{" "}
            <span className="font-semibold">
              ${transaction.detectPercentage}
            </span>
          </p>
          <p>
            Final Amount:{" "}
            <span className="font-semibold">${transaction.finalAmount}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
