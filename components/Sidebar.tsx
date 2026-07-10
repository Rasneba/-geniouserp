export default function Sidebar() {
  return (
    <div className="bg-dark text-white p-3" style={{ width: "250px", height: "100vh" }}>
      <h4>HRMS</h4>
      <ul className="list-unstyled mt-4">
        <li>Dashboard</li>
        <li>Employees</li>
        <li>Payroll</li>
        <li>Attendance</li>
      </ul>
    </div>
  );
}