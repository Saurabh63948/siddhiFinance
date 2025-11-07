// import React from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";

// const NavBar = ({ isLoggedIn, isHost, toggleLogin, searchText, setSearchText }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogout = () => {
//     toggleLogin();
//     setSearchText(""); // Clear search bar on logout
//     navigate("/");
//   };

//   const handleLogin = () => {
//     navigate("/login");
//   };

//   const showSearch =
//     isHost &&
//     (location.pathname.startsWith("/dashboard") ||
//       location.pathname.startsWith("/user"));

//   return (
//     <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-4">
//       <div className="container-fluid">
//         <Link to="/" className="navbar-brand d-flex align-items-center">
//           <img src="/logo.png" alt="Logo" width="40" height="40" className="me-2" />
//           <span>MyFinanceApp</span>
//         </Link>

//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarContent"
//           aria-controls="navbarContent"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         <div className="collapse navbar-collapse" id="navbarContent">
//           <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex align-items-center">
//             <li className="nav-item">
//               <Link
//                 to="/"
//                 className={`nav-link text-white me-3 ${
//                   location.pathname === "/" ? "fw-bold" : ""
//                 }`}
//               >
//                 Home
//               </Link>
//             </li>

//             {isLoggedIn && isHost && (
//               <>
//                 <li className="nav-item">
//                   <Link
//                     to="/add"
//                     className={`nav-link text-white me-3 ${
//                       location.pathname === "/add" ? "fw-bold" : ""
//                     }`}
//                   >
//                     Add
//                   </Link>
//                 </li>
//                 <li className="nav-item">
//                   <Link
//                     to="/dashboard"
//                     className={`nav-link text-white me-3 ${
//                       location.pathname === "/dashboard" ? "fw-bold" : ""
//                     }`}
//                   >
//                     Dashboard
//                   </Link>
//                 </li>
//               </>
//             )}

//             {showSearch && (
//               <li className="nav-item">
//                 <input
//                   type="text"
//                   className="form-control me-3"
//                   style={{ maxWidth: "200px" }}
//                   placeholder="Search by name or Aadhaar"
//                   value={searchText}
//                   onChange={(e) => setSearchText(e.target.value)}
//                 />
//               </li>
//             )}

//             <li className="nav-item">
//               {!isLoggedIn ? (
//                 <button
//                   className="btn btn-outline-light"
//                   onClick={handleLogin}
//                   aria-label="Login"
//                 >
//                   Login
//                 </button>
//               ) : (
//                 <button
//                   className="btn btn-outline-light"
//                   onClick={handleLogout}
//                   aria-label="Logout"
//                 >
//                   Logout
//                 </button>
//               )}
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default NavBar;



"use client"
import { useNavigate } from "react-router-dom"
import "./NavBar.css"

const NavBar = ({ isLoggedIn, isAdmin, toggleLogin }) => {
  const navigate = useNavigate()
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" href="/">
          💰 Finance Manager
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isLoggedIn && isAdmin && (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/dashboard">
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/add">
                    Add Customer
                  </a>
                </li>
              </>
            )}
            {isLoggedIn && !isAdmin && (
              <li className="nav-item">
                <a className="nav-link" href="/my-account">
                  My Account
                </a>
              </li>
            )}
            {isLoggedIn && (
              <li className="nav-item">
                <span className="nav-link">{user?.name || "User"}</span>
              </li>
            )}
            {isLoggedIn && (
              <li className="nav-item">
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={() => {
                    toggleLogin()
                    navigate("/")
                  }}
                >
                  Logout
                </button>
              </li>
            )}
            {!isLoggedIn && (
              <li className="nav-item">
                <a className="nav-link" href="/login">
                  Login
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
