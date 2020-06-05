import React from "react";
import { Link } from "react-router-dom";

// import "bootstrap/dist/css/bootstrap.min.css";

function NotFound(props) {
  return (
    <div className="bg-white">
      {/* <!-- 404 Error Text --> */}
      <div className="text-center">
        <div className="error mx-auto" data-text="404">
          404
        </div>
        <p className="lead text-gray-800 mb-2">Page Not Found</p>
        <div className="bg-not-found-image mx-auto"></div>
        <p className="text-gray-500 mb-0">
          It looks like you found a glitch in the matrix...
        </p>
        <Link to="/">&larr; Back to the safe zone</Link>
      </div>
      {/* Footer */}
      <footer className="sticky-footer bg-white">
        <div className="container my-auto">
          <div className="copyright text-center my-auto">
            <span>Copyright &copy; CryptoContracts 2020</span>
          </div>
        </div>
      </footer>
      {/* End of Footer */}
    </div>
  );
}

export default NotFound;
