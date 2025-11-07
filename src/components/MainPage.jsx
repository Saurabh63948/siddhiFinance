import React, { useState } from "react";
import DashboardPage from "./DashboardPage";
import UserDetailsPage from "./UserDetailsPage";

const MainPage = () => {
  const [people, setPeople] = useState([
    {
      name: "Ravi Kumar",
      loanAmount: 1000,
      percentage: 20,
      totalRepayable: 1200,
      remaining: 1120,
      dailyRepayment: 40,
      startDate: "2025-04-01",
      endDate: "2025-04-30",
      repaymentHistory: [
        { date: "2025-04-01", amountPaid: 40 },
        { date: "2025-04-02", amountPaid: 0 },
        { date: "2025-04-03", amountPaid: 0 },
      ],
      fines: [{ date: "2025-04-03", amount: 10, reason: "Late Fee" }],
    },
  ]);

  const [selectedUserIndex, setSelectedUserIndex] = useState(null);

  return (
    <div className="container mt-4">
      {selectedUserIndex === null ? (
        <DashboardPage
          people={people}
          setPeople={setPeople}
          isHost={true}
          onUserSelect={(index) => setSelectedUserIndex(index)}
        />
      ) : (
        <UserDetailsPage
          user={people[selectedUserIndex]}
          setUser={(updatedUser) => {
            const updated = [...people];
            updated[selectedUserIndex] = updatedUser;
            setPeople(updated);
          }}
          onBack={() => setSelectedUserIndex(null)}
          isHost={true}
        />
      )}
    </div>
  );
};

export default MainPage;
