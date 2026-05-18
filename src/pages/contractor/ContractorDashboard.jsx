import "../stub.css";

export default function ContractorDashboard() {
  const stats = [
    { title: "Submitted Bids", value: 18 },
    { title: "Awards Won", value: 6 },
    { title: "Reputation Score", value: "92%" },
    { title: "Current Ranking", value: "#3" },
  ];

  const bidActivity = [
    {
      tender: "Road Construction",
      amount: "KES 1,200,000",
      status: "Under Review",
      ranking: "#2",
    },
    {
      tender: "ICT Equipment Supply",
      amount: "KES 450,000",
      status: "Awarded",
      ranking: "#1",
    },
    {
      tender: "School Renovation",
      amount: "KES 870,000",
      status: "Flagged",
      ranking: "#5",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Contractor Dashboard</h1>
        <p>
          Track bids, rankings, awards, and contractor performance.
        </p>
      </div>

      {/* STATS */}
      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <div key={index} className="dashboard-card">
            <h3>{stat.title}</h3>
            <h1>{stat.value}</h1>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="dashboard-section">
        <h2>Recent Bid Activity</h2>

        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Tender</th>
              <th>Bid Amount</th>
              <th>Status</th>
              <th>Ranking</th>
            </tr>
          </thead>

          <tbody>
            {bidActivity.map((item, index) => (
              <tr key={index}>
                <td>{item.tender}</td>
                <td>{item.amount}</td>
                <td>{item.status}</td>
                <td>{item.ranking}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}